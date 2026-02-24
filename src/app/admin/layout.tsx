import type { Metadata } from 'next'
import AdminNav from '@/components/AdminNav'

export const metadata: Metadata = {
  title: '管理後台 | 麻雀Party',
  robots: { index: false, follow: false }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg font-bold text-gray-900">管理後台</h1>
        </div>
      </div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  )
}
