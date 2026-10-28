import { query, isMySqlConfigured } from "./mysql";
import initialMilestones from "@/data/milestone.json";

export interface TimelineEvent {
  id: string;
  year: string;
  date_label: string;
  event_date?: string;
  title: string;
  description: string;
  image_url: string | null;
  handwriting_caption?: string;
  sort_order?: number;
  is_active?: boolean | number;
}

export interface TimelineData {
  years: string[];
  events: TimelineEvent[];
}

export function getFallbackTimelineData(): TimelineData {
  const events = (initialMilestones || []) as TimelineEvent[];
  const yearsSet = new Set<string>();
  events.forEach((ev) => {
    yearsSet.add(String(ev.year || "2026"));
  });
  const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
  return { years, events };
}

/**
 * Fetch data milestone/timeline dari MySQL (source of truth).
 * Fallback ke milestone.json hanya jika MySQL tidak tersedia/gagal.
 */
export async function getTimelineData(): Promise<TimelineData> {
  if (isMySqlConfigured()) {
    try {
      const rows = await query<any[]>(
        "SELECT * FROM `timeline` WHERE `is_active` = 1 ORDER BY `year` ASC, `sort_order` ASC, `id` ASC"
      );
      if (rows && Array.isArray(rows) && rows.length > 0) {
        const yearsSet = new Set<string>();
        const events: TimelineEvent[] = rows.map((r) => {
          const yr = String(r.year || "2026");
          yearsSet.add(yr);
          return {
            id: String(r.id),
            year: yr,
            date_label: r.date_label || "",
            event_date: r.event_date || r.date_label || "",
            title: r.title || "",
            description: r.description || "",
            image_url: r.image_url || null,
            handwriting_caption: r.handwriting_caption || r.date_label || "",
            sort_order: r.sort_order || 0,
            is_active: Boolean(r.is_active),
          };
        });
        const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));
        return { years, events };
      }
    } catch (e: any) {
      console.warn("[TimelineService] MySQL fetch failed, falling back to static data:", e?.message);
    }
  }

  return getFallbackTimelineData();
}
