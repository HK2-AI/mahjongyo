'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast, { useToast } from '@/components/Toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  amount: number
  createdAt: string
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { t, language } = useLanguage()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/my-bookings')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error(t.common.somethingWrong)
    } finally {
      setLoading(false)
    }
  }

  const isPastBooking = (date: string, startTime: string) => {
    const now = new Date()
    const bookingDate = new Date(date + 'T' + startTime)
    return bookingDate < now
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-hero text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold">{t.myBookings.title}</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const upcomingBookings = bookings.filter(b => !isPastBooking(b.date, b.startTime))
  const pastBookings = bookings.filter(b => isPastBooking(b.date, b.startTime))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-hero text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-slide-up">
            <nav className="text-green-200 text-sm mb-2">
              <span>{t.myBookings.breadcrumb}</span>
              <span className="mx-2">/</span>
              <span className="text-white">{t.myBookings.title}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold">{t.myBookings.title}</h1>
            <p className="mt-2 text-green-100">{t.myBookings.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="card p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.myBookings.noBookings}</h3>
            <p className="text-gray-500 mb-6">
              {t.myBookings.noBookingsDesc}
            </p>
            <Link
              href="/book"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              {t.myBookings.bookFirst}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  {t.myBookings.upcoming}
                  <span className="badge-success ml-2">{upcomingBookings.length}</span>
                </h3>
                <div className="space-y-3">
                  {upcomingBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isPast={false}
                      index={index}
                      language={language}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5" />
                  {t.myBookings.past}
                  <span className="badge-gray ml-2">{pastBookings.length}</span>
                </h3>
                <div className="space-y-3 opacity-60">
                  {pastBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isPast={true}
                      index={index}
                      language={language}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}

function BookingCard({ booking, isPast, index, language, t }: {
  booking: Booking
  isPast: boolean
  index: number
  language: string
  t: any
}) {
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div
      className={`card p-5 stagger-item ${isPast ? '' : 'border-l-4 border-l-green-500'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isPast ? 'bg-gray-100' : 'bg-green-100'}`}>
            <span className={`text-xs font-semibold ${isPast ? 'text-gray-500' : 'text-green-600'}`}>
              {new Date(booking.date + 'T00:00:00').toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'short' })}
            </span>
            <span className={`text-lg font-bold ${isPast ? 'text-gray-700' : 'text-green-700'}`}>
              {new Date(booking.date + 'T00:00:00').getDate()}
            </span>
          </div>
          <div>
            <p className={`font-semibold ${isPast ? 'text-gray-600' : 'text-gray-800'}`}>
              {formatDate(booking.date)}
            </p>
            <p className={`${isPast ? 'text-gray-500' : 'text-green-600'} font-medium`}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t.myBookings.paid}: ${(booking.amount / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPast ? (
            <span className="badge-gray">{t.myBookings.completed}</span>
          ) : (
            <span className="badge-success">{t.myBookings.paid}</span>
          )}
        </div>
      </div>
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
