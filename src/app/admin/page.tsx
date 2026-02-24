'use client'

import { useEffect, useState } from 'react'

interface DashboardData {
  todayBookings: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  totalUsers: number
  recentBookings: {
    id: string
    date: string
    startTime: string
    endTime: string
    amount: number
    isPeak: boolean
    customerName: string
    customerEmail: string
    customerPhone: string
    createdAt: string
  }[]
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-4 w-20 skeleton rounded mb-2" />
              <div className="h-8 w-16 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-red-600">載入失敗</p>
  }

  const stats = [
    { label: '今日預約', value: String(data.todayBookings), sub: '個' },
    { label: '今日收入', value: formatMoney(data.todayRevenue), sub: '' },
    { label: '本週收入', value: formatMoney(data.weekRevenue), sub: '' },
    { label: '本月收入', value: formatMoney(data.monthRevenue), sub: '' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stat.value}{stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Total users */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-500">總用戶數</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalUsers}</p>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近預約</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentBookings.map((b) => (
            <div key={b.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{b.customerName}</p>
                <p className="text-sm text-gray-500">
                  {b.date} {b.startTime}-{b.endTime}
                  {b.isPeak && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">繁忙</span>}
                </p>
                <p className="text-xs text-gray-400">{b.customerEmail} {b.customerPhone && `/ ${b.customerPhone}`}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatMoney(b.amount)}</p>
                <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString('zh-HK')}</p>
              </div>
            </div>
          ))}
          {data.recentBookings.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400">暫無預約</p>
          )}
        </div>
      </div>
    </div>
  )
}
