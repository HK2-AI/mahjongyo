import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '預約麻雀房 | 麻雀Party Room',
  description: '立即預約麻雀Party Room。選擇日期和時間，輕鬆完成預約。會員享受優惠價格。Book your mahjong room.',
  openGraph: {
    title: '預約麻雀房 | 麻雀Party!',
    description: '立即預約麻雀Party Room，會員享受優惠價格',
  },
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
