import { query } from "@/lib/db";

export type PublicProject = {
  id: number;
  slug: string;
  name: string;
  sector: string;
  location: string | null;
  summary: string | null;
  images: string[];
};

/**
 * Published projects for a business-page sector. Returns [] when the database
 * is unavailable — the surrounding page must never fail because of projects.
 */
export async function getPublishedProjectsBySector(sector: string): Promise<PublicProject[]> {
  try {
    const rows = await query<{ id: number; slug: string; name: string; sector: string; location: string | null; summary: string | null; images: unknown }>(
      `SELECT slug, name, sector, location, summary, images FROM projects
       WHERE sector = $1 AND status = 'published'
       ORDER BY sort_order ASC, created_at DESC`,
      [sector]
    );
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sector: row.sector,
      location: row.location,
      summary: row.summary,
      images: Array.isArray(row.images) ? (row.images as string[]) : [],
    }));
  } catch {
    return [];
  }
}