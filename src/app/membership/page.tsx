'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Toast, { useToast } from '@/components/Toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { formatPrice, PEAK_PRICE, OFF_PEAK_PRICE } from '@/lib/membership'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
}

interface UserData {
  balance: number
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { t, language } = useLanguage()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/membership')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user')
      const data = await res.json()
      setUserData(data.user)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error(t.common.somethingWrong)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-hero text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">{t.membership.title}</h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-slide-up">
            <nav className="text-green-200 text-sm mb-2">
              <span>{t.membership.breadcrumb}</span>
              <span className="mx-2">/</span>
              <span className="text-white">{t.membership.title}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold">{t.membership.title}</h1>
            <p className="mt-2 text-green-100">{t.membership.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Pricing Info & Book */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pricing */}
          <div className="card p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.membership.pricingTable}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-800">{t.membership.offPeakHours}</div>
                  <div className="text-xs text-gray-500">{t.membership.offPeakHoursDesc}</div>
                </div>
                <span className="font-bold text-green-600 text-xl">{formatPrice(OFF_PEAK_PRICE)}/hr</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-800">{t.membership.peakHours}</div>
                  <div className="text-xs text-gray-500">{t.membership.peakHoursDesc}</div>
                </div>
                <span className="font-bold text-orange-600 text-xl">{formatPrice(PEAK_PRICE)}/hr</span>
              </div>
            </div>
            <Link href="/book" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm mt-4">
              <CalendarIcon className="w-4 h-4" />
              {t.home.bookNow}
            </Link>
          </div>

          {/* Balance */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t.membership.currentBalance}</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">
              {formatPrice(userData?.balance || 0)}
            </p>
            <Link href="/book" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
              <CalendarIcon className="w-4 h-4" />
              {t.home.bookNow}
            </Link>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{t.membership.transactions}</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.membership.noTransactions}</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
