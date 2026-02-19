import { neon } from "@netlify/neon";

export default async () => {
  try {
    const sql = neon(); // uses NETLIFY_DATABASE_URL in Netlify

    const rows = await sql`
      select id, title, description, price_gbp, original_price, dimensions, item_link, images, sold, sort_order
      from items
      order by sort_order asc, updated_at desc
    `;

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to load items", detail: String(err) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};