#!/usr/bin/env node
/**
 * Grant (or revoke) the admin role for an existing Supabase auth user.
 *
 * Admin authorization is read server-side from `app_metadata.role === "admin"`
 * (see src/lib/auth.ts). This script is the *privileged process* that sets that
 * claim — it needs the service-role key and is meant to be run by a project
 * owner, never exposed to the app.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *     node scripts/promote-admin.mjs someone@example.com          # grant
 *   node scripts/promote-admin.mjs someone@example.com --revoke   # revoke
 *
 * The user must already exist (i.e. have signed in at least once). This script
 * never creates users and never promotes by anything other than an exact,
 * explicitly-passed email.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadDotEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}
loadDotEnvLocal();

const email = process.argv[2]?.trim().toLowerCase();
const revoke = process.argv.includes("--revoke");

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/promote-admin.mjs <email> [--revoke]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Find the user by exact email (paginated listUsers).
let user = null;
for (let page = 1; page <= 20 && !user; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("listUsers failed:", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => (u.email ?? "").toLowerCase() === email) ?? null;
  if (data.users.length < 200) break;
}

if (!user) {
  console.error(`No auth user with email ${email}. They must sign in once first.`);
  process.exit(2);
}

const currentApp = user.app_metadata ?? {};
const nextApp = { ...currentApp };
if (revoke) delete nextApp.role;
else nextApp.role = "admin";

const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: nextApp });
if (error) {
  console.error("updateUserById failed:", error.message);
  process.exit(1);
}

console.log(
  `${revoke ? "Revoked admin from" : "Granted admin to"} ${email} (${user.id}). ` +
    `app_metadata.role is now: ${nextApp.role ?? "(none)"}`,
);
