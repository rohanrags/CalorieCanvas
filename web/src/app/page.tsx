import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <div className="cc-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -right-32 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-accent2/15 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cc-chip">Real-time Telegram sync</span>
              <span className="cc-chip">Per-person targets</span>
              <span className="cc-chip">PST day grouping</span>
            </div>

            <h1 className="cc-h1 mt-6">
              CalorieCanvas
              <span className="text-white/70"> — your food log, rendered clean.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-white/75">
              Track meals in Telegram. View dashboards online. Fix entries without losing history.
              Designed for consistency, not perfection.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="cc-btn cc-btn-primary" href="/login">Sign in</Link>
              <Link className="cc-btn cc-btn-ghost" href="/signup">Create account</Link>
              <Link className="cc-btn cc-btn-ghost" href="/dashboard/today">Open dashboard</Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="cc-card p-5">
                <div className="cc-kpi-label">What you see</div>
                <div className="mt-2 text-sm text-white/70">
                  Daily totals, macro split, per-meal breakdown, trends.
                </div>
              </div>
              <div className="cc-card p-5">
                <div className="cc-kpi-label">What’s different</div>
                <div className="mt-2 text-sm text-white/70">
                  Your defaults (like roti label macros) persist across logs.
                </div>
              </div>
              <div className="cc-card p-5">
                <div className="cc-kpi-label">What’s next</div>
                <div className="mt-2 text-sm text-white/70">
                  Account linking with Telegram + real-time ingest.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
