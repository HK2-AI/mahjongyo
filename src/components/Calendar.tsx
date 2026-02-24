'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  nextDate?: string
}

export default function Calendar({ selectedDate, onDateSelect, nextDate }: CalendarProps) {
  const { t, language } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 7)

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = t.calendar.months

  const dayNames = [
    t.calendar.sun, t.calendar.mon, t.calendar.tue, t.calendar.wed,
    t.calendar.thu, t.calendar.fri, t.calendar.sat
  ]

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date < today
  }

  const isBeyondLimit = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date > maxDate
  }

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.getTime() === today.getTime()
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-11" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const isSelected = selectedDate === dateStr
    const isNextDate = nextDate === dateStr
    const isPast = isPastDate(day)
    const isTooFar = isBeyondLimit(day)
    const isDisabled = isPast || isTooFar
    const isTodayDate = isToday(day)

    days.push(
      <button
        key={day}
        onClick={() => !isDisabled && onDateSelect(dateStr)}
        disabled={isDisabled}
        className={`h-11 w-11 rounded-xl flex items-center justify-center font-medium transition-all duration-200 relative ${
          isSelected
            ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-110'
            : isNextDate
            ? 'bg-green-200 text-green-800 ring-2 ring-green-400'
            : isDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : isTodayDate
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {day}
        {isTodayDate && !isSelected && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
        )}
      </button>
    )
  }

  const canGoPrev = currentMonth > today
  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) <= maxDate

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-xl transition-all duration-200 ${
            canGoPrev
              ? 'hover:bg-gray-100 text-gray-600'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-xl transition-all duration-200 ${
            canGoNext
              ? 'hover:bg-gray-100 text-gray-600'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  )
}
