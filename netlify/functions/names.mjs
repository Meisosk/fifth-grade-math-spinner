// Netlify version of the local API server: GET/PUT /api/names/:user.
// netlify.toml rewrites /api/names/:user here as ?user=:user.
import { getNames, putNames } from "../../server/names.js";

function json({ status, body }) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req) => {
  const url = new URL(req.url);
  // Prefer the rewrite's ?user=, falling back to the last path segment.
  const user = decodeURIComponent(
    url.searchParams.get("user") ?? url.pathname.split("/").pop() ?? ""
  );

  if (req.method === "GET") return json(await getNames(user));

  if (req.method === "PUT") {
    let payload;
    try {
      payload = await req.json();
    } catch {
      return json({ status: 400, body: { error: "Invalid JSON" } });
    }
    return json(await putNames(user, payload));
  }

  return json({ status: 405, body: { error: "Method not allowed" } });
};
