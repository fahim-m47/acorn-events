import { readFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load .env.local manually (no dotenv dependency needed)
const envPath = resolve(__dirname, "../.env.local")
const envContent = readFileSync(envPath, "utf-8")
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const eqIdx = trimmed.indexOf("=")
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
  if (!process.env[key]) process.env[key] = value
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CREATOR_EMAIL = "fratul@haverford.edu"

async function main() {
  // Look up the creator's user ID from the public users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", CREATOR_EMAIL)
    .single()

  if (userError || !userData) {
    console.error("Failed to find user:", userError?.message ?? "not found")
    process.exit(1)
  }

  const creatorId = userData.id
  console.log(`Found creator: ${CREATOR_EMAIL} → ${creatorId}`)

  const events = [
    {
      creator_id: creatorId,
      title: "Sophomore Academic Info Session",
      description:
        "Join the History Department for an info session for sophomore students on academic " +
        "planning, majors, minors, and more. Contact: lpcohen@haverford.edu",
      host_display_name: "History Department",
      location: "Hall 107",
      start_time: "2026-03-30T16:00:00-05:00",
      end_time: "2026-03-30T16:45:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Senior Poster Night + Alumni Panel",
      description:
        "Join the History Department for Senior Poster Night and an Alumni Panel — a celebration " +
        "of senior work and a chance to hear from History alumni about their post-Haverford paths. " +
        "Contact: lpcohen@haverford.edu",
      host_display_name: "History Department",
      location: "Lutnick 200",
      start_time: "2026-04-08T18:00:00-05:00",
      end_time: "2026-04-08T20:00:00-05:00",
    },
  ]

  for (const event of events) {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select("id, title, start_time")
      .single()

    if (error) {
      console.error(`❌ Failed to create "${event.title}" (${event.start_time}):`, error.message)
    } else {
      console.log(`✓ Created "${data.title}" → id: ${data.id} (${data.start_time})`)
    }
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
