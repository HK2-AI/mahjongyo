import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '註冊 | 麻雀Party Room',
  description: '免費註冊麻雀Party帳戶，立即享受「高手」會員優惠價格。繁忙時段 $380、非繁忙時段 $290。Create your MJ Party account today.',
  openGraph: {
    title: '免費註冊 | 麻雀Party!',
    description: '立即註冊享受高手會員優惠價格',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
