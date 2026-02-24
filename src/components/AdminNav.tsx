'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin', label: '總覽' },
  { href: '/admin/bookings', label: '預約管理' },
  { href: '/admin/users', label: '用戶管理' },
  { href: '/admin/sessions', label: '工作階段' },
  { href: '/admin/events', label: '事件分析' },
  { href: '/admin/analytics', label: '頁面分析' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
