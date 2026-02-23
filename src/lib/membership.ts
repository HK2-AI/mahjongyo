// Membership tiers and pricing configuration
export const MEMBERSHIP_TIERS = {
  ROOKIE: 'rookie',
  PLAYER: 'player',
  PRO: 'pro',
  MASTER: 'master',
  LEGEND: 'legend',
} as const

export type MembershipTier = typeof MEMBERSHIP_TIERS[keyof typeof MEMBERSHIP_TIERS]

export interface MembershipConfig {
  id: MembershipTier
  name: string
  nameZh: string
  spendingThreshold: number // in cents (累計消費門檻)
  peakPrice: number // in cents (繁忙時間價格)
  offPeakPrice: number // in cents (非繁忙時間價格)
  color: string
  description: string
  descriptionZh: string
}

export const MEMBERSHIPS: MembershipConfig[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    nameZh: '新手',
    spendingThreshold: 0,
    peakPrice: 50000, // $500
    offPeakPrice: 50000, // $500
    color: 'gray',
    description: 'Standard pricing for all time slots',
    descriptionZh: '所有時段標準價格',
  },
  {
    id: 'player',
    name: 'Player',
    nameZh: '牌友',
    spendingThreshold: 100000, // $1,000 total spending
    peakPrice: 38000, // $380
    offPeakPrice: 29000, // $290
    color: 'blue',
    description: 'Save up to 42% on off-peak bookings',
    descriptionZh: '非繁忙時段最高節省42%',
  },
  {
    id: 'pro',
    name: 'Pro',
    nameZh: '高手',
    spendingThreshold: 380000, // $3,800 total spending
    peakPrice: 38000, // $380
    offPeakPrice: 29000, // $290
    color: 'purple',
    description: 'Same great rates as Player',
    descriptionZh: '與牌友相同優惠',
  },
  {
    id: 'master',
    name: 'Master',
    nameZh: '大師',
    spendingThreshold: 800000, // $8,000 total spending
    peakPrice: 36000, // $360
    offPeakPrice: 27500, // $275
    color: 'orange',
    description: 'Premium rates with better savings',
    descriptionZh: '尊享優惠價格',
  },
  {
    id: 'legend',
    name: 'Legend',
    nameZh: '傳奇',
    spendingThreshold: 1500000, // $15,000 total spending
    peakPrice: 34000, // $340
    offPeakPrice: 25000, // $250
    color: 'amber',
    description: 'Best rates - save up to 50%',
    descriptionZh: '最優惠價格，最高節省50%',
  },
]

// Peak hours: Weekends & holidays 16:00-22:00
// Off-peak: Weekdays 09:00-16:00
export function isPeakTime(date: string, startTime: string): boolean {
  const bookingDate = new Date(date + 'T00:00:00')
  const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 6 = Saturday
  const hour = parseInt(startTime.split(':')[0])

  // Weekend (Saturday or Sunday)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Peak hours: 16:00 - 22:00
  const isPeakHour = hour >= 16 && hour < 22

  // If weekend, all peak hours are peak pricing
  // If weekday, only 16:00-22:00 is peak pricing
  if (isWeekend) {
    return isPeakHour
  }

  return isPeakHour
}

export function getMembershipConfig(tier: MembershipTier): MembershipConfig {
  return MEMBERSHIPS.find(m => m.id === tier) || MEMBERSHIPS[0]
}

export function getBookingPrice(tier: MembershipTier, date: string, startTime: string): number {
  const config = getMembershipConfig(tier)
  const isPeak = isPeakTime(date, startTime)
  return isPeak ? config.peakPrice : config.offPeakPrice
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}

// Determine membership tier based on total spending
export function getMembershipBySpending(totalSpent: number): MembershipTier {
  // Find the highest tier the user qualifies for
  const eligibleTier = [...MEMBERSHIPS]
    .reverse()
    .find(m => totalSpent >= m.spendingThreshold)

  return eligibleTier?.id || 'rookie'
}

// Get the next tier and how much more spending needed
export function getNextTierInfo(totalSpent: number): { nextTier: MembershipConfig | null, amountNeeded: number } {
  const currentTierIndex = MEMBERSHIPS.findIndex(m => totalSpent < m.spendingThreshold)

  if (currentTierIndex === -1) {
    // Already at highest tier
    return { nextTier: null, amountNeeded: 0 }
  }

  const nextTier = MEMBERSHIPS[currentTierIndex]
  const amountNeeded = nextTier.spendingThreshold - totalSpent

  return { nextTier, amountNeeded }
}
