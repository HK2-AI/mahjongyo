import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        orderBy: { lastActiveAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { events: true } },
          events: {
            select: { createdAt: true, eventType: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.session.count(),
    ])

    // Batch resolve userIds to user names
    const userIds = sessions
      .map((s) => s.userId)
      .filter((id): id is string => id !== null)
    const uniqueUserIds = Array.from(new Set(userIds))

    const users =
      uniqueUserIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: uniqueUserIds } },
            select: { id: true, name: true },
          })
        : []

    const userMap = new Map(users.map((u) => [u.id, u.name]))

    const items = sessions.map((s) => {
      const firstEvent = s.events[0]
      const lastEvent = s.events[s.events.length - 1]
      const duration =
        firstEvent && lastEvent
          ? formatDuration(
              new Date(lastEvent.createdAt).getTime() -
                new Date(firstEvent.createdAt).getTime()
            )
          : '0s'
      const converted = s.events.some(
        (e) => e.eventType === 'booking_complete'
      )

      return {
        visitorId: s.visitorId,
        userName: s.userId ? userMap.get(s.userId) || null : null,
        eventCount: s._count.events,
        duration,
        converted,
        landingPage: s.landingPage,
        referrer: s.referrer,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
      }
    })

    return NextResponse.json({
      sessions: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Error fetching sessions:', err)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
