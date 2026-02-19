import { neon } from "@netlify/neon";

export default async () => {
  try {
    const sql = neon();

    await sql`
      create table if not exists items (
        id text primary key,
        title text not null,
        description text not null default '',
        price_gbp integer not null,
        images text[] not null default '{}',
        sold boolean not null default false,
        sort_order integer not null default 0,
        updated_at timestamptz not null default now()
      );
    `;

    return Response.json({ ok: true });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
};