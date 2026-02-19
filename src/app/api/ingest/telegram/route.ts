import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const FoodItem = z.object({
  name: z.string(),
  quantity: z.string().optional().default(''),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  fiber_g: z.number().optional().default(0),
  sugar_g: z.number().optional().default(0),
})

const BodySchema = z.object({
  ingest_key: z.string(),
  telegram: z.object({
    chat_id: z.string(),
    message_id: z.string(),
    user_id: z.number(),
    username: z.string().optional(),
    text: z.string().optional(),
    sent_at: z.string(),
  }),
  parsed: z.object({
    timestamp: z.string(),
    meal_type: z.string(),
    foods: z.array(FoodItem),
    confidence: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.ingest_key !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Use service role on the server in prod; for now we rely on RLS-friendly inserts later.
  // In Supabase, this endpoint should use SUPABASE_SERVICE_ROLE_KEY (server only) to bypass RLS.
  const supabase = await createSupabaseServerClient()

  // Find the user profile linked to this telegram user id.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, telegram_user_id')
    .eq('telegram_user_id', parsed.data.telegram.user_id)
    .maybeSingle()

  if (!profile) {
    // Store raw ingest for later linking (optional table in schema.sql).
    await supabase.from('unlinked_ingest').insert({
      telegram_user_id: parsed.data.telegram.user_id,
      telegram_chat_id: parsed.data.telegram.chat_id,
      telegram_message_id: parsed.data.telegram.message_id,
      payload: parsed.data,
    })

    return NextResponse.json({ ok: true, status: 'unlinked_user' }, { status: 202 })
  }

  const occurred_at = parsed.data.parsed.timestamp

  const { data: meal, error: mealErr } = await supabase
    .from('meals')
    .insert({
      user_id: profile.id,
      occurred_at,
      meal_type: parsed.data.parsed.meal_type,
      confidence: parsed.data.parsed.confidence,
      notes: parsed.data.parsed.notes,
      source: 'telegram',
      source_chat_id: parsed.data.telegram.chat_id,
      source_message_id: parsed.data.telegram.message_id,
    })
    .select('id')
    .single()

  if (mealErr) {
    return NextResponse.json({ ok: false, error: 'meal_insert_failed', details: mealErr.message }, { status: 500 })
  }

  const items = parsed.data.parsed.foods.map((f) => ({
    meal_id: meal.id,
    name: f.name,
    quantity: f.quantity || '',
    calories: f.calories,
    protein_g: f.protein_g,
    carbs_g: f.carbs_g,
    fat_g: f.fat_g,
    fiber_g: f.fiber_g ?? 0,
    sugar_g: f.sugar_g ?? 0,
  }))

  const { error: itemsErr } = await supabase.from('meal_items').insert(items)
  if (itemsErr) {
    return NextResponse.json({ ok: false, error: 'items_insert_failed', details: itemsErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: 'inserted', meal_id: meal.id })
}
