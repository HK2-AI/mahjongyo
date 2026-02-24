'use client'

import { useEffect, useState } from 'react'

interface PageData {
  page: string
  views: number
  visitors: number
}

export default function PageAnalyticsPage() {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch('/api/admin/analytics/pages')
        const data = await res.json()
        setPages(data.pages)
      } catch (err) {
        console.error('Failed to load page analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">頁面分析</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暫無數據</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <div>頁面路徑</div>
              <div className="text-center">瀏覽次數</div>
              <div className="text-center">獨立訪客</div>
            </div>
            <div className="divide-y divide-gray-100">
              {pages.map((p) => (
                <div
                  key={p.page}
                  className="grid grid-cols-3 gap-4 px-6 py-3 items-center"
                >
                  <div className="text-sm text-gray-700 font-mono truncate">
                    {p.page}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {p.views.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {p.visitors.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
