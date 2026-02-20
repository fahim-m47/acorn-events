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

  const coffeeDescription =
    "Have questions and thoughts about the Libraries? Bring them to Coffee With Norm! " +
    "Monthly from 9–10am in Lutnick 121D, students can meet with Librarian of the College " +
    "Norm Medeiros, and enjoy a beverage from the Café on us. Space in each meeting is limited. " +
    "Please email Rachel at rahochberg@haverford.edu to sign up."

  const events = [
    {
      creator_id: creatorId,
      title: "An Unexpected Party",
      description:
        "An Unexpected Party is an event celebrating Tolkien's works! We'll have a viewing of " +
        "The Fellowship of the Ring alongside trivia, a themed mocktail bar, and a scavenger " +
        "hunt-style quest to vanquish the One Ring. We happily await the sound of returning " +
        "feet and voices at the door! Contact: nerdhousehc@gmail.com",
      host_display_name: "Nerd House",
      location: "Nerd House",
      start_time: "2026-02-21T20:00:00-05:00",
      end_time: "2026-02-22T00:00:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Coffee With Norm!",
      description: coffeeDescription,
      host_display_name: "The Libraries",
      location: "Lutnick 121D",
      start_time: "2026-02-27T09:00:00-05:00",
      end_time: "2026-02-27T10:00:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Coffee With Norm!",
      description: coffeeDescription,
      host_display_name: "The Libraries",
      location: "Lutnick 121D",
      start_time: "2026-03-20T09:00:00-04:00",
      end_time: "2026-03-20T10:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Coffee With Norm!",
      description: coffeeDescription,
      host_display_name: "The Libraries",
      location: "Lutnick 121D",
      start_time: "2026-04-17T09:00:00-04:00",
      end_time: "2026-04-17T10:00:00-04:00",
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
