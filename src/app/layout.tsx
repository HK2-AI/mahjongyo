import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '麻雀Party! 鑽石山麻雀Party Room | 新蒲崗24小時私人麻雀房預約',
  description: '鑽石山站B出口5分鐘，新蒲崗五芳街24小時私人麻雀房。過山車式電動枱、獨立快充、飲品任飲，$40/hr起。即時網上預約，獨立包房唔受打擾。',
  keywords: [
    '麻雀Party Room',
    '麻雀房',
    '麻雀Party Room預約',
    '新蒲崗麻雀房',
    '24小時麻雀房',
    '私人麻雀房',
    'mahjong room',
    'mahjong room booking',
    'mahjong party room',
    '香港麻雀Party Room',
    '麻雀Party',
    'MJ Party',
    '鑽石山麻雀房',
    '鑽石山麻雀Party Room',
    '五芳街',
    '五芳街麻雀房',
    '新蒲崗Party Room',
    '打麻雀',
    '麻雀房預約',
    '自動麻雀枱',
    '電動麻雀枱',
    'mahjong room hong kong',
    'san po kong mahjong',
    'diamond hill mahjong',
    '包場打牌',
    '私人牌局',
  ],
  authors: [{ name: '麻雀Party' }],
  creator: '麻雀Party',
  publisher: '麻雀Party',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.mjparty.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-TW': '/zh-TW',
      'en': '/en',
    },
  },
  openGraph: {
    title: '麻雀Party! 鑽石山麻雀Party Room | 新蒲崗24小時私人麻雀房',
    description: '鑽石山站B出口5分鐘，新蒲崗五芳街24小時私人麻雀房。過山車式電動枱、獨立快充、飲品任飲，$40/hr起。',
    url: 'https://www.mjparty.com',
    siteName: '麻雀Party!',
    images: [
      {
        url: '/images/mjparty_logo.png',
        width: 512,
        height: 512,
        alt: '麻雀Party 麻雀Party Room',
      },
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '麻雀Party! 鑽石山麻雀Party Room',
    description: '鑽石山站B出口5分鐘，新蒲崗24小時私人麻雀房。$40/hr起，即時網上預約。',
    images: ['/images/mjparty_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: '麻雀Party! 麻雀Party Room',
                description: '鑽石山站B出口5分鐘，新蒲崗五芳街24小時私人麻雀房。過山車式電動枱、獨立快充、飲品任飲，$40/hr起。',
                url: 'https://www.mjparty.com',
                logo: 'https://www.mjparty.com/images/mjparty_logo.png',
                image: 'https://www.mjparty.com/images/mjparty_logo.png',
                telephone: '',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '五芳街（鑽石山站B出口）',
                  addressLocality: '新蒲崗',
                  addressRegion: '九龍',
                  addressCountry: 'HK',
                },
                areaServed: {
                  '@type': 'GeoCircle',
                  geoMidpoint: {
                    '@type': 'GeoCoordinates',
                    latitude: 22.339,
                    longitude: 114.196,
                  },
                  geoRadius: '5000',
                },
                hasOfferCatalog: {
                  '@type': 'OfferCatalog',
                  name: '麻雀房預約',
                  itemListElement: [
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: '私人麻雀房（非繁忙時段）',
                        description: '星期一至四 6pm 前',
                      },
                      price: '40',
                      priceCurrency: 'HKD',
                      unitCode: 'HUR',
                    },
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: '私人麻雀房（繁忙時段）',
                        description: '星期一至四 6pm 後、週五至日、公眾假期',
                      },
                      price: '50',
                      priceCurrency: 'HKD',
                      unitCode: 'HUR',
                    },
                  ],
                },
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  opens: '00:00',
                  closes: '23:59',
                },
                sameAs: [],
                priceRange: '$40-$50',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: '麻雀Party!',
                url: 'https://www.mjparty.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.mjparty.com/images/mjparty_logo.png',
                  width: 512,
                  height: 512,
                },
                image: 'https://www.mjparty.com/images/mjparty_logo.png',
                description: '鑽石山・新蒲崗24小時私人麻雀房預約服務',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '五芳街（鑽石山站B出口）',
                  addressLocality: '新蒲崗',
                  addressRegion: '九龍',
                  addressCountry: 'HK',
                },
              },
            ]),
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
