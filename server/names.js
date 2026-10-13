// Saved name lists, shared by the local Express server (server/index.js) and the
// Netlify Function (netlify/functions/names.mjs). Each returns { status, body }.
import { createClient } from "@supabase/supabase-js";

// Users from the sign-in dropdown that have saved names. "Anonymous" never hits the server.
const SAVED_USERS = ["4B", "5Math"];
const MAX_NAMES = 200;
const MAX_NAME_LENGTH = 50;

let client;
function supabaseAdmin() {
  client ??= createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return client;
}

export async function getNames(user) {
  if (!SAVED_USERS.includes(user))
    return { status: 404, body: { error: "Unknown user" } };

  const { data, error } = await supabaseAdmin()
    .from("name_lists")
    .select("names")
    .eq("user_name", user)
    .maybeSingle();

  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { names: data?.names ?? [] } };
}

export async function putNames(user, payload) {
  if (!SAVED_USERS.includes(user))
    return { status: 404, body: { error: "Unknown user" } };

  const names = payload?.names;
  if (
    !Array.isArray(names) ||
    names.length > MAX_NAMES ||
    names.some(
      (n) => typeof n !== "string" || !n.trim() || n.length > MAX_NAME_LENGTH
    )
  )
    return { status: 400, body: { error: "Invalid names list" } };

  const { error } = await supabaseAdmin().from("name_lists").upsert({
    user_name: user,
    names: names.map((n) => n.trim()),
    updated_at: new Date().toISOString(),
  });

  if (error) return { status: 500, body: { error: error.message } };
  return { status: 200, body: { ok: true } };
}
