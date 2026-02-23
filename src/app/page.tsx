'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Home() {
  const { t, language } = useLanguage()

  return (
    <div className="min-h-screen">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-2 left-1/2 w-1 h-1 bg-white rounded-full" />
          <div className="absolute bottom-1 right-1/4 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-1 right-1/3 w-1 h-1 bg-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 relative">
          <span className="text-2xl animate-bounce">🀄</span>
          <div className="text-center">
            <span className="font-bold text-lg md:text-xl">{language === 'zh-TW' ? '新蒲崗五芳街' : 'Ng Fong St, San Po Kong'}</span>
            <span className="mx-2 hidden sm:inline">|</span>
            <span className="text-white/90 hidden sm:inline">
              {language === 'zh-TW' ? '新蒲崗五芳街 ・ 24小時私人麻雀房' : 'Ng Fong Street, San Po Kong · 24-Hour Private Mahjong Room'}
            </span>
            <span className="text-white/90 sm:hidden block text-sm mt-1">
              {language === 'zh-TW' ? '新蒲崗 ・ 24小時麻雀房' : '24-Hour Mahjong Room'}
            </span>
          </div>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🀄</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 pb-40 md:pb-48">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-amber-400/30">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-amber-200">
                {language === 'zh-TW' ? '24小時營業 ・ 現正接受預約' : '24 Hours · Now Accepting Bookings'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {t.home.title}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
                麻雀Party!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-2xl mx-auto">
              {t.home.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <CalendarIcon className="w-5 h-5" />
                {t.home.bookCourt}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-200"
              >
                {t.nav.signUp}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">24hr</div>
              <div className="text-green-200 text-sm">{language === 'zh-TW' ? '全日營業' : 'Open 24 Hours'}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">1hr</div>
              <div className="text-green-200 text-sm">{t.home.perSession}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">$40</div>
              <div className="text-green-200 text-sm">{t.home.perHour}</div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              {t.home.whyChooseBadge || '為什麼選擇我們'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t.home.whyChoose}
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              {t.home.whyChooseSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Professional Court */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-green-200 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {t.home.internationalStandard}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.home.premiumCourt}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t.home.premiumCourtDesc}
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    {t.home.proFloor}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    {t.home.standardSize}
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 - Private Space */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  {t.home.privateBooking}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.home.instantBooking}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t.home.instantBookingDesc}
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-purple-500" />
                    {t.home.privateNoDisturb}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-purple-500" />
                    {t.home.exclusiveCourt}
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Comfortable Environment */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-amber-200 transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  {t.home.highCeiling}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.home.flexibleHours}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {t.home.flexibleHoursDesc}
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-amber-500" />
                    {t.home.spaciousComfort}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-amber-500" />
                    {t.home.qualityAC}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <CalendarIcon className="w-6 h-6" />
              {t.home.bookExperience}
              <span className="ml-2 px-3 py-1 bg-white/20 rounded-lg text-sm">{t.home.fromPrice}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Court Image Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
              <Image
                src="/images/court.jpeg"
                alt="MJ Party Room"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-800">麻雀Party! 麻雀Party Room</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.home.readyToPlay}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {t.home.readyToPlayDesc}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.home.open24hrs}</h4>
                    <p className="text-gray-600 text-sm">{t.home.ctaSubtitle}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.home.freeCancellation}</h4>
                    <p className="text-gray-600 text-sm">{t.home.freeCancellationDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.home.equipmentRental}</h4>
                    <p className="text-gray-600 text-sm">{t.home.equipmentRentalDesc}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/book"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
                >
                  <CalendarIcon className="w-5 h-5" />
                  {t.home.bookNow}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="card p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-green-600" />
                {t.home.hoursInfo}
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">{t.home.operatingHours}</span>
                  <span className="font-semibold text-gray-800">24 小時營業</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">{t.home.sessionDuration}</span>
                  <span className="font-semibold text-gray-800">1 {t.home.hour}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">{t.home.courtsAvailable}</span>
                  <span className="font-semibold text-gray-800">1</span>
                </div>

                <div className="py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-gray-800 font-medium">非繁忙時段</span>
                      <span className="text-gray-500 text-sm ml-2">星期一至四 6pm 前</span>
                    </div>
                    <span className="font-bold text-green-600 text-xl">$40/hr</span>
                  </div>
                </div>

                <div className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-gray-800 font-medium">繁忙時段</span>
                      <span className="text-gray-500 text-sm ml-2">星期一至四 6pm 後、週五至日、公眾假期</span>
                    </div>
                    <span className="font-bold text-orange-600 text-xl">$50/hr</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.home.ctaTitle}
          </h2>
          <p className="text-green-100 text-lg mb-8">
            {t.home.ctaSubtitle}
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            {t.home.bookNow}
          </Link>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LocationIcon className="w-6 h-6 text-green-600" />
                {t.home.location}
              </h3>
              <p className="text-lg text-gray-700 mb-6">{t.home.address}</p>

              <h4 className="font-semibold text-gray-800 mb-3">{t.home.directions}</h4>
              <ol className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>{t.home.direction1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>{t.home.direction2}</span>
                </li>
              </ol>
            </div>

            <div className="bg-gray-100 rounded-2xl overflow-hidden h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.8!2d114.196!3d22.339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340407b04fb06067%3A0x0!2z5paw6JKy5bSX5LqU6Iqz6KGX!5e0!3m2!1szh-TW!2shk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/images/mjparty_logo.png"
              alt="麻雀Party"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-white">麻雀Party!</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">{t.home.address}</p>
          <p className="text-sm">{t.home.footer}</p>
          <p className="text-sm mt-2">{t.home.footerContact} info@mjparty.com</p>
        </div>
      </footer>
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
