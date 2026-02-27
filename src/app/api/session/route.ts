import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { lookupCountry } from '@/lib/geoip'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, referrer, landingPage } = body

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId is required' }, { status: 400 })
    }

    // Get user agent and IP from headers
    const userAgent = request.headers.get('user-agent') || null
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    // Resolve country from IP
    const country = ipAddress ? await lookupCountry(ipAddress) : null

    // Use upsert to handle race conditions
    const session = await prisma.session.upsert({
      where: { visitorId },
      update: {
        lastActiveAt: new Date(),
      },
      create: {
        visitorId,
        userAgent,
        ipAddress,
        country,
        referrer,
        landingPage,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// Link session to user (called after login/signup)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, userId, email } = body

    if (!visitorId || (!userId && !email)) {
      return NextResponse.json({ error: 'visitorId and userId/email are required' }, { status: 400 })
    }

    let resolvedUserId = userId

    // If email provided, find user by email
    if (email && !userId) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      })
      if (user) {
        resolvedUserId = user.id
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update session with userId
    const session = await prisma.session.update({
      where: { visitorId },
      data: { userId: resolvedUserId },
    })

    // Also update user's sessionId if not already set
    await prisma.user.update({
      where: { id: resolvedUserId },
      data: { sessionId: visitorId }
    }).catch(() => {})

    return NextResponse.json({ success: true, sessionId: session.id })
  } catch (error) {
    console.error('Error linking session to user:', error)
    return NextResponse.json({ error: 'Failed to link session' }, { status: 500 })
  }
}
