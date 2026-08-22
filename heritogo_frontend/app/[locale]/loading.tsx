export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-base-100 pb-28 pt-16 animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[480px] w-full bg-[#3B2519]/20 sm:h-[540px]">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-center px-5 sm:px-8 space-y-4">
          <div className="h-3 w-36 rounded-full bg-[#3B2519]/20 dark:bg-white/10" />
          <div className="h-12 w-3/4 max-w-lg rounded-2xl bg-[#3B2519]/30 dark:bg-white/20" />
          <div className="h-4 w-48 rounded-full bg-[#C99A3E]/30" />
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-36 rounded-2xl bg-[#A9754A]/40" />
            <div className="h-12 w-36 rounded-2xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Bar Skeleton */}
      <div className="border-b border-border bg-base-200 px-4 py-5">
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="h-7 w-14 rounded-lg bg-base-300" />
              <div className="h-3 w-16 rounded-md bg-base-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Container Skeletons */}
      <div className="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-8">
        
        {/* Destination Cards Skeleton (Écran 1) */}
        <div className="rounded-[32px] bg-[#3B2519]/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 rounded-xl bg-base-300" />
            <div className="h-4 w-20 rounded-lg bg-base-300" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-88 rounded-[26px] bg-base-300/80 p-5 flex flex-col justify-between"
              >
                <div className="flex justify-end">
                  <div className="h-5 w-16 rounded-lg bg-base-100/60" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-20 rounded-md bg-base-100/60" />
                  <div className="h-6 w-36 rounded-lg bg-base-100/80" />
                  <div className="h-10 w-full rounded-full bg-base-100/90" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Squircle Categories Skeleton (Écran 2) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 rounded-xl bg-base-300" />
            <div className="h-4 w-20 rounded-lg bg-base-300" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-border bg-[#F1E7D8]/40 dark:bg-base-200 p-4"
              >
                <div className="h-12 w-12 rounded-[18px] bg-white/80 dark:bg-base-100" />
                <div className="h-3 w-20 rounded-md bg-base-300" />
                <div className="h-2.5 w-12 rounded-md bg-base-300/60" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
