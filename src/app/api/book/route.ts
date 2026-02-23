import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBookingPrice, isPeakTime } from '@/lib/membership'

export async function POST(req: NextRequest) {
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

    const { date, startTime } = await req.json()

    if (!date || !startTime) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
    }

    // Calculate the booking price (flat pricing)
    const price = getBookingPrice(date, startTime)
    const isPeak = isPeakTime(date, startTime)

    // Check if user has sufficient balance
    if (user.balance < price) {
      return NextResponse.json(
        { error: 'Insufficient balance', required: price, balance: user.balance },
        { status: 400 }
      )
    }

    // Calculate end time (1 hour later)
    const [hours] = startTime.split(':')
    const endTime = `${String(parseInt(hours) + 1).padStart(2, '0')}:00`

    // Check if slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date,
        startTime,
        status: 'confirmed',
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: 'This slot is already booked' }, { status: 409 })
    }

    // Create booking and deduct balance in a transaction
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          date,
          startTime,
          endTime,
          userId: user.id,
          status: 'confirmed',
          amount: price,
          isPeak,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: user.balance - price,
          totalSpent: (user.totalSpent || 0) + price,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'booking',
          amount: -price,
          description: `Booking: ${date} ${startTime}-${endTime}`,
        },
      }),
    ])

    return NextResponse.json({ booking, success: true })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
