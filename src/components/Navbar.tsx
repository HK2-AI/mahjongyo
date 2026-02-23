'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { trackEvent, EventTypes } from '@/lib/tracking'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { t } = useLanguage()

  const links = [
    { href: '/', label: t.nav.home, icon: HomeIcon },
    { href: '/book', label: t.nav.bookCourt, icon: CalendarIcon },
    { href: '/my-bookings', label: t.nav.myBookings, icon: ListIcon, auth: true },
    { href: '/membership', label: t.nav.myAccount, icon: MembershipIcon, auth: true },
  ]

  const filteredLinks = links.filter(link => !link.auth || session)

  const isActive = (path: string) => pathname === path

  const handleNavClick = (href: string, label: string) => {
    trackEvent(EventTypes.CLICK, { element: `nav_${label}`, eventData: { href } })
  }

  const handleLogout = () => {
    trackEvent(EventTypes.LOGOUT)
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/mjparty_logo.png"
              alt="麻雀Party"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              麻雀Party!
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href, link.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}

            {/* Auth Buttons */}
            <div className="ml-2 pl-4 border-l border-gray-200 flex items-center gap-2">
              {status === 'loading' ? (
                <div className="w-20 h-9 skeleton rounded-xl" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-sm">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    {t.nav.signOut}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => handleNavClick('/login', 'sign_in')}
                    className="px-4 py-2 text-gray-600 hover:text-green-600 font-medium transition-colors"
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => handleNavClick('/signup', 'sign_up')}
                    className="btn-primary px-4 py-2"
                  >
                    {t.nav.signUp}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
            <div className="flex flex-col gap-1">
              {filteredLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => { handleNavClick(link.href, link.label); setMobileMenuOpen(false) }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}

              {/* Mobile Auth */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {session ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-sm">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-700">{session.user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      {t.nav.signOut}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => { handleNavClick('/login', 'sign_in'); setMobileMenuOpen(false) }}
                      className="px-4 py-3 text-center text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                      {t.nav.signIn}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => { handleNavClick('/signup', 'sign_up'); setMobileMenuOpen(false) }}
                      className="btn-primary px-4 py-3 text-center"
                    >
                      {t.nav.signUp}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function MembershipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}
