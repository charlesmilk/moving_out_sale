import { neon } from "@netlify/neon";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { id, sold } = body || {};
  if (!id || typeof sold !== "boolean") {
    return new Response("Expected { id: string, sold: boolean }", { status: 400 });
  }

  try {
    const sql = neon();

    const rows = await sql`
      update items
      set sold = ${sold}, updated_at = now()
      where id = ${id}
      returning id, sold
    `;

    return new Response(JSON.stringify(rows[0] ?? null), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "DB update failed", detail: String(err) }),
      { status: 500 }
    );
  }
};
