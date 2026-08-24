export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-12 sm:justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
