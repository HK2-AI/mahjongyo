import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的帳戶 | 麻雀Party Room',
  description: '查看帳戶餘額及交易紀錄。My Account - view balance and transaction history.',
  openGraph: {
    title: '我的帳戶 | 麻雀Party!',
    description: '帳戶管理與交易紀錄',
  },
}

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
