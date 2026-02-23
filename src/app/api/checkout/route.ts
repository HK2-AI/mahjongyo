import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getBookingPrice, isPeakTime, MembershipTier } from '@/lib/membership'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, startTime } = body

    if (!date || !startTime) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      )
    }

    // Check if slot is available
    const existingBooking = await prisma.booking.findFirst({
      where: { date, startTime, status: 'confirmed' }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Calculate end time
    const startHour = parseInt(startTime.split(':')[0])
    const endTime = `${String(startHour + 1).padStart(2, '0')}:00`

    // Calculate price based on membership
    const price = getBookingPrice(user.membership as MembershipTier, date, startTime)
    const isPeak = isPeakTime(date, startTime)

    // Format date for display
    const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Create pending booking
    const booking = await prisma.booking.create({
      data: {
        date,
        startTime,
        endTime,
        userId: user.id,
        status: 'pending',
        amount: price,
        isPeak
      }
    })

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `麻雀Party Room 預約`,
              description: `${displayDate} ${startTime}-${endTime} (${isPeak ? '繁忙時段' : '非繁忙時段'})`
            },
            unit_amount: price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/book?cancelled=true`,
      metadata: {
        bookingId: booking.id,
        userId: user.id,
        price: price.toString()
      },
      customer_email: user.email
    })

    return NextResponse.json({ url: checkoutSession.url, bookingId: booking.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
