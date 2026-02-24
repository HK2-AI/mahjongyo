import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find sessions linked to this user
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { events: true } },
      },
    })

    const { password: _, ...safeUser } = user

    return NextResponse.json({ user: safeUser, sessions })
  } catch (err) {
    console.error('Error fetching user detail:', err)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
