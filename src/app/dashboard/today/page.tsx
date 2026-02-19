import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

function fmt(n: number) {
  return Number.isFinite(n) ? n.toFixed(0) : '0'
}

export default async function TodayDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  // PST “day” is computed server-side in SQL view in later step.
  // For MVP: show the most recent meals for the user.
  const { data: meals } = await supabase
    .from('meals')
    .select('id, occurred_at, meal_type, confidence, notes, meal_items(*)')
    .order('occurred_at', { ascending: false })
    .limit(10)

  const totals = (meals || []).flatMap((m: any) => m.meal_items || []).reduce(
    (acc: any, it: any) => {
      acc.calories += Number(it.calories || 0)
      acc.protein_g += Number(it.protein_g || 0)
      acc.carbs_g += Number(it.carbs_g || 0)
      acc.fat_g += Number(it.fat_g || 0)
      acc.fiber_g += Number(it.fiber_g || 0)
      acc.sugar_g += Number(it.sugar_g || 0)
      return acc
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 }
  )

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="cc-chip">Signed in as {user?.email}</div>
            <h1 className="cc-h1 mt-4">Today</h1>
            <p className="mt-2 text-white/70">
              PST day grouping + per-meal totals (coming next). For now: last 10 meals.
            </p>
          </div>

          <div className="flex gap-3">
            <Link className="cc-btn cc-btn-ghost" href="/settings">Settings</Link>
            <form action="/auth/signout" method="post">
              <button className="cc-btn cc-btn-primary text-white" type="submit">Sign out</button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="cc-kpi">
            <div className="cc-kpi-label">Calories</div>
            <div className="cc-kpi-value">{fmt(totals.calories)}</div>
          </div>
          <div className="cc-kpi">
            <div className="cc-kpi-label">Protein (g)</div>
            <div className="cc-kpi-value">{fmt(totals.protein_g)}</div>
          </div>
          <div className="cc-kpi">
            <div className="cc-kpi-label">Carbs (g)</div>
            <div className="cc-kpi-value">{fmt(totals.carbs_g)}</div>
          </div>
          <div className="cc-kpi">
            <div className="cc-kpi-label">Fat (g)</div>
            <div className="cc-kpi-value">{fmt(totals.fat_g)}</div>
          </div>
          <div className="cc-kpi">
            <div className="cc-kpi-label">Fiber (g)</div>
            <div className="cc-kpi-value">{fmt(totals.fiber_g)}</div>
          </div>
          <div className="cc-kpi">
            <div className="cc-kpi-label">Sugar (g)</div>
            <div className="cc-kpi-value">{fmt(totals.sugar_g)}</div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="cc-h2">Recent meals</h2>
          <div className="mt-4 grid gap-4">
            {(meals || []).map((m: any) => (
              <div key={m.id} className="cc-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="cc-chip">{m.meal_type}</span>
                    <span className="cc-chip">{new Date(m.occurred_at).toLocaleString()}</span>
                    {m.confidence ? <span className="cc-chip">{m.confidence}</span> : null}
                  </div>
                  {m.notes ? <div className="text-sm text-white/60">{m.notes}</div> : null}
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="text-left text-white/60">
                        <th className="py-2">Item</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Cal</th>
                        <th className="py-2">P</th>
                        <th className="py-2">C</th>
                        <th className="py-2">F</th>
                        <th className="py-2">Fiber</th>
                        <th className="py-2">Sugar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(m.meal_items || []).map((it: any) => (
                        <tr key={it.id} className="border-t border-white/10">
                          <td className="py-2 pr-4 font-medium">{it.name}</td>
                          <td className="py-2 pr-4 text-white/70">{it.quantity}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.calories || 0))}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.protein_g || 0))}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.carbs_g || 0))}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.fat_g || 0))}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.fiber_g || 0))}</td>
                          <td className="py-2 pr-4">{fmt(Number(it.sugar_g || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
