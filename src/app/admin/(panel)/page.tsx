import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { CAMPUS_OPTIONS, QUESTION_BY_ID, STATUS_OPTIONS, campusLabel, optionLabel } from "@/lib/questionnaire";
import {
  PAGE_SIZE,
  filtersToSearch,
  formatDate,
  getStats,
  listSubmissions,
  parseFilters,
  type Filters,
} from "@/lib/submissions";
import { StatusBadge } from "./StatusBadge";

export const metadata: Metadata = { title: "Responses" };

export default function DashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Responses</h1>
          <p className="mt-1 text-sm text-ink-soft">All questionnaire submissions, newest first.</p>
        </div>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const { supabase } = await requireAdmin();
  const filters = parseFilters(await searchParams);
  const [stats, { rows, count }] = await Promise.all([getStats(supabase), listSubmissions(supabase, filters)]);
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const exportQs = filtersToSearch({ ...filters, page: 1 });
  const hasFilters = !!(filters.campus || filters.status || filters.role || filters.q || filters.from || filters.to);

  return (
    <>
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total responses" value={stats.total} strong />
        <Stat label="Ring Road" value={stats.ringRoad} />
        <Stat label="Kabootar Chowk" value={stats.kabootar} />
        <Stat label="Both campuses" value={stats.both} />
        <Stat label="Not yet reviewed" value={stats.unreviewed} hint={`${stats.week} in the last 7 days`} />
      </section>

      <FilterBar filters={filters} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {count === 0 ? "No responses" : `${count} response${count === 1 ? "" : "s"}`}
          {hasFilters && " match these filters"}
        </p>
        <div className="flex gap-2">
          <a
            href={`/admin/export${exportQs}${exportQs ? "&" : "?"}format=csv`}
            className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-ink-faint"
          >
            Export CSV
          </a>
          <a
            href={`/admin/export${exportQs}${exportQs ? "&" : "?"}format=json`}
            className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-ink-faint"
          >
            Export JSON
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <p className="font-medium text-ink">{hasFilters ? "Nothing matches these filters." : "No responses yet."}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {hasFilters ? (
              <Link href="/admin" className="text-accent hover:underline">
                Clear filters
              </Link>
            ) : (
              <>
                Share the questionnaire link: <span className="font-mono">/questionnaire</span>
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          {/* Desktop table */}
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Campus</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Involvement</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.map((r) => (
                <tr key={r.id} className="group relative transition hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/submissions/${r.id}`}
                      className="font-mono font-medium text-ink after:absolute after:inset-0 group-hover:text-accent"
                    >
                      {r.reference_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 text-ink">{campusLabel(r.campus)}</td>
                  <td className="px-4 py-3 text-ink">{roleLabel(r.respondent_role)}</td>
                  <td className="px-4 py-3 text-ink-soft">{optionLabel(QUESTION_BY_ID.q3, r.management_involvement)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile list */}
          <ul className="divide-y divide-line/70 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/submissions/${r.id}`} className="block px-4 py-3.5 active:bg-paper">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-medium text-ink">{r.reference_code}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {roleLabel(r.respondent_role)} · {campusLabel(r.campus)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">{formatDate(r.created_at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
          <PageLink filters={filters} page={filters.page - 1} disabled={filters.page <= 1}>
            ← Newer
          </PageLink>
          <span className="text-ink-soft">
            Page {filters.page} of {pages}
          </span>
          <PageLink filters={filters} page={filters.page + 1} disabled={filters.page >= pages}>
            Older →
          </PageLink>
        </nav>
      )}
    </>
  );
}

function roleLabel(role: string) {
  if (role.startsWith("other: ")) return role.slice(7) || "Other";
  if (role === "declined") return "Declined";
  return optionLabel(QUESTION_BY_ID.q2, role);
}

function PageLink({
  filters,
  page,
  disabled,
  children,
}: {
  filters: Filters;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) return <span className="px-3 py-2 text-ink-faint">{children}</span>;
  return (
    <Link href={`/admin${filtersToSearch(filters, { page })}`} className="rounded-lg px-3 py-2 font-medium text-accent hover:bg-white">
      {children}
    </Link>
  );
}

function Stat({ label, value, hint, strong }: { label: string; value: number; hint?: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${strong ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
      <p className={`text-xs ${strong ? "text-white/70" : "text-ink-soft"}`}>{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

const control =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15";

function FilterBar({ filters }: { filters: Filters }) {
  return (
    <form method="get" action="/admin" className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto]">
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">Campus</span>
        <select name="campus" defaultValue={filters.campus ?? ""} className={control}>
          <option value="">All campuses</option>
          {CAMPUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">Status</span>
        <select name="status" defaultValue={filters.status ?? ""} className={control}>
          <option value="">Any status</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">Role contains</span>
        <input name="role" defaultValue={filters.role} placeholder="e.g. teacher" className={control} />
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">Reference code</span>
        <input name="q" defaultValue={filters.q} placeholder="SMR-…" className={`${control} font-mono`} />
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">From</span>
        <input type="date" name="from" defaultValue={filters.from} className={control} />
      </label>
      <label className="grid gap-1">
        <span className="text-xs font-medium text-ink-soft">To</span>
        <input type="date" name="to" defaultValue={filters.to} className={control} />
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90">
          Apply
        </button>
        <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:text-ink">
          Reset
        </Link>
      </div>
    </form>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[92px] rounded-2xl bg-paper-2" />
        ))}
      </div>
      <div className="mt-6 h-20 rounded-2xl bg-paper-2" />
      <div className="mt-6 h-96 rounded-2xl bg-paper-2" />
    </div>
  );
}
