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

    const bookingIdsRaw = session.metadata?.bookingIds || session.metadata?.bookingId
    if (bookingIdsRaw) {
      const bookingIds = bookingIdsRaw.split(',')
      const userId = session.metadata?.userId
      const price = parseInt(session.metadata?.price || '0')

      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
      if (user) {
        const newTotalSpent = (user.totalSpent || 0) + price

        await prisma.$transaction([
          ...bookingIds.map(id =>
            prisma.booking.update({
              where: { id },
              data: { status: 'confirmed' }
            })
          ),
          prisma.user.update({
            where: { id: userId! },
            data: {
              totalSpent: newTotalSpent,
            }
          }),
          prisma.transaction.create({
            data: {
              userId: userId!,
              type: 'booking',
              amount: -price,
              description: `Booking payment`,
              paymentId: session.payment_intent as string,
            }
          })
        ])
      } else {
        await prisma.$transaction(
          bookingIds.map(id =>
            prisma.booking.update({
              where: { id },
              data: { status: 'confirmed' }
            })
          )
        )
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session

    const bookingIdsRaw = session.metadata?.bookingIds || session.metadata?.bookingId
    if (bookingIdsRaw) {
      const bookingIds = bookingIdsRaw.split(',')
      await Promise.all(
        bookingIds.map(id =>
          prisma.booking.delete({ where: { id } }).catch(() => {
            // Booking might have been already deleted
          })
        )
      )
    }
  }

  return NextResponse.json({ received: true })
}
