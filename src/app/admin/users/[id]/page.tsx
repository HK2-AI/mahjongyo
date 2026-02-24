'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface BookingData {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  amount: number
  isPeak: boolean
  createdAt: string
}

interface TransactionData {
  id: string
  type: string
  amount: number
  description: string
  paymentId: string | null
  createdAt: string
}

interface SessionData {
  id: string
  visitorId: string
  userAgent: string | null
  ipAddress: string | null
  referrer: string | null
  landingPage: string | null
  createdAt: string
  lastActiveAt: string
  _count: { events: number }
}

interface UserData {
  id: string
  name: string
  email: string
  phone: string | null
  isAdmin: boolean
  membership: string
  balance: number
  totalSpent: number
  sessionId: string | null
  createdAt: string
  updatedAt: string
  bookings: BookingData[]
  transactions: TransactionData[]
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

const membershipLabels: Record<string, string> = {
  rookie: 'Rookie',
  player: 'Player',
  pro: 'Pro',
  master: 'Master',
  legend: 'Legend',
}

const txTypeLabels: Record<string, string> = {
  deposit: '充值',
  booking: '預約扣款',
  refund: '退款',
}

export default function UserDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<UserData | null>(null)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (!res.ok) {
          setError(res.status === 404 ? '找不到此用戶' : '載入失敗')
          return
        }
        const data = await res.json()
        setUser(data.user)
        setSessions(data.sessions)
      } catch {
        setError('載入失敗')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">載入中...</div>
  }

  if (error || !user) {
    return <div className="p-8 text-center text-gray-400">{error || '找不到此用戶'}</div>
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        &larr; 返回用戶列表
      </Link>

      {/* User info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user.name}
            {user.isAdmin && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </h2>
          <span className="text-sm font-medium text-green-600">
            {membershipLabels[user.membership] ?? user.membership}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Email：</span>
            <span className="text-gray-700">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-500">電話：</span>
            <span className="text-gray-700">{user.phone || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">餘額：</span>
            <span className="text-gray-700">{formatMoney(user.balance)}</span>
          </div>
          <div>
            <span className="text-gray-500">總消費：</span>
            <span className="text-gray-700">{formatMoney(user.totalSpent)}</span>
          </div>
          <div>
            <span className="text-gray-500">預約次數：</span>
            <span className="text-gray-700">{user.bookings.length}</span>
          </div>
          <div>
            <span className="text-gray-500">註冊時間：</span>
            <span className="text-gray-700">
              {new Date(user.createdAt).toLocaleString('zh-HK')}
            </span>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            工作階段（{sessions.length}）
          </h2>
        </div>
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">暫無工作階段</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/admin/sessions/${s.visitorId}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="font-mono text-sm text-gray-700">
                    {s.visitorId.slice(0, 8)}...
                  </span>
                  <span className="ml-3 text-xs text-gray-400">
                    {s._count.events} 個事件
                  </span>
                  {s.landingPage && (
                    <span className="ml-3 text-xs text-gray-400 truncate max-w-[200px] inline-block align-bottom">
                      {s.landingPage}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleString('zh-HK')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            預約紀錄（{user.bookings.length}）
          </h2>
        </div>
        {user.bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">暫無預約</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {user.bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">{b.date}</span>
                  <span className="text-sm text-gray-500">
                    {b.startTime} - {b.endTime}
                  </span>
                  {b.isPeak && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                      繁忙
                    </span>
                  )}
                  {b.status === 'cancelled' && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      已取消
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatMoney(b.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            交易紀錄（{user.transactions.length}）
          </h2>
        </div>
        {user.transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">暫無交易</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {user.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-2">
                    {txTypeLabels[t.type] ?? t.type}
                  </span>
                  <span className="text-sm text-gray-600">{t.description}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${
                      t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.amount >= 0 ? '+' : ''}
                    {formatMoney(t.amount)}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleString('zh-HK')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
