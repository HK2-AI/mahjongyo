'use client'

import { useEffect, useState, useCallback } from 'react'

interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  amount: number
  isPeak: boolean
  status: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerMembership: string
  createdAt: string
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)

    try {
      const res = await fetch(`/api/admin/bookings?${params}`)
      const data = await res.json()
      setBookings(data.bookings)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [page, dateFrom, dateTo])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleFilter = () => {
    setPage(1)
    fetchBookings()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">由</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">至</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          篩選
        </button>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
            className="px-4 py-2 text-gray-600 text-sm hover:text-gray-900 transition-colors"
          >
            清除
          </button>
        )}
      </div>

      {/* Bookings list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暫無預約</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <div key={b.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {b.date} {b.startTime}-{b.endTime}
                      {b.isPeak && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">繁忙</span>}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatMoney(b.amount)}</p>
                </div>
                <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-x-4">
                  <span>{b.customerEmail}</span>
                  {b.customerPhone && <span>{b.customerPhone}</span>}
                  <span className="capitalize">{b.customerMembership}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            上一頁
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  )
}
