'use client'

import { useEffect, useState, useCallback } from 'react'

interface EventData {
  id: string
  eventType: string
  eventData: string | null
  page: string | null
  element: string | null
  createdAt: string
  session: {
    visitorId: string
    userId: string | null
    userAgent: string | null
    createdAt: string
  }
}

interface FunnelStep {
  label: string
  step: string
  count: number
}

const EVENT_TYPES = [
  'page_view',
  'click',
  'booking_start',
  'booking_complete',
  'login',
  'signup',
  'logout',
]

function FunnelCard({ title, steps }: { title: string; steps: FunnelStep[] }) {
  const maxCount = steps[0]?.count || 1

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const prevCount = i > 0 ? steps[i - 1].count : step.count
          const dropoff = prevCount > 0 ? ((prevCount - step.count) / prevCount) * 100 : 0
          const widthPercent = maxCount > 0 ? (step.count / maxCount) * 100 : 0

          return (
            <div key={step.step}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {step.count.toLocaleString()}
                  </span>
                  {i > 0 && prevCount > 0 && (
                    <span className="text-xs text-red-500">
                      -{dropoff.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(widthPercent, 1)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminEvents() {
  const [activeTab, setActiveTab] = useState<'list' | 'funnel'>('list')
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [eventType, setEventType] = useState('')
  const limit = 50

  const [bookingFunnel, setBookingFunnel] = useState<FunnelStep[]>([])
  const [signupFunnel, setSignupFunnel] = useState<FunnelStep[]>([])
  const [funnelLoading, setFunnelLoading] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (eventType) params.set('eventType', eventType)

    try {
      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      setEvents(data.events)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }, [offset, eventType])

  const fetchFunnel = useCallback(async () => {
    setFunnelLoading(true)
    try {
      const res = await fetch('/api/admin/analytics/funnel')
      const data = await res.json()
      setBookingFunnel(data.bookingFunnel)
      setSignupFunnel(data.signupFunnel)
    } catch (err) {
      console.error('Failed to load funnel:', err)
    } finally {
      setFunnelLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'list') {
      fetchEvents()
    } else {
      fetchFunnel()
    }
  }, [activeTab, fetchEvents, fetchFunnel])

  const handleTypeFilter = (type: string) => {
    setEventType(type)
    setOffset(0)
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="bg-white rounded-xl p-1 shadow-sm inline-flex gap-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'list'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          事件列表
        </button>
        <button
          onClick={() => setActiveTab('funnel')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'funnel'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          轉換漏斗
        </button>
      </div>

      {activeTab === 'funnel' ? (
        funnelLoading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FunnelCard title="預約漏斗" steps={bookingFunnel} />
            <FunnelCard title="註冊漏斗" steps={signupFunnel} />
          </div>
        )
      ) : (
        <>
          {/* Event type filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-2">
            <button
              onClick={() => handleTypeFilter('')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                eventType === ''
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  eventType === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Total count */}
          <p className="text-sm text-gray-500">共 {total} 個事件</p>

          {/* Events list */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">載入中...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-gray-400">暫無事件</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {events.map((e) => (
                  <div key={e.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {e.eventType}
                        </span>
                        {e.page && <span className="text-sm text-gray-500 truncate max-w-[200px]">{e.page}</span>}
                        {e.element && <span className="text-sm text-gray-400">{e.element}</span>}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString('zh-HK')}
                      </span>
                    </div>
                    {e.eventData && (
                      <p className="mt-1 text-xs text-gray-400 font-mono truncate">{e.eventData}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      visitor: {e.session.visitorId.slice(0, 8)}...
                      {e.session.userId && ` | user: ${e.session.userId.slice(0, 8)}...`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setOffset(o => Math.max(0, o - limit))}
                disabled={offset === 0}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                上一頁
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setOffset(o => o + limit)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
