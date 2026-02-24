'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Calendar from '@/components/Calendar'
import TimeSlots from '@/components/TimeSlots'
import BookingForm from '@/components/BookingForm'
import Toast, { useToast } from '@/components/Toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { trackEvent, EventTypes } from '@/lib/tracking'

function CancelledBanner() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const cancelled = searchParams.get('cancelled')

  if (cancelled !== 'true') return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 animate-slide-down">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <p className="text-amber-800">{t.book.cancelledWarning}</p>
      </div>
    </div>
  )
}

function isNextDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1 + 'T00:00:00')
  const d2 = new Date(date2 + 'T00:00:00')
  const diff = d2.getTime() - d1.getTime()
  return diff === 24 * 60 * 60 * 1000
}

function BookingContent() {
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date') || ''
  const initialTimes = searchParams.get('times')?.split(',').filter(Boolean) || []
  const initialNextDate = searchParams.get('nextDate') || ''
  const initialNextDateTimes = searchParams.get('nextDateTimes')?.split(',').filter(Boolean) || []

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [selectedTimes, setSelectedTimes] = useState<string[]>(initialTimes)
  const [nextDate, setNextDate] = useState(initialNextDate)
  const [nextDateTimes, setNextDateTimes] = useState<string[]>(initialNextDateTimes)
  const [refreshKey, setRefreshKey] = useState(0)
  const toast = useToast()
  const { t, language } = useLanguage()

  const isCrossMidnight = nextDate !== '' && nextDateTimes.length > 0
  // When nextDate is set (even with 0 times selected yet), show nextDate slots
  const activeDate = nextDate || selectedDate

  // Track booking page start
  useEffect(() => {
    trackEvent(EventTypes.BOOKING_START)
  }, [])

  const handleDateSelect = (date: string) => {
    // If Day 1 has 23:00 selected and user clicks the next day → enter cross-midnight mode
    if (
      selectedDate &&
      selectedTimes.includes('23:00') &&
      isNextDay(selectedDate, date)
    ) {
      setNextDate(date)
      // Don't clear selectedTimes — keep Day 1 selections
      trackEvent(EventTypes.BOOKING_DATE_SELECT, { eventData: { date, crossMidnight: true } })
      return
    }

    // Normal date change: reset everything
    setSelectedDate(date)
    setSelectedTimes([])
    setNextDate('')
    setNextDateTimes([])
    trackEvent(EventTypes.BOOKING_DATE_SELECT, { eventData: { date } })
  }

  const handleTimesChange = (times: string[]) => {
    if (isCrossMidnight || nextDate) {
      // We're viewing the next-date TimeSlots — update nextDateTimes
      setNextDateTimes(times)
      if (times.length > 0) {
        trackEvent(EventTypes.BOOKING_TIME_SELECT, { eventData: { date: nextDate, times } })
      }
      // If all next-date times deselected, exit cross-midnight mode
      if (times.length === 0) {
        setNextDate('')
      }
    } else {
      setSelectedTimes(times)
      if (times.length > 0) {
        trackEvent(EventTypes.BOOKING_TIME_SELECT, { eventData: { date: selectedDate, times } })
      }
    }
  }

  const handleBookingComplete = () => {
    setSelectedTimes([])
    setNextDate('')
    setNextDateTimes([])
    setRefreshKey(prev => prev + 1)
  }

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${ampm}`
  }

  const getTimeRangeDisplay = () => {
    if (selectedTimes.length === 0) return ''
    const sorted = [...selectedTimes].sort()
    const firstTime = sorted[0]

    if (isCrossMidnight) {
      const sortedNext = [...nextDateTimes].sort()
      const lastNextHour = parseInt(sortedNext[sortedNext.length - 1].split(':')[0]) + 1
      const endTime = `${String(lastNextHour).padStart(2, '0')}:00`
      return `${formatTime(firstTime)} - ${formatTime(endTime)} +1`
    }

    const lastHour = parseInt(sorted[sorted.length - 1].split(':')[0]) + 1
    const endTime = `${String(lastHour).padStart(2, '0')}:00`
    return `${formatTime(firstTime)} - ${formatTime(endTime)}`
  }

  return (
    <>
      {selectedDate && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 animate-slide-down">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">{t.book.selectedDate}</p>
                <p className="font-semibold text-green-800">
                  {isCrossMidnight
                    ? `${formatShortDate(selectedDate)} - ${formatShortDate(nextDate)}`
                    : formatSelectedDate(selectedDate)}
                </p>
              </div>
            </div>
            {(selectedTimes.length > 0 || isCrossMidnight) && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600">{t.book.selectedTime}</p>
                  <p className="font-semibold text-green-800">{getTimeRangeDisplay()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              nextDate={nextDate}
            />
          </div>

          <div key={refreshKey}>
            {nextDate && (
              <div className="mb-4">
                <Day1Summary
                  date={formatShortDate(selectedDate)}
                  times={selectedTimes}
                  formatTime={formatTime}
                  onCancel={() => {
                    setNextDate('')
                    setNextDateTimes([])
                  }}
                  t={t}
                />
              </div>
            )}
            <TimeSlots
              selectedDate={activeDate}
              selectedTimes={nextDate ? nextDateTimes : selectedTimes}
              onTimesChange={handleTimesChange}
              crossMidnightFrom={nextDate ? selectedTimes : undefined}
              label={nextDate ? formatShortDate(nextDate) : undefined}
            />
          </div>

          <div>
            <BookingForm
              selectedDate={selectedDate}
              selectedTimes={selectedTimes}
              onBookingComplete={handleBookingComplete}
              onSuccess={toast.success}
              onError={toast.error}
              nextDate={nextDate}
              nextDateTimes={nextDateTimes}
            />
          </div>
        </div>
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}

export default function BookPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative text-white py-12 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/images/court.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-green-700/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-slide-up">
            <nav className="text-green-200 text-sm mb-2">
              <span>{t.book.breadcrumb}</span>
              <span className="mx-2">/</span>
              <span className="text-white">{t.nav.bookCourt}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold">{t.book.title}</h1>
            <p className="mt-2 text-green-100">{t.book.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="card p-4 animate-slide-up">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Step number={1} label={t.book.selectDate} />
            <div className="flex-1 h-1 mx-4 rounded bg-gray-200" />
            <Step number={2} label={t.book.chooseTime} />
            <div className="flex-1 h-1 mx-4 rounded bg-gray-200" />
            <Step number={3} label={t.book.payConfirm} />
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <CancelledBanner />
      </Suspense>

      <Suspense fallback={null}>
        <BookingContent />
      </Suspense>
    </div>
  )
}

function Step({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm bg-green-600 text-white">
        {number}
      </div>
      <span className="text-sm font-medium text-gray-600 hidden sm:block">
        {label}
      </span>
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function Day1Summary({ date, times, formatTime, onCancel, t }: {
  date: string
  times: string[]
  formatTime: (time: string) => string
  onCancel: () => void
  t: Record<string, any>
}) {
  const sorted = [...times].sort()
  const first = sorted[0]
  const lastHour = parseInt(sorted[sorted.length - 1].split(':')[0]) + 1
  const end = `${String(lastHour).padStart(2, '0')}:00`

  return (
    <div className="card p-4 bg-green-50 border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-green-600">{date}</p>
            <p className="font-semibold text-green-800 text-sm">
              {formatTime(first)} - {formatTime(end)} ({sorted.length}{t.home.hour})
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-green-600 hover:text-red-500 transition-colors p-1"
          title={t.common.cancel}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
