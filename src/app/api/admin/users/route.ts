import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: { select: { bookings: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.user.count()
    ])

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? '',
        membership: u.membership,
        balance: u.balance,
        totalSpent: u.totalSpent,
        isAdmin: u.isAdmin,
        bookingCount: u._count.bookings,
        createdAt: u.createdAt
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error('Admin users error:', err)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
