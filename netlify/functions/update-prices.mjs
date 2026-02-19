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

  const { id, price_gbp, original_price } = body || {};

  if (!id) return new Response("Missing id", { status: 400 });

  const priceNow = Number(price_gbp);
  if (!Number.isFinite(priceNow) || priceNow < 0) {
    return new Response("Invalid price_gbp", { status: 400 });
  }

  // original_price is optional (can be null)
  let orig = null;
  if (original_price !== null && original_price !== undefined && original_price !== "") {
    orig = Number(original_price);
    if (!Number.isFinite(orig) || orig < 0) return new Response("Invalid original_price", { status: 400 });
    orig = Math.round(orig);
  }

  try {
    const sql = neon();

    const rows = await sql`
      update items
      set price_gbp = ${Math.round(priceNow)},
          original_price = ${orig},
          updated_at = now()
      where id = ${id}
      returning id, price_gbp, original_price
    `;

    return new Response(JSON.stringify(rows[0] ?? null), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "DB update failed", detail: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};
