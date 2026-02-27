'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface EventItem {
  id: string
  eventType: string
  eventData: string | null
  page: string | null
  element: string | null
  createdAt: string
}

interface SessionData {
  id: string
  visitorId: string
  userId: string | null
  userAgent: string | null
  ipAddress: string | null
  country: string | null
  referrer: string | null
  landingPage: string | null
  createdAt: string
  lastActiveAt: string
  events: EventItem[]
}

interface UserData {
  name: string
  email: string
}

const TYPE_COLORS: Record<string, string> = {
  page_view: 'bg-blue-100 text-blue-700',
  click: 'bg-gray-100 text-gray-700',
  booking_start: 'bg-yellow-100 text-yellow-700',
  booking_confirm: 'bg-orange-100 text-orange-700',
  booking_complete: 'bg-green-100 text-green-700',
  login: 'bg-purple-100 text-purple-700',
  signup: 'bg-indigo-100 text-indigo-700',
  logout: 'bg-red-100 text-red-700',
}

function parseEventData(data: string | null): Record<string, unknown> | null {
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export default function SessionDetailPage() {
  const params = useParams()
  const visitorId = params.visitorId as string
  const [session, setSession] = useState<SessionData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/admin/sessions/${visitorId}`)
        if (!res.ok) {
          setError(res.status === 404 ? '找不到此工作階段' : '載入失敗')
          return
        }
        const data = await res.json()
        setSession(data.session)
        setUser(data.user)
      } catch {
        setError('載入失敗')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [visitorId])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>
  }

  if (error || !session) {
    return <div className="p-8 text-center text-gray-400">{error || '找不到此工作階段'}</div>
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/sessions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        &larr; 返回工作階段列表
      </Link>

      {/* Session metadata */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">工作階段詳情</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">訪客 ID：</span>
            <span className="font-mono text-gray-700">{session.visitorId}</span>
          </div>
          <div>
            <span className="text-gray-500">用戶：</span>
            <span className="text-gray-700">
              {user ? `${user.name} (${user.email})` : '匿名訪客'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">User Agent：</span>
            <span className="text-gray-700 break-all">{session.userAgent || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">IP 地址：</span>
            <span className="text-gray-700">{session.ipAddress || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">國家：</span>
            <span className="text-gray-700">{session.country || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">來源：</span>
            <span className="text-gray-700">{session.referrer || '直接訪問'}</span>
          </div>
          <div>
            <span className="text-gray-500">著陸頁：</span>
            <span className="text-gray-700">{session.landingPage || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">開始時間：</span>
            <span className="text-gray-700">
              {new Date(session.createdAt).toLocaleString('zh-HK')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">最後活動：</span>
            <span className="text-gray-700">
              {new Date(session.lastActiveAt).toLocaleString('zh-HK')}
            </span>
          </div>
        </div>
      </div>

      {/* Event timeline */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            事件時間線（{session.events.length} 個事件）
          </h2>
        </div>
        {session.events.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暫無事件</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {session.events.map((e) => {
              const parsed = parseEventData(e.eventData)
              return (
                <div key={e.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-mono ${
                          TYPE_COLORS[e.eventType] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {e.eventType}
                      </span>
                      {e.page && (
                        <span className="text-sm text-gray-500 truncate max-w-[300px]">
                          {e.page}
                        </span>
                      )}
                      {e.element && (
                        <span className="text-sm text-gray-400">{e.element}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString('zh-HK')}
                    </span>
                  </div>
                  {parsed && (
                    <div className="mt-1 text-xs text-gray-400 font-mono space-y-0.5">
                      {Object.entries(parsed).map(([key, val]) => (
                        <div key={key}>
                          {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
