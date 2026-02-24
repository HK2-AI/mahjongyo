import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit

  try {
    const where: Record<string, unknown> = { status: 'confirmed' }

    if (dateFrom && dateTo) {
      where.date = { gte: dateFrom, lte: dateTo }
    } else if (dateFrom) {
      where.date = { gte: dateFrom }
    } else if (dateTo) {
      where.date = { lte: dateTo }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, membership: true } }
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        take: limit,
        skip
      }),
      prisma.booking.count({ where })
    ])

    return NextResponse.json({
      bookings: bookings.map(b => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        amount: b.amount,
        isPeak: b.isPeak,
        status: b.status,
        customerName: b.user.name,
        customerEmail: b.user.email,
        customerPhone: b.user.phone ?? '',
        customerMembership: b.user.membership,
        createdAt: b.createdAt
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error('Admin bookings error:', err)
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 })
  }
}
