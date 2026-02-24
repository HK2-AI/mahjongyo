import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getBookingPrice, isPeakTime } from '@/lib/membership'

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
    const { date, startTimes } = body

    if (!date || !startTimes || !Array.isArray(startTimes) || startTimes.length === 0) {
      return NextResponse.json(
        { error: 'Date and at least one time slot are required' },
        { status: 400 }
      )
    }

    // Sort times for consecutive validation
    const sorted = [...startTimes].sort()

    // Validate consecutive
    for (let i = 1; i < sorted.length; i++) {
      const prevHour = parseInt(sorted[i - 1].split(':')[0])
      const currHour = parseInt(sorted[i].split(':')[0])
      if (currHour !== prevHour + 1) {
        return NextResponse.json(
          { error: 'Time slots must be consecutive' },
          { status: 400 }
        )
      }
    }

    // Check all slots are available
    const existingBookings = await prisma.booking.findMany({
      where: {
        date,
        startTime: { in: sorted },
        status: 'confirmed'
      }
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'One or more time slots are no longer available' },
        { status: 409 }
      )
    }

    // Build booking data for each slot
    const bookingDataList = sorted.map(startTime => {
      const startHour = parseInt(startTime.split(':')[0])
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`
      const price = getBookingPrice(date, startTime)
      const isPeak = isPeakTime(date, startTime)
      return { startTime, endTime, price, isPeak }
    })

    const totalPrice = bookingDataList.reduce((sum, b) => sum + b.price, 0)

    // Create all pending bookings in a transaction
    const bookings = await prisma.$transaction(
      bookingDataList.map(b =>
        prisma.booking.create({
          data: {
            date,
            startTime: b.startTime,
            endTime: b.endTime,
            userId: user.id,
            status: 'pending',
            amount: b.price,
            isPeak: b.isPeak
          }
        })
      )
    )

    const bookingIds = bookings.map(b => b.id).join(',')

    // Format date for display (HK timezone)
    const displayDate = new Date(date + 'T12:00:00Z').toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Hong_Kong'
    })

    const firstTime = sorted[0]
    const lastHour = parseInt(sorted[sorted.length - 1].split(':')[0]) + 1
    const endTimeDisplay = `${String(lastHour).padStart(2, '0')}:00`
    const numHours = sorted.length

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `麻雀Party Room 預約`,
              description: `${displayDate} ${firstTime}-${endTimeDisplay} (${numHours}小時)`
            },
            unit_amount: totalPrice
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/book?cancelled=true`,
      metadata: {
        bookingIds,
        userId: user.id,
        price: totalPrice.toString()
      },
      customer_email: user.email
    })

    return NextResponse.json({ url: checkoutSession.url, bookingIds })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
