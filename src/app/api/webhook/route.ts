import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Handle booking payment
    if (session.metadata?.bookingId) {
      const bookingId = session.metadata.bookingId
      const userId = session.metadata.userId
      const price = parseInt(session.metadata.price || '0')

      // Get user and update spending
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        const newTotalSpent = (user.totalSpent || 0) + price

        // Update booking status and user spending
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'confirmed' }
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              totalSpent: newTotalSpent,
            }
          }),
          prisma.transaction.create({
            data: {
              userId: userId,
              type: 'booking',
              amount: -price,
              description: `Booking payment`,
              paymentId: session.payment_intent as string,
            }
          })
        ])
      } else {
        // Just update booking if user not found
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'confirmed' }
        })
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.metadata?.bookingId) {
      // Delete pending booking if payment expired
      await prisma.booking.delete({
        where: { id: session.metadata.bookingId }
      }).catch(() => {
        // Booking might have been already deleted
      })
    }
  }

  return NextResponse.json({ received: true })
}
