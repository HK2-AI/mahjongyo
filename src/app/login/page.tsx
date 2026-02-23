'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Toast, { useToast } from '@/components/Toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getVisitorId, trackEvent, EventTypes } from '@/lib/tracking'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const { t } = useLanguage()

  const callbackUrl = searchParams.get('callbackUrl') || '/book'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        trackEvent(EventTypes.LOGIN_FAIL, { eventData: { error: result.error } })
        toast.error(result.error)
      } else {
        // Track successful login
        trackEvent(EventTypes.LOGIN)

        // Link session to user
        const visitorId = getVisitorId()
        if (visitorId) {
          fetch('/api/session', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, email })
          }).catch(() => {})
        }

        toast.success(t.login.welcomeBack)
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error(t.common.somethingWrong)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t.login.email}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-modern"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t.login.password}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-modern"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                {t.login.signingIn}
              </>
            ) : (
              t.login.signIn
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t.login.noAccount}{' '}
            <Link href="/signup" className="text-green-600 font-medium hover:text-green-700">
              {t.login.signUp}
            </Link>
          </p>
        </div>
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}

export default function LoginPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 overflow-hidden">
              <Image src="/images/mjparty_logo.png" alt="麻雀Party" width={48} height={48} />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              麻雀Party!
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.login.title}</h1>
          <p className="text-gray-600 mt-2">{t.login.subtitle}</p>
        </div>

        <Suspense fallback={<div className="card p-8"><div className="skeleton h-64 rounded-xl" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
