'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const next = '/dashboard/today'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) return setError(error.message)
    router.push(next)
  }

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="cc-card p-7">
          <h1 className="cc-h2">Sign in</h1>
          <p className="mt-2 text-sm text-white/70">
            Email + password for now. Google login can be added later.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Email</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent/60"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Password</div>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent/60"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              className="cc-btn cc-btn-primary w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="text-sm text-white/70">
              New here?{' '}
              <Link className="text-accent2 hover:underline" href="/signup">
                Create an account
              </Link>
              .
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
