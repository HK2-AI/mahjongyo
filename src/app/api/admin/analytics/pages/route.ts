import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

interface PageRow {
  page: string
  views: bigint
  visitors: bigint
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const rows = await prisma.$queryRaw<PageRow[]>`
      SELECT
        page,
        COUNT(*) as views,
        COUNT(DISTINCT "sessionId") as visitors
      FROM "Event"
      WHERE "eventType" = 'page_view' AND page IS NOT NULL
      GROUP BY page
      ORDER BY views DESC
    `

    const pages = rows.map((r) => ({
      page: r.page,
      views: Number(r.views),
      visitors: Number(r.visitors),
    }))

    return NextResponse.json({ pages })
  } catch (err) {
    console.error('Error fetching page analytics:', err)
    return NextResponse.json({ error: 'Failed to fetch page analytics' }, { status: 500 })
  }
}
