'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { t } = useLanguage()

  return (
    <div className="max-w-md w-full text-center animate-scale-in">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.bookingSuccess.title}</h1>
        <p className="text-gray-600">
          {t.bookingSuccess.subtitle}
        </p>
      </div>

      <div className="card p-6 mb-6 text-left">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden">
            <Image src="/images/mjparty_logo.png" alt="麻雀Party" width={48} height={48} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{t.bookingSuccess.courtName}</p>
            <p className="text-sm text-green-600">{t.bookingSuccess.confirmed}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <MailIcon className="w-5 h-5 text-gray-400" />
            <span>{t.bookingSuccess.emailSent}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span>{t.bookingSuccess.viewDetails}</span>
          </div>
          <div className="flex items-center gap-3 text-amber-600">
            <ClockIcon className="w-5 h-5 text-amber-400" />
            <span>{t.bookingSuccess.cancelAnytime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/my-bookings"
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          {t.bookingSuccess.viewMyBookings}
        </Link>
        <Link
          href="/book"
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
        >
          {t.bookingSuccess.bookAnother}
        </Link>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        {t.bookingSuccess.questions}{' '}
        <a href="mailto:info@mjparty.com" className="text-green-600 hover:underline">
          info@mjparty.com
        </a>
      </p>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="skeleton w-96 h-96 rounded-2xl" />}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
