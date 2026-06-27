export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center bg-base-100 px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
