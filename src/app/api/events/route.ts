import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, eventType, eventData, page, element } = body

    if (!visitorId || !eventType) {
      return NextResponse.json(
        { error: 'visitorId and eventType are required' },
        { status: 400 }
      )
    }

    // Find session by visitorId
    const session = await prisma.session.findUnique({
      where: { visitorId },
    })

    if (!session) {
      // Auto-create session if it doesn't exist
      const userAgent = request.headers.get('user-agent') || null
      const newSession = await prisma.session.create({
        data: {
          visitorId,
          userAgent,
        },
      })

      // Create event with new session
      const event = await prisma.event.create({
        data: {
          sessionId: newSession.id,
          eventType,
          eventData,
          page,
          element,
        },
      })

      return NextResponse.json({ eventId: event.id })
    }

    // Update session last active time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    })

    // Create event
    const event = await prisma.event.create({
      data: {
        sessionId: session.id,
        eventType,
        eventData,
        page,
        element,
      },
    })

    return NextResponse.json({ eventId: event.id })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

// Get events for analysis (admin use)
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')
  const eventType = searchParams.get('eventType')
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const where: Record<string, unknown> = {}

    if (sessionId) {
      where.sessionId = sessionId
    }
    if (eventType) {
      where.eventType = eventType
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        session: {
          select: {
            visitorId: true,
            userId: true,
            userAgent: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.event.count({ where })

    return NextResponse.json({ events, total, limit, offset })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
