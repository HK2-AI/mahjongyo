import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const all = searchParams.get('all')

  try {
    const session = await getServerSession(authOptions)

    if (all === 'true') {
      const { error } = await requireAdmin()
      if (error) return error

      const bookings = await prisma.booking.findMany({
        where: { status: 'confirmed' },
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
      })

      return NextResponse.json({
        bookings: bookings.map(b => ({
          id: b.id,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          customerName: b.user.name,
          customerEmail: b.user.email,
          customerPhone: b.user.phone || '',
          status: b.status,
          amount: b.amount,
          createdAt: b.createdAt
        }))
      })
    }

    // User must be logged in to see their bookings
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: 'confirmed'
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    })

    return NextResponse.json({
      bookings: bookings.map(b => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        amount: b.amount,
        createdAt: b.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
