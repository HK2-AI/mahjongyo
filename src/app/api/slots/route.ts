import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNowHK } from '@/lib/hktime'

const OPERATING_HOURS = {
  start: 0,
  end: 24  // 24 hours
}

// Simple deterministic hash from date string → number
function hashDate(date: string): number {
  let h = 0
  for (let i = 0; i < date.length; i++) {
    h = ((h << 5) - h + date.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Deterministic pseudo-random sequence from a seed
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

// Generate fake booked hours for a date (~1/3 of slots, preserving consecutive free blocks)
function getFakeBookedHours(date: string): Set<number> {
  const seed = hashDate(date)
  const rand = seededRandom(seed)

  // Pick ~8 hours out of 24 to fake-book (about 1/3)
  const TARGET = 8
  const fakeBooked = new Set<number>()

  // Strategy: scatter individual bookings and small clusters,
  // but ensure at least 2-3 consecutive free blocks of 3+ hours exist
  const candidates: number[] = []
  for (let h = 0; h < 24; h++) {
    candidates.push(h)
  }

  // Shuffle candidates deterministically
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
  }

  for (const hour of candidates) {
    if (fakeBooked.size >= TARGET) break

    // Check: would adding this hour break a consecutive free block?
    // Count how many consecutive free hours exist around this hour
    let freeStart = hour
    while (freeStart > 0 && !fakeBooked.has(freeStart - 1)) freeStart--
    let freeEnd = hour
    while (freeEnd < 23 && !fakeBooked.has(freeEnd + 1)) freeEnd++
    const blockSize = freeEnd - freeStart + 1

    // Only book if the remaining free block on at least one side is >= 3
    const leftRemain = hour - freeStart
    const rightRemain = freeEnd - hour
    if (leftRemain >= 3 || rightRemain >= 3 || blockSize <= 2) {
      fakeBooked.add(hour)
    }
  }

  return fakeBooked
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  try {
    // Get all paid or pending bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        date,
        status: { not: 'cancelled' }
      },
      select: { startTime: true }
    })

    const realBookedTimes = new Set(bookings.map(b => b.startTime))
    const fakeBookedHours = getFakeBookedHours(date)

    const nowHK = getNowHK()
    const isToday = date === nowHK.date

    const slots = []
    for (let hour = OPERATING_HOURS.start; hour < OPERATING_HOURS.end; hour++) {
      const startTime = `${String(hour).padStart(2, '0')}:00`
      const endTime = `${String(hour + 1).padStart(2, '0')}:00`

      const isRealBooking = realBookedTimes.has(startTime)
      const isFakeBooking = !isRealBooking && fakeBookedHours.has(hour)
      const isBooked = isRealBooking || isFakeBooking
      const isPast = isToday && hour <= nowHK.hour
      const available = !isBooked && !isPast

      slots.push({ startTime, endTime, available, isPast, isBooked })
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}
