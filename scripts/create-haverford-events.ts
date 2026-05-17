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
      title: "Dungeons and Dragons at QHouse!",
      description:
        "Looking for a Dungeons and Dragons game to join? Interested in playing for the first time? " +
        "Sign up to play with residents and friends of QHouse on Thursday, March 19 from 6:30 to 11:30 PM! " +
        "This event will be catered by El Limon, so come hungry! Please RSVP to lsinclair@haverford.edu " +
        "by the end of the day on Tuesday March 17, so that all necessary prep can be done by Thursday. " +
        "We can't wait to see you there! Contact: lsinclair@haverford.edu",
      host_display_name: "QHouse",
      location: "QHouse",
      start_time: "2026-03-19T18:30:00-04:00",
      end_time: "2026-03-19T23:30:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Coffee With Norm!",
      description:
        "Have questions and thoughts about the Libraries? Bring them to Coffee With Norm! " +
        "Monthly from 9-10am in Lutnick 121D, students can meet with Librarian of the College " +
        "Norm Medeiros, and enjoy a beverage from the Cafe on us. Space in each meeting is limited. " +
        "Please email Rachel at rahochberg@haverford.edu to sign up for a meeting date: 3/20 or 4/17. " +
        "Contact: rahochberg@haverford.edu",
      host_display_name: "Haverford Libraries",
      location: "Lutnick 121D",
      start_time: "2026-03-20T09:00:00-04:00",
      end_time: "2026-03-20T10:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Maps, Compass, Fun!",
      description:
        "Are you interested in outdoor navigation? Do you love games? Do you want to become more " +
        "comfortable using a compass and/or map? Come learn about maps and compasses this Friday with " +
        "HavOC 4:30-5:30 @ the Skate House. We'll play some games and chat! Beginners welcomed and " +
        "encouraged :) Contact: haverfordoutdoorsclub@gmail.com",
      host_display_name: "HavOC",
      location: "Skate House",
      start_time: "2026-03-20T16:30:00-04:00",
      end_time: "2026-03-20T17:30:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "FAB Candle Making",
      description:
        "Missing the relaxing time of break? Wishing you could get that back? Well come join FAB at " +
        "Cork & Candles (Ardmore) for a night of relaxing candle making March 20th 7-9pm. The experience " +
        "includes making two 8oz scented candles and is BYOB so feel free to bring drinks and snacks! " +
        "We will be going to the Ardmore location (65 Cricket Ave Ardmore) so you will be responsible for " +
        "transportation to and from the event. If you have any questions, feel free to email " +
        "morourke@haverford.edu and/or llakritz@haverford.edu. Contact: morourke@haverford.edu",
      host_display_name: "FAB",
      location: "Cork & Candles, 65 Cricket Ave, Ardmore",
      start_time: "2026-03-20T19:00:00-04:00",
      end_time: "2026-03-20T21:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Flower Arrangement Workshop",
      description:
        "Spring has (almost) sprung! What better way to welcome the season than with a Floral " +
        "Arrangement Workshop on March 21st from 1 pm to 3 pm in Zubrow Commons! This event promises " +
        "to be a blooming good time for all flower enthusiasts. Come and enjoy a variety of colorful " +
        "blooms, learn about different types of flowers, and create your own bouquet to take home! " +
        "Don't miss out on this chance to immerse yourself in the beauty of nature and connect with " +
        "fellow flower lovers. We can only accommodate the first 35 students who signed up. " +
        "Contact: hc-secs@haverford.edu",
      host_display_name: "SECS",
      location: "Zubrow Commons",
      capacity: 35,
      start_time: "2026-03-21T13:00:00-04:00",
      end_time: "2026-03-21T15:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Free Income Tax Sessions (VITA)",
      description:
        "Are you a U.S. citizen who had income in 2025? Come to Stokes 102 to get your taxes " +
        "e-filed for free! (Sessions also available at BMC.) See sign-up link for how to prepare. " +
        "Contact: jmelville@haverford.edu",
      host_display_name: "VITA",
      location: "Stokes 102",
      start_time: "2026-03-21T13:00:00-04:00",
      end_time: "2026-03-21T16:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Hidden Figures: Women in Space",
      description:
        "Hello astronomers! Happy International Women's History Month! Come celebrate with us at our " +
        "Hidden Figures: Women in Space event this Saturday from 8-10pm! Learn about all of the " +
        "ASTRONOMICAL accolades and advancements in the field of astronomy achieved by women! Listen " +
        "to our student talks, make crafts, tour the telescope domes and more! Follow our Instagram: " +
        "@hcpublicobserving to stay updated! Contact: strawbridge.observing@gmail.com",
      host_display_name: "HC Public Observing",
      location: "Strawbridge Observatory",
      start_time: "2026-03-21T20:00:00-04:00",
      end_time: "2026-03-21T22:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "PARC Crafts and Bingo",
      description:
        "Come relax and make cute keychains with PARC, and win in bingo while you're at it! " +
        "All materials will be provided. Contact: kbi@haverford.edu or apillai1@haverford.edu",
      host_display_name: "PARC",
      location: "VCAM Lounge",
      start_time: "2026-03-22T14:30:00-04:00",
      end_time: "2026-03-22T17:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Haverford Tri-Co Philly Student Info Session, Fall 2026",
      description:
        "Looking for a different kind of learning? Come discover the Fall 2026 Tri-Co Philly Program, " +
        "which connects students to the city. This semester-long program offers students classes and " +
        "activities in Philadelphia. Enroll in two urban-focused, experiential courses taught in the city " +
        "and participate in monthly Philadelphia-based activities. After attending an info session, students " +
        "are eligible to apply. For more information about the program, classes, and other sessions, see the " +
        "Tri-Co Philly Program Website. Contact: ccleary@haverford.edu",
      host_display_name: "Tri-Co Philly Program",
      location: "Union 111",
      start_time: "2026-03-23T16:30:00-04:00",
      end_time: "2026-03-23T17:30:00-04:00",
    },
    {
      creator_id: creatorId,
      title: 'Film Screening: "La Red" + Q&A with Juan David Cortes Hernandez',
      description:
        'Join us on Tuesday, March 24th at 5 pm, for the screening of "La Red" a documentary directed ' +
        "by Juan David Cortes Hernandez. The film celebrates the existence of the trans community in " +
        "Bogota, Colombia, and the work of La Red Comunitaria Trans in creating and defending the vital " +
        'expression of "maricas, callejeras, prostitutas y travestis". The film will be followed by a ' +
        "Q&A with the director. Contact: lmartinezh@haverford.edu",
      host_display_name: "VCAM",
      location: "VCAM Screening Room",
      start_time: "2026-03-24T17:00:00-04:00",
      end_time: "2026-03-24T19:30:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Passing the Torch of Bi-Co Disability Advocacy",
      description:
        "What do Haverford and Bryn Mawr currently have in common? They both have a senior student " +
        "government president who is disabled! Both Esenia Benleos (BMC '26) and Sara WJ (Hav, '26) " +
        "have been integral in improving the lives of disabled students in the bi-co during their time " +
        "here. On Tuesday, March 24th from 7 to 8 pm in Haverford Library 200, there will be a " +
        "conversation with these two amazing people both focusing on their personal journeys and also " +
        "advice for the new generation of disability advocates. This will be Question and Answer based " +
        "on audience questions. There will also be a Zoom simulcast if you are unable to attend in person! " +
        "Contact: nogden@haverford.edu",
      host_display_name: "Bi-Co Disability Advocacy",
      location: "Library 200",
      start_time: "2026-03-24T19:00:00-04:00",
      end_time: "2026-03-24T20:00:00-04:00",
    },
    {
      creator_id: creatorId,
      title: "Choom Boom Spring Showcase",
      description:
        "Come watch Choom Boom K-Pop Dance Club's Spring Showcase - Chooming with the Stars! " +
        "It will be in Marshall Auditorium on March 28th. Doors will open at 7pm, with the dance " +
        "showcase starting at 8pm! Questions: nchinn@brynmawr.edu and mkarthik@brynmawr.edu. " +
        "Contact: nchinn@brynmawr.edu",
      host_display_name: "Choom Boom K-Pop Dance Club",
      location: "Marshall Auditorium",
      start_time: "2026-03-28T19:00:00-04:00",
      end_time: "2026-03-28T22:00:00-04:00",
    },
  ]

  for (const event of events) {
    // Skip if an event with this title already exists
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("title", event.title)
      .maybeSingle()

    if (existing) {
      console.log(`⏭ Skipped "${event.title}" (already exists)`)
      continue
    }

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
