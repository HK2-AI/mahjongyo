import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Start of week (Monday)
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - mondayOffset)
    const weekStartStr = weekStart.toISOString().split('T')[0]

    // Start of month
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const [
      todayBookings,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalUsers,
      recentBookings
    ] = await Promise.all([
      prisma.booking.count({
        where: { date: todayStr, status: 'confirmed' }
      }),
      prisma.booking.aggregate({
        where: { date: todayStr, status: 'confirmed' },
        _sum: { amount: true }
      }),
      prisma.booking.aggregate({
        where: { date: { gte: weekStartStr }, status: 'confirmed' },
        _sum: { amount: true }
      }),
      prisma.booking.aggregate({
        where: { date: { gte: monthStartStr }, status: 'confirmed' },
        _sum: { amount: true }
      }),
      prisma.user.count(),
      prisma.booking.findMany({
        where: { status: 'confirmed' },
        include: {
          user: { select: { name: true, email: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    return NextResponse.json({
      todayBookings,
      todayRevenue: todayRevenue._sum.amount ?? 0,
      weekRevenue: weekRevenue._sum.amount ?? 0,
      monthRevenue: monthRevenue._sum.amount ?? 0,
      totalUsers,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        amount: b.amount,
        isPeak: b.isPeak,
        customerName: b.user.name,
        customerEmail: b.user.email,
        customerPhone: b.user.phone ?? '',
        createdAt: b.createdAt
      }))
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
