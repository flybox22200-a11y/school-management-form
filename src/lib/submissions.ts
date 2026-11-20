import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STATUS_OPTIONS, CAMPUS_OPTIONS, type Answers, type SubmissionStatus } from "./questionnaire";

export type SubmissionRow = {
  id: string;
  created_at: string;
  campus: string;
  respondent_role: string;
  management_involvement: string;
  employee_count: string | null;
  management_familiarity: string | null;
  answers: Answers;
  status: SubmissionStatus;
  reference_code: string;
  admin_notes: string | null;
  schema_version: number;
};

export type Filters = {
  campus?: string;
  status?: string;
  role?: string;
  q?: string;
  from?: string;
  to?: string;
  page: number;
};

export const PAGE_SIZE = 25;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const campus = one("campus");
  const status = one("status");
  const from = one("from");
  const to = one("to");
  return {
    campus: CAMPUS_OPTIONS.some((o) => o.value === campus) ? campus : undefined,
    status: STATUS_OPTIONS.some((o) => o.value === status) ? status : undefined,
    role: one("role")?.slice(0, 80),
    q: one("q")?.slice(0, 80),
    from: from && DATE_RE.test(from) ? from : undefined,
    to: to && DATE_RE.test(to) ? to : undefined,
    page: Math.max(1, Number.parseInt(one("page") ?? "1", 10) || 1),
  };
}

export function filtersToSearch(f: Partial<Filters>, overrides: Partial<Filters> = {}): string {
  const merged = { ...f, ...overrides };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === "" || (k === "page" && v === 1)) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Escape characters with special meaning in PostgREST `ilike` patterns. */
const likeEscape = (s: string) => s.replace(/[\\%_,()]/g, (c) => `\\${c}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<Q extends { eq: any; ilike: any; or: any; gte: any; lt: any }>(query: Q, f: Filters): Q {
  let q = query;
  if (f.campus) q = q.eq("campus", f.campus);
  if (f.status) q = q.eq("status", f.status);
  if (f.role) q = q.ilike("respondent_role", `%${likeEscape(f.role)}%`);
  if (f.q) q = q.ilike("reference_code", `%${likeEscape(f.q)}%`);
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00+05:00`);
  if (f.to) {
    const end = new Date(`${f.to}T00:00:00+05:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    q = q.lt("created_at", end.toISOString());
  }
  return q;
}

export async function listSubmissions(supabase: SupabaseClient, f: Filters) {
  const start = (f.page - 1) * PAGE_SIZE;
  const query = applyFilters(
    supabase
      .from("submissions")
      .select(
        "id, created_at, campus, respondent_role, management_involvement, employee_count, status, reference_code",
        { count: "exact" },
      ),
    f,
  )
    .order("created_at", { ascending: false })
    .range(start, start + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Omit<SubmissionRow, "answers" | "admin_notes" | "management_familiarity" | "schema_version">[], count: count ?? 0 };
}

export async function exportSubmissions(supabase: SupabaseClient, f: Filters): Promise<SubmissionRow[]> {
  const all: SubmissionRow[] = [];
  const batch = 1000;
  for (let start = 0; ; start += batch) {
    const { data, error } = await applyFilters(supabase.from("submissions").select("*"), f)
      .order("created_at", { ascending: true })
      .range(start, start + batch - 1);
    if (error) throw new Error(error.message);
    all.push(...((data ?? []) as SubmissionRow[]));
    if (!data || data.length < batch) break;
  }
  return all;
}

export async function getStats(supabase: SupabaseClient) {
  const count = async (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const { count } = await build(base());
    return count ?? 0;
  };
  const base = () => supabase.from("submissions").select("id", { count: "exact", head: true });
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const [total, ringRoad, kabootar, both, unreviewed, week] = await Promise.all([
    count((q) => q),
    count((q) => q.eq("campus", "ring_road")),
    count((q) => q.eq("campus", "kabootar_chowk")),
    count((q) => q.eq("campus", "both")),
    count((q) => q.eq("status", "new")),
    count((q) => q.gte("created_at", weekAgo)),
  ]);
  return { total, ringRoad, kabootar, both, unreviewed, week };
}

/** Rebuild the full answers object (q1–q38) from a row's columns + JSONB. */
export function rowToAnswers(row: SubmissionRow): Answers {
  const a: Answers = { ...(row.answers ?? {}) };
  const col = (v: string | null) =>
    v === "dont_know" || v === "declined" ? { special: v } : v ? { value: v } : undefined;
  a.q1 = { value: row.campus };
  if (!a.q2) {
    const r = row.respondent_role;
    a.q2 = r.startsWith("other: ")
      ? { value: "other", other: r.slice(7) }
      : (col(r) as Answers[string]);
  }
  a.q3 = { value: row.management_involvement };
  const q4 = col(row.employee_count);
  const q5 = col(row.management_familiarity);
  if (q4) a.q4 = q4 as Answers[string];
  if (q5) a.q5 = q5 as Answers[string];
  return a;
}

export function formatDate(iso: string, withTime = true): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}
