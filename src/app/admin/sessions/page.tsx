'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface SessionItem {
  visitorId: string
  userName: string | null
  eventCount: number
  duration: string
  converted: boolean
  ipAddress: string | null
  country: string | null
  landingPage: string | null
  referrer: string | null
  createdAt: string
  lastActiveAt: string
}

export default function SessionListPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/sessions?page=${page}`)
      const data = await res.json()
      setSessions(data.sessions)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">工作階段</h1>
        <p className="text-sm text-gray-500">共 {total} 個工作階段</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暫無工作階段</div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-8 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <div>訪客</div>
              <div>用戶</div>
              <div className="text-center">事件數</div>
              <div className="text-center">時長</div>
              <div className="text-center">轉換</div>
              <div>IP / 國家</div>
              <div>著陸頁</div>
              <div className="text-right">建立時間</div>
            </div>
            <div className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <Link
                  key={s.visitorId}
                  href={`/admin/sessions/${s.visitorId}`}
                  className="grid grid-cols-2 sm:grid-cols-8 gap-2 sm:gap-4 px-6 py-3 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="font-mono text-sm text-gray-700">
                    {s.visitorId.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-600">
                    {s.userName || <span className="text-gray-400">匿名</span>}
                  </div>
                  <div className="text-sm text-gray-600 text-center">{s.eventCount}</div>
                  <div className="text-sm text-gray-600 text-center">{s.duration}</div>
                  <div className="text-center">
                    {s.converted ? (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        已轉換
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {s.ipAddress ? (
                      <span>
                        <span className="font-mono text-xs">{s.ipAddress}</span>
                        {s.country && (
                          <span className="ml-1 text-xs text-gray-400">({s.country})</span>
                        )}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate col-span-2 sm:col-span-1">
                    {s.landingPage || '-'}
                  </div>
                  <div className="text-xs text-gray-400 text-right whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString('zh-HK')}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            上一頁
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  )
}
