'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { isPeakTime, getBookingPrice, formatPrice } from '@/lib/membership'

interface TimeSlotsProps {
  selectedDate: string
  selectedTimes: string[]
  onTimesChange: (times: string[]) => void
}

interface Slot {
  startTime: string
  endTime: string
  available: boolean
  isPast: boolean
  isBooked: boolean
}

function getHour(time: string): number {
  return parseInt(time.split(':')[0])
}

function isAdjacent(times: string[], candidate: string): 'before' | 'after' | false {
  if (times.length === 0) return false
  const sorted = [...times].sort()
  const firstHour = getHour(sorted[0])
  const lastHour = getHour(sorted[sorted.length - 1])
  const candidateHour = getHour(candidate)

  if (candidateHour === firstHour - 1) return 'before'
  if (candidateHour === lastHour + 1) return 'after'
  return false
}

export default function TimeSlots({ selectedDate, selectedTimes, onTimesChange }: TimeSlotsProps) {
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

  const handleSlotClick = (startTime: string) => {
    if (selectedTimes.length === 0) {
      onTimesChange([startTime])
      return
    }

    if (selectedTimes.includes(startTime)) {
      // Clicking an already-selected slot: remove it and anything beyond it
      const sorted = [...selectedTimes].sort()
      const clickedIndex = sorted.indexOf(startTime)
      // If it's the only one, deselect all
      if (sorted.length === 1) {
        onTimesChange([])
        return
      }
      // If clicking the first slot, remove it (shrink from start)
      // If clicking the last slot, remove it (shrink from end)
      // If clicking a middle slot, remove it and everything after
      const firstHour = getHour(sorted[0])
      const clickedHour = getHour(startTime)
      const lastHour = getHour(sorted[sorted.length - 1])

      if (clickedHour === firstHour) {
        onTimesChange(sorted.slice(1))
      } else {
        // Remove this slot and everything after it
        onTimesChange(sorted.slice(0, clickedIndex))
      }
      return
    }

    const adjacency = isAdjacent(selectedTimes, startTime)
    if (adjacency) {
      // Extend selection
      onTimesChange([...selectedTimes, startTime])
    } else {
      // Not adjacent: start new selection
      onTimesChange([startTime])
    }
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
  const isSelected = (time: string) => selectedTimes.includes(time)

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
          const selected = isSelected(slot.startTime)
          return (
            <button
              key={slot.startTime}
              onClick={() => slot.available && handleSlotClick(slot.startTime)}
              disabled={!slot.available}
              className={`stagger-item p-4 rounded-xl font-medium transition-all duration-200 flex flex-col items-start ${
                selected
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
                {selected && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {slot.available && (
                <div className={`flex items-center gap-2 text-xs mt-1 ${
                  selected
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
