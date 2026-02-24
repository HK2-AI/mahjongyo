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
    const { date, startTimes, nextDate, nextDateStartTimes } = body

    if (!date || !startTimes || !Array.isArray(startTimes) || startTimes.length === 0) {
      return NextResponse.json(
        { error: 'Date and at least one time slot are required' },
        { status: 400 }
      )
    }

    // Sort times for consecutive validation
    const sorted = [...startTimes].sort()

    // Validate Day 1 consecutive
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

    // Cross-midnight validation
    const hasCrossMidnight = nextDate && nextDateStartTimes && Array.isArray(nextDateStartTimes) && nextDateStartTimes.length > 0
    let sortedNextTimes: string[] = []

    if (hasCrossMidnight) {
      // Validate nextDate is exactly the day after date
      const d1 = new Date(date + 'T00:00:00')
      const d2 = new Date(nextDate + 'T00:00:00')
      const diffMs = d2.getTime() - d1.getTime()
      if (diffMs !== 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Next date must be the day after the booking date' },
          { status: 400 }
        )
      }

      // Day 1 must end with 23:00
      if (sorted[sorted.length - 1] !== '23:00') {
        return NextResponse.json(
          { error: 'Cross-midnight booking requires 23:00 on the first day' },
          { status: 400 }
        )
      }

      sortedNextTimes = [...nextDateStartTimes].sort()

      // Day 2 must start at 00:00
      if (sortedNextTimes[0] !== '00:00') {
        return NextResponse.json(
          { error: 'Cross-midnight booking must start at 00:00 on the next day' },
          { status: 400 }
        )
      }

      // Day 2 times must be consecutive
      for (let i = 1; i < sortedNextTimes.length; i++) {
        const prevHour = parseInt(sortedNextTimes[i - 1].split(':')[0])
        const currHour = parseInt(sortedNextTimes[i].split(':')[0])
        if (currHour !== prevHour + 1) {
          return NextResponse.json(
            { error: 'Next day time slots must be consecutive' },
            { status: 400 }
          )
        }
      }
    }

    // Check all Day 1 slots are available
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

    // Check Day 2 slots availability if cross-midnight
    if (hasCrossMidnight) {
      const existingNextBookings = await prisma.booking.findMany({
        where: {
          date: nextDate,
          startTime: { in: sortedNextTimes },
          status: 'confirmed'
        }
      })

      if (existingNextBookings.length > 0) {
        return NextResponse.json(
          { error: 'One or more time slots on the next day are no longer available' },
          { status: 409 }
        )
      }
    }

    // Build booking data for Day 1
    const bookingDataList = sorted.map(startTime => {
      const startHour = parseInt(startTime.split(':')[0])
      const endTime = `${String(startHour + 1).padStart(2, '0')}:00`
      const price = getBookingPrice(date, startTime)
      const isPeak = isPeakTime(date, startTime)
      return { date, startTime, endTime, price, isPeak }
    })

    // Build booking data for Day 2
    if (hasCrossMidnight) {
      sortedNextTimes.forEach(startTime => {
        const startHour = parseInt(startTime.split(':')[0])
        const endTime = `${String(startHour + 1).padStart(2, '0')}:00`
        const price = getBookingPrice(nextDate, startTime)
        const isPeak = isPeakTime(nextDate, startTime)
        bookingDataList.push({ date: nextDate, startTime, endTime, price, isPeak })
      })
    }

    const totalPrice = bookingDataList.reduce((sum, b) => sum + b.price, 0)

    // Create all pending bookings in a transaction
    const bookings = await prisma.$transaction(
      bookingDataList.map(b =>
        prisma.booking.create({
          data: {
            date: b.date,
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
    const allSortedTimes = hasCrossMidnight ? [...sorted, ...sortedNextTimes] : sorted
    const lastSortedTimes = hasCrossMidnight ? sortedNextTimes : sorted
    const lastHour = parseInt(lastSortedTimes[lastSortedTimes.length - 1].split(':')[0]) + 1
    const endTimeDisplay = `${String(lastHour).padStart(2, '0')}:00`
    const numHours = allSortedTimes.length

    let description = `${displayDate} ${firstTime}-${endTimeDisplay} (${numHours}小時)`
    if (hasCrossMidnight) {
      const displayNextDate = new Date(nextDate + 'T12:00:00Z').toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Hong_Kong'
      })
      description = `${displayDate} ${firstTime} - ${displayNextDate} ${endTimeDisplay} (${numHours}小時)`
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: `麻雀Party Room 預約`,
              description
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
