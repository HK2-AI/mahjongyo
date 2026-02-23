'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { isPeakTime, getBookingPrice, formatPrice } from '@/lib/membership'

interface TimeSlotsProps {
  selectedDate: string
  selectedTime: string | null
  onTimeSelect: (time: string) => void
}

interface Slot {
  startTime: string
  endTime: string
  available: boolean
  isPast: boolean
  isBooked: boolean
}

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: TimeSlotsProps) {
  const { t } = useLanguage()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return

    const fetchSlots = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/slots?date=${selectedDate}`)
        const data = await res.json()
        setSlots(data.slots)
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate])

  const formatTime = (time: string) => {
    const [hours] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour} ${ampm}`
  }

  if (!selectedDate) {
    return (
      <div className="card p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-green-600" />
          {t.timeSlots.title}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <CalendarIcon className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-center">{t.timeSlots.selectDateFirst}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-green-600" />
          {t.timeSlots.title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(13)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const availableCount = slots.filter(s => s.available).length

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-green-600" />
          {t.timeSlots.title}
        </h3>
        <span className="badge-success">
          {availableCount} {t.timeSlots.available}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot, index) => {
          const isPeak = selectedDate ? isPeakTime(selectedDate, slot.startTime) : false
          return (
            <button
              key={slot.startTime}
              onClick={() => slot.available && onTimeSelect(slot.startTime)}
              disabled={!slot.available}
              className={`stagger-item p-4 rounded-xl font-medium transition-all duration-200 flex flex-col items-start ${
                selectedTime === slot.startTime
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]'
                  : slot.available
                  ? 'bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border-2 border-transparent hover:border-green-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
                {!slot.available && (
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {slot.isBooked ? t.timeSlots.booked : t.timeSlots.past}
                  </span>
                )}
                {selectedTime === slot.startTime && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {slot.available && (
                <div className={`flex items-center gap-2 text-xs mt-1 ${
                  selectedTime === slot.startTime
                    ? 'text-green-100'
                    : isPeak
                    ? 'text-orange-500'
                    : 'text-green-500'
                }`}>
                  <span>{isPeak ? t.timeSlots.peak : t.timeSlots.offPeak}</span>
                  <span className="font-semibold">{formatPrice(getBookingPrice(selectedDate, slot.startTime))}</span>
                </div>
              )}
            </button>
          )
        })}
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
