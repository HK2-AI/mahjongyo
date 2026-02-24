'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  membership: string
  balance: number
  totalSpent: number
  isAdmin: boolean
  bookingCount: number
  createdAt: string
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

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${page}`)
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">用戶管理</h1>
        <p className="text-sm text-gray-500">共 {total} 個用戶</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">載入中...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暫無用戶</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {u.name}
                      {u.isAdmin && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {membershipLabels[u.membership] ?? u.membership}
                    </p>
                    <p className="text-xs text-gray-400">{u.bookingCount} 次預約</p>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-x-4">
                  {u.phone && <span>{u.phone}</span>}
                  <span>餘額: {formatMoney(u.balance)}</span>
                  <span>總消費: {formatMoney(u.totalSpent)}</span>
                  <span>註冊: {new Date(u.createdAt).toLocaleDateString('zh-HK')}</span>
                </div>
              </Link>
            ))}
          </div>
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
