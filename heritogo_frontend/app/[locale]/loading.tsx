export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white pb-28 pt-16 animate-pulse">

      {/* Hero Skeleton */}
      <div className="relative h-[500px] w-full bg-[#1B7E4B]/15 sm:h-[560px]">
        <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 space-y-5">
          <div className="h-3 w-32 rounded-full bg-[#E8A923]/40" />
          <div className="h-10 w-72 max-w-lg rounded-2xl bg-[#1B7E4B]/25" />
          <div className="h-14 w-full max-w-2xl rounded-2xl bg-white/80 shadow-sm" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-32 rounded-full bg-[#C85C2D]/30" />
            <div className="h-10 w-32 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-[#E5E5E0] bg-white px-4 py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="h-7 w-14 rounded-lg bg-[#E5E5E0]" />
              <div className="h-3 w-16 rounded-md bg-[#E5E5E0]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10 sm:px-6">

        {/* Categories Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-52 rounded-xl bg-[#E5E5E0]" />
            <div className="h-4 w-16 rounded-lg bg-[#E5E5E0]" />
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-3">
                <div className="h-11 w-11 rounded-xl bg-[#E5E5E0]" />
                <div className="h-2.5 w-12 rounded-md bg-[#E5E5E0]" />
              </div>
            ))}
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 rounded-xl bg-[#E5E5E0]" />
            <div className="h-4 w-16 rounded-lg bg-[#E5E5E0]" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-56 w-48 shrink-0 rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0]" />
            ))}
          </div>
        </div>

        {/* Grid Cards Skeleton */}
        <div className="space-y-4">
          <div className="h-7 w-48 rounded-xl bg-[#E5E5E0]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white">
                <div className="h-48 bg-[#F5F5F0]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded-lg bg-[#E5E5E0]" />
                  <div className="h-3 w-1/2 rounded-md bg-[#E5E5E0]" />
                  <div className="flex items-center gap-2 pt-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-3 w-3 rounded-sm bg-[#E8A923]/30" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
