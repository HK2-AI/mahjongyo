import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

interface FunnelRow {
  eventType: string
  count: bigint
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const rows = await prisma.$queryRaw<FunnelRow[]>`
      SELECT "eventType", COUNT(DISTINCT "sessionId") as count
      FROM "Event"
      WHERE "eventType" IN ('page_view', 'booking_start', 'booking_confirm', 'booking_complete', 'signup', 'login')
      GROUP BY "eventType"
    `

    const countMap = new Map(
      rows.map((r) => [r.eventType, Number(r.count)])
    )

    const bookingFunnel = [
      { label: '瀏覽頁面', step: 'page_view', count: countMap.get('page_view') || 0 },
      { label: '開始預約', step: 'booking_start', count: countMap.get('booking_start') || 0 },
      { label: '確認預約', step: 'booking_confirm', count: countMap.get('booking_confirm') || 0 },
      { label: '完成預約', step: 'booking_complete', count: countMap.get('booking_complete') || 0 },
    ]

    const signupFunnel = [
      { label: '瀏覽頁面', step: 'page_view', count: countMap.get('page_view') || 0 },
      { label: '註冊', step: 'signup', count: countMap.get('signup') || 0 },
      { label: '登入', step: 'login', count: countMap.get('login') || 0 },
    ]

    return NextResponse.json({ bookingFunnel, signupFunnel })
  } catch (err) {
    console.error('Error fetching funnel data:', err)
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 })
  }
}
