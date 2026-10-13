import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Users from the sign-in dropdown that have saved names. "Anonymous" never hits the server.
const SAVED_USERS = ["Brianna"];
const MAX_NAMES = 200;
const MAX_NAME_LENGTH = 50;

function requireSavedUser(req, res, next) {
  if (!SAVED_USERS.includes(req.params.user))
    return res.status(404).json({ error: "Unknown user" });
  next();
}

app.get("/api/names/:user", requireSavedUser, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("name_lists")
    .select("names")
    .eq("user_name", req.params.user)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ names: data?.names ?? [] });
});

app.put("/api/names/:user", requireSavedUser, async (req, res) => {
  const { names } = req.body ?? {};
  if (
    !Array.isArray(names) ||
    names.length > MAX_NAMES ||
    names.some(
      (n) => typeof n !== "string" || !n.trim() || n.length > MAX_NAME_LENGTH
    )
  )
    return res.status(400).json({ error: "Invalid names list" });

  const { error } = await supabaseAdmin.from("name_lists").upsert({
    user_name: req.params.user,
    names: names.map((n) => n.trim()),
    updated_at: new Date().toISOString(),
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Spinner API listening on :${port}`));
