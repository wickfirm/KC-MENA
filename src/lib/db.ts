import postgres from "postgres";

/**
 * Thin data-access helper over postgres.js — the driver recommended by
 * Supabase for direct SQL (works with the session/transaction pooler).
 *
 * Usage: const rows = await query<NewsRow>("SELECT * FROM news_posts WHERE status = $1", ["published"]);
 */
declare global {
  // Cache the connection across hot reloads / warm serverless invocations.
  // eslint-disable-next-line no-var
  var __pg: postgres.Sql | undefined;
}

function client(): postgres.Sql {
  if (!global.__pg) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    global.__pg = postgres(url, {
      // Required when using Supabase's transaction pooler (port 6543):
      prepare: false,
    });
  }
  return global.__pg;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  return (await client().unsafe(text, params as never[])) as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
