// Saved name lists live in Supabase behind the Express server (see server/index.js).

export const SAVED_USERS = ["Brianna"] as const;
export const ANONYMOUS = "Anonymous";

export type SavedUser = (typeof SAVED_USERS)[number];
export type SpinnerUser = SavedUser | typeof ANONYMOUS;

export function isSavedUser(user: SpinnerUser): user is SavedUser {
  return user !== ANONYMOUS;
}

export async function fetchNames(user: SavedUser): Promise<string[]> {
  const res = await fetch(`/api/names/${encodeURIComponent(user)}`);
  if (!res.ok) throw new Error(`Couldn't load names (${res.status})`);
  const body = (await res.json()) as { names: string[] };
  return body.names;
}

// keepalive lets the request finish while the page is closing or refreshing.
export async function saveNames(
  user: SavedUser,
  names: string[],
  { keepalive = false } = {}
) {
  const res = await fetch(`/api/names/${encodeURIComponent(user)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
    keepalive,
  });
  if (!res.ok) throw new Error(`Couldn't save names (${res.status})`);
}
