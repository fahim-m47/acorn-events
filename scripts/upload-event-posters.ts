import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load .env.local manually
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

// Map: filename in scripts/posters/ → event title
const POSTER_MAP: Record<string, string> = {
  "choom-boom": "Choom Boom Spring Showcase",
  "tri-co-philly": "Haverford Tri-Co Philly Student Info Session, Fall 2026",
  "dnd": "Dungeons and Dragons at QHouse!",
  "la-red": 'Film Screening: "La Red" + Q&A with Juan David Cortes Hernandez',
  "hidden-figures": "Hidden Figures: Women in Space",
  "maps-compass": "Maps, Compass, Fun!",
  "candle-making": "FAB Candle Making",
  "crafts-bingo": "PARC Crafts and Bingo",
  "flower-arrangement": "Flower Arrangement Workshop",
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

function getMimeType(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".webp":
      return "image/webp"
    default:
      return "application/octet-stream"
  }
}

async function main() {
  // Look up the creator's user ID
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

  const postersDir = resolve(__dirname, "posters")

  for (const [baseName, eventTitle] of Object.entries(POSTER_MAP)) {
    // Find the image file (try each extension)
    let filePath: string | null = null
    let ext: string | null = null
    for (const e of ALLOWED_EXTENSIONS) {
      const candidate = resolve(postersDir, `${baseName}${e}`)
      if (existsSync(candidate)) {
        filePath = candidate
        ext = e
        break
      }
    }

    if (!filePath || !ext) {
      console.log(`⏭ No poster file found for "${baseName}" (tried ${ALLOWED_EXTENSIONS.join(", ")})`)
      continue
    }

    // Find the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, image_url")
      .eq("title", eventTitle)
      .maybeSingle()

    if (eventError || !event) {
      console.error(`❌ Event not found: "${eventTitle}"`, eventError?.message)
      continue
    }

    if (event.image_url) {
      console.log(`⏭ "${event.title}" already has an image, skipping`)
      continue
    }

    // Upload the image
    const fileBuffer = readFileSync(filePath)
    const storagePath = `${creatorId}/${Date.now()}-${baseName}${ext}`
    const mimeType = getMimeType(ext)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(storagePath, fileBuffer, { contentType: mimeType })

    if (uploadError || !uploadData) {
      console.error(`❌ Failed to upload poster for "${event.title}":`, uploadError?.message)
      continue
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("event-images").getPublicUrl(uploadData.path)

    // Update the event with the image URL
    const { error: updateError } = await supabase
      .from("events")
      .update({ image_url: publicUrl })
      .eq("id", event.id)

    if (updateError) {
      console.error(`❌ Failed to update "${event.title}":`, updateError.message)
    } else {
      console.log(`✓ Uploaded poster for "${event.title}" → ${publicUrl}`)
    }
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
