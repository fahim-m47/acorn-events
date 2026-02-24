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
      title: "Field Trip to Pendle Hill",
      description:
        "The Quaker Affairs office invites you to attend a lecture at the Quaker retreat center, " +
        "Pendle Hill. Transportation will be provided and we will get to join the folks at Pendle " +
        "Hill before the lecture for a delicious, home-cooked dinner. The lecture — 'Things of " +
        "Beauty: A Pendle Hill First Monday Lecture' — features Welling Hall, minister, artist, " +
        "and political theologian, who will talk about the intersection of beauty, spirituality, " +
        "and trauma. She will share her journey of becoming an artist through her witness against " +
        "atrocity as both a spiritual and political act. The van departs from the Stokes Blue Bus " +
        "stop at 5:15pm; arrives back to Haverford by 10pm. Register via Google Form. " +
        "Questions? Email: lsinitzky@haverford.edu",
      host_display_name: "Quaker Affairs",
      location: "Pendle Hill (depart: Stokes Blue Bus Stop)",
      start_time: "2026-03-02T17:15:00-05:00",
      end_time: "2026-03-02T22:00:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "French and Francophone Studies Info Session",
      description:
        "Join faculty from the French and Francophone Studies Department for refreshments and " +
        "info about courses, majors, minors, and study abroad. All are welcome!",
      host_display_name: "French and Francophone Studies Department",
      location: "Library 211",
      start_time: "2026-02-24T16:15:00-05:00",
      end_time: "2026-02-24T17:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "English Major Information Session",
      description:
        "Join us for an English major info session — a gathering for all prospective English " +
        "majors, Creative Writing concentrators, and anyone interested in learning more about " +
        "English and Creative Writing. Faculty and current majors will share about their work, " +
        "and you'll have the chance to learn about the English major requirements, department " +
        "events and resources, and career opportunities. Bring your questions, grab snacks and " +
        "refreshments, and get to know the department. All are welcome! " +
        "Questions? Email: lreckson@haverford.edu",
      host_display_name: "English Department",
      location: "Woodside Cottage Meditation Room",
      start_time: "2026-03-04T16:15:00-05:00",
      end_time: "2026-03-04T17:15:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "FAB Escape Room",
      description:
        "Are you a fan of puzzles? Do you like navigating challenges? Come join FAB on a trip " +
        "to Expedition Escape in King of Prussia on Friday, February 27th! Sign up as a single " +
        "or with a buddy — only 1 of you needs to fill out the form. The escape rooms will be " +
        "in groups of 6, so if you sign up with a buddy, you're guaranteed to be in the same " +
        "group as them! Questions? Email: zgoldstein@haverford.edu or lpappalard@haverford.edu",
      host_display_name: "FAB",
      location: "Expedition Escape, King of Prussia",
      start_time: "2026-02-27T18:15:00-05:00",
      end_time: "2026-02-27T21:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Drum Circle",
      description:
        "Join us in an informal gathering to create rhythm and music using various percussion " +
        "instruments. We welcome all skill levels, and focus on community and self-expression " +
        "rather than musical perfection. All materials will be provided. Led by a percussion " +
        "major! Questions? Email: cchen9@haverford.edu",
      host_display_name: "BRAG",
      location: "VCAM Lounge",
      start_time: "2026-03-01T16:00:00-05:00",
      end_time: "2026-03-01T17:00:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "COCOxPARC: Islands to the East",
      description:
        "Join COCO and PARC for a night of games, conversations, and delicious food! Try a " +
        "variety of different Caribbean and East Asian snacks and drinks. A semi-formal cultural " +
        "mixer featuring drinks, snacks, music, polaroids, and games. Please do not forget to " +
        "stop by the DC during dinner time this week to pick up your ticket after filling out " +
        "the RSVP form. Questions? Email: coco.haverford@gmail.com or haverfordparc@gmail.com",
      host_display_name: "COCO x PARC",
      location: "VCAM Lounge",
      start_time: "2026-02-28T18:30:00-05:00",
      end_time: "2026-02-28T20:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Clothes Mending Workshop",
      description:
        "Do you have clothes with holes or stains? Do you want to help reduce your environmental " +
        "footprint through thoughtful clothing usage? Come mend your clothes with the " +
        "Environmental House (EHAUS)! All supplies provided, and no skill needed! Masks " +
        "recommended. Questions? Email: ekowardy@haverford.edu",
      host_display_name: "Environmental House (EHAUS)",
      location: "HCA 15",
      start_time: "2026-03-01T15:00:00-05:00",
      end_time: "2026-03-01T16:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "CCPA Internship Info Session",
      description:
        "Join Womxn in Econ for an internship info session with the Center for Career and " +
        "Professional Advising (CCPA), who will be giving us info about internship application " +
        "timelines, careers for Haverford Econ majors post-grad, and tips for finding " +
        "values-aligned internships! Learn about: what HC Econ majors do post grad, finding " +
        "values-aligned opportunities, finance/business internship timelines, and networking " +
        "strategies. Questions? Email: hcwomxnineconomics@gmail.com",
      host_display_name: "Womxn in Econ",
      location: "VCAM 201",
      start_time: "2026-03-02T18:30:00-05:00",
      end_time: "2026-03-02T19:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Active Minds Self-Care Tabling",
      description:
        "Feeling stressed about midterms? Stop by the Active Minds self-care tabling this " +
        "Thursday from 6–7:30pm in the DC. Questions? Email: aschechtma@haverford.edu",
      host_display_name: "Active Minds",
      location: "Dining Center (DC)",
      start_time: "2026-02-26T18:00:00-05:00",
      end_time: "2026-02-26T19:30:00-05:00",
    },
    {
      creator_id: creatorId,
      title: "Bi-Co Gender Minority in Leadership Panel",
      description:
        "The Bi-Co Gender Minority in Leadership Panel launches our Women's History Month " +
        "programming with a conversation on representation, resilience, and inclusive leadership. " +
        "Hear from leaders who identify as gender minorities as they share their experiences " +
        "navigating professional spaces, building influence, and creating change. Join us for " +
        "an evening of insight, connection, and honest dialogue about what leadership can look " +
        "like when more voices are at the table. All are welcome! " +
        "In collaboration with: IDEA, CCPA, Gender and Sexuality Studies. " +
        "Questions? Email: sc@haverford.edu",
      host_display_name: "GRASE",
      location: "Lutnick 200",
      start_time: "2026-02-26T18:00:00-05:00",
      end_time: "2026-02-26T20:00:00-05:00",
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
