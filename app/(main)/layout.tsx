import { FAB } from '@/components/layout/fab'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <FAB />
    </>
  )
}
