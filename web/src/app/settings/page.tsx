import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  // Placeholder: targets + telegram linking UI will go here.
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="cc-h1">Settings</h1>
        <p className="mt-2 text-white/70">
          Targets are per-person. Telegram linking will map your Telegram user id to this account.
        </p>

        <div className="mt-8 cc-card p-6">
          <div className="cc-kpi-label">Account</div>
          <div className="mt-2 text-sm text-white/80">{auth.user?.email}</div>

          <div className="mt-4 text-sm text-white/60">
            Next: set calorie/protein targets + generate a one-time Telegram linking code.
          </div>
        </div>
      </div>
    </main>
  )
}
