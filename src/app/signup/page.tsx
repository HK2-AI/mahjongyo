'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Toast, { useToast } from '@/components/Toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getVisitorId, trackEvent, EventTypes } from '@/lib/tracking'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t.signup.passwordMismatch)
      return
    }

    if (password.length < 6) {
      toast.error(t.signup.passwordTooShort)
      return
    }

    setLoading(true)

    try {
      const visitorId = getVisitorId()

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, visitorId })
      })

      const data = await res.json()

      if (!res.ok) {
        trackEvent(EventTypes.SIGNUP_FAIL, { eventData: { error: data.error } })
        throw new Error(data.error || 'Failed to create account')
      }

      // Track successful signup
      trackEvent(EventTypes.SIGNUP, { eventData: { userId: data.user.id } })

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(t.signup.accountCreated)
        router.push('/book')
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.common.somethingWrong)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{t.signup.title}</h1>
          <p className="text-gray-600 mt-2">{t.signup.subtitle}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t.signup.fullName}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-modern"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.signup.email}
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t.signup.phone} <span className="text-gray-400">{t.signup.phoneOptional}</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-modern"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.signup.password}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-modern"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">{t.signup.passwordHint}</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.signup.confirmPassword}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-modern"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  {t.signup.creating}
                </>
              ) : (
                t.signup.createAccount
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.signup.hasAccount}{' '}
              <Link href="/login" className="text-green-600 font-medium hover:text-green-700">
                {t.signup.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
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
