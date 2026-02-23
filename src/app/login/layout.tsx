import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登入 | 麻雀Party Room',
  description: '登入麻雀Party帳戶，管理您的麻雀房預約。Sign in to your MJ Party account.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
