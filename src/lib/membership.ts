// Flat pricing configuration
export const PEAK_PRICE = 5000 // $50/hr
export const OFF_PEAK_PRICE = 4000 // $40/hr

// Peak = Mon-Thu after 6pm, Fri-Sun all day, public holidays
// Off-peak = Mon-Thu before 6pm
export function isPeakTime(date: string, startTime: string): boolean {
  const bookingDate = new Date(date + 'T00:00:00')
  const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 6 = Saturday
  const hour = parseInt(startTime.split(':')[0])

  // Friday (5), Saturday (6), Sunday (0) = always peak
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
  if (isWeekend) {
    return true
  }

  // Mon-Thu: peak if 6pm or later
  return hour >= 18
}

export function getBookingPrice(date: string, startTime: string): number {
  return isPeakTime(date, startTime) ? PEAK_PRICE : OFF_PEAK_PRICE
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}
