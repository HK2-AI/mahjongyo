import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { visitorId } = await params

  try {
    const session = await prisma.session.findUnique({
      where: { visitorId },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    let user = null
    if (session.userId) {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true },
      })
    }

    return NextResponse.json({ session, user })
  } catch (err) {
    console.error('Error fetching session detail:', err)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}
