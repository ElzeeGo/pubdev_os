import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

const LOCAL_EMAIL = "local.dev@example.test"
const LOCAL_PASSWORD = "local-dev-password"
const LOCAL_NAME = "Local Dev"
const ORG_ID = "local-org"
const ORG_SLUG = "local-dev"
const PROJECT_ID = "local-project"
const PROJECT_SLUG = "local-app"
const API_KEY = "sk_local_dev_do_not_use_in_prod_0001"

function loadEnvFile(path) {
  const text = readFileSync(path, "utf8")
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    const key = trimmed.slice(0, separator)
    let value = trimmed.slice(separator + 1)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(new URL("../.env.local", import.meta.url))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser() {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) throw listError

  const existing = listed.users.find((user) => user.email === LOCAL_EMAIL)
  if (existing) return existing

  const { data, error } = await supabase.auth.admin.createUser({
    email: LOCAL_EMAIL,
    password: LOCAL_PASSWORD,
    email_confirm: true,
    user_metadata: { name: LOCAL_NAME },
  })
  if (error) throw error
  return data.user
}

async function ensureProfile(userId) {
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email: LOCAL_EMAIL,
      name: LOCAL_NAME,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )
  if (error) throw error
}

async function ensureWorkspace(userId) {
  const { error: orgError } = await supabase.from("organizations").upsert(
    { id: ORG_ID, name: "Local Dev", slug: ORG_SLUG },
    { onConflict: "id" },
  )
  if (orgError) throw orgError

  const { error: membershipError } = await supabase.from("memberships").upsert(
    {
      id: "local-membership",
      user_id: userId,
      organization_id: ORG_ID,
      role: "owner",
    },
    { onConflict: "id" },
  )
  if (membershipError) throw membershipError

  const { error: projectError } = await supabase.from("projects").upsert(
    {
      id: PROJECT_ID,
      organization_id: ORG_ID,
      name: "Local App",
      slug: PROJECT_SLUG,
      settings: {},
    },
    { onConflict: "id" },
  )
  if (projectError) throw projectError

  const { error: creditError } = await supabase.from("credit_balances").upsert(
    {
      id: "local-credits",
      organization_id: ORG_ID,
      balance_usd: 25,
      total_purchased_usd: 25,
    },
    { onConflict: "organization_id" },
  )
  if (creditError) throw creditError

  const keyHash = createHash("sha256").update(API_KEY).digest("hex")
  const { data: existingKey, error: keyLookupError } = await supabase
    .from("api_keys")
    .select("id")
    .eq("key_hash", keyHash)
    .maybeSingle()
  if (keyLookupError) throw keyLookupError

  if (!existingKey) {
    const { error: keyError } = await supabase.from("api_keys").insert({
      user_id: userId,
      organization_id: ORG_ID,
      project_id: PROJECT_ID,
      key_hash: keyHash,
      key_preview: `...${API_KEY.slice(-4)}`,
      name: "Local dev",
    })
    if (keyError) throw keyError
  }
}

const user = await ensureUser()
if (!user) {
  console.error("Failed to create the local user")
  process.exit(1)
}

await ensureProfile(user.id)
await ensureWorkspace(user.id)

console.log("Local test data is ready.")
console.log(`Login: ${LOCAL_EMAIL} / ${LOCAL_PASSWORD}`)
console.log(`Project: ${PROJECT_SLUG} (${PROJECT_ID})`)
console.log("API key is in .env.local as PUBDEV_LOCAL_API_KEY")
