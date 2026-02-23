import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '會員專區 | 麻雀Party Room',
  description: '查看會員等級、價格優惠及交易紀錄。消費越多，優惠越大，最高可享 50% 折扣。MJ Party membership benefits and pricing.',
  openGraph: {
    title: '會員專區 | 麻雀Party!',
    description: '會員優惠最高達 50% 折扣',
  },
}

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
