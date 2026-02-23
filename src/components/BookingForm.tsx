'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatPrice, getBookingPrice, isPeakTime } from '@/lib/membership'
import { trackEvent, EventTypes } from '@/lib/tracking'

interface BookingFormProps {
  selectedDate: string
  selectedTime: string | null
  onBookingComplete: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function BookingForm({ selectedDate, selectedTime, onBookingComplete, onSuccess, onError }: BookingFormProps) {
  const { data: session, status } = useSession()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)

  const formatTime = (time: string) => {
    const [hours] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:00 ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return

    setLoading(true)

    // Track booking attempt
    trackEvent(EventTypes.BOOKING_CONFIRM, {
      eventData: { date: selectedDate, time: selectedTime, price: bookingPrice }
    })

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedTime
        })
      })

      const data = await res.json()

      if (!res.ok) {
        trackEvent('booking_fail', { eventData: { reason: data.error } })
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t.common.somethingWrong)
      setLoading(false)
    }
  }

  // Calculate price (flat pricing)
  const bookingPrice = selectedDate && selectedTime
    ? getBookingPrice(selectedDate, selectedTime)
    : 0
  const isPeak = selectedDate && selectedTime ? isPeakTime(selectedDate, selectedTime) : false

  if (status === 'loading') {
    return (
      <div className="card p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-green-600" />
          {t.bookingForm.title}
        </h3>
        <div className="space-y-4">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="card p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-green-600" />
          {t.bookingForm.signInToBook}
        </h3>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-6">
            {t.bookingForm.signInDesc}
          </p>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {t.bookingForm.createAccount}
            </Link>
            <Link
              href="/login?callbackUrl=/book"
              className="btn-secondary w-full py-3 flex items-center justify-center"
            >
              {t.nav.signIn}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedDate || !selectedTime) {
    return (
      <div className="card p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-green-600" />
          {t.bookingForm.title}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <ChecklistIcon className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-center">{t.bookingForm.selectDateTime}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 animate-scale-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCardIcon className="w-5 h-5 text-green-600" />
        {t.bookingForm.title}
      </h3>

      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden">
            <Image src="/images/mjparty_logo.png" alt="麻雀Party" width={48} height={48} />
          </div>
          <div>
            <p className="font-bold text-green-800">{formatDate(selectedDate)}</p>
            <p className="text-green-600">
              {formatTime(selectedTime)} - {formatTime(`${parseInt(selectedTime.split(':')[0]) + 1}:00`)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t.bookingForm.bookingAs}</span>
          <span className="font-medium text-gray-800">{session.user.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t.bookingForm.priceType}</span>
          <span className={`font-medium ${isPeak ? 'text-orange-600' : 'text-green-600'}`}>
            {isPeak ? t.bookingForm.peak : t.bookingForm.offPeak}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t.bookingForm.duration}</span>
          <span className="font-medium text-gray-800">1 {t.home.hour}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">{t.bookingForm.total}</span>
            <span className="text-2xl font-bold text-green-600">{formatPrice(bookingPrice)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <LoadingSpinner />
            {t.common.loading}
          </>
        ) : (
          <>
            <CreditCardIcon className="w-5 h-5" />
            {t.bookingForm.payNow} - {formatPrice(bookingPrice)}
          </>
        )}
      </button>
    </div>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function ChecklistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
