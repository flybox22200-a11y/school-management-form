import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import {
  OTHER,
  SECTIONS,
  SPECIAL_LABELS,
  campusLabel,
  formatAnswer,
  optionLabel,
  type Answer,
  type Question,
  type RepeaterRow,
} from "@/lib/questionnaire";
import { formatDate, rowToAnswers, type SubmissionRow } from "@/lib/submissions";
import { StatusBadge } from "../../StatusBadge";
import { ReviewForm } from "./ReviewForm";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Response" };

export default function SubmissionPage({ params }: PageProps<"/admin/submissions/[id]">) {
  return (
    <>
      <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink print:hidden">
        ← All responses
      </Link>
      <Suspense fallback={<div className="mt-6 h-[60vh] animate-pulse rounded-2xl bg-paper-2" />}>
        <Submission params={params} />
      </Suspense>
    </>
  );
}

async function Submission({ params }: { params: PageProps<"/admin/submissions/[id]">["params"] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();

  const row = data as SubmissionRow;
  const answers = rowToAnswers(row);

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm font-medium text-accent">{row.reference_code}</p>
            <h1 className="mt-1 font-serif text-3xl text-ink">{campusLabel(row.campus)}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Submitted {formatDate(row.created_at)} · {formatAnswer(SECTIONS[0].questions[1], answers.q2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status} />
            <PrintButton />
          </div>
        </header>

        <div className="mt-6 grid gap-5">
          {SECTIONS.map((s) => (
            <section key={s.id} className="break-inside-avoid-page rounded-2xl border border-line bg-white">
              <h2 className="border-b border-line px-5 py-3 text-[15px] font-semibold text-ink">
                {s.code && <span className="mr-2 font-mono text-xs font-medium text-accent">{s.code}</span>}
                {s.title}
              </h2>
              <dl className="divide-y divide-line/70">
                {s.questions.map((q) => (
                  <div key={q.id} className="px-5 py-4">
                    <dt className="text-sm text-ink-soft">
                      <span className="mr-1.5 font-mono text-xs text-ink-faint">Q{q.number}</span>
                      {q.prompt}
                    </dt>
                    <dd className="mt-1.5 text-[15px] text-ink">
                      <AnswerView q={q} a={answers[q.id]} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <aside className="print:hidden">
        <div className="sticky top-6 rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[15px] font-semibold text-ink">Review</h2>
          <p className="mt-1 mb-4 text-xs text-ink-soft">Private to researchers. Never shown to respondents.</p>
          <ReviewForm id={row.id} status={row.status} notes={row.admin_notes ?? ""} />
        </div>
      </aside>
    </div>
  );
}

function Empty({ children = "Not answered" }: { children?: React.ReactNode }) {
  return <span className="italic text-ink-faint">{children}</span>;
}

function AnswerView({ q, a }: { q: Question; a: Answer | undefined }) {
  if (!a) return <Empty />;
  if (a.special) {
    return (
      <span className="inline-flex rounded-full border border-line bg-paper px-2.5 py-0.5 text-sm text-ink-soft">
        {SPECIAL_LABELS[a.special]}
      </span>
    );
  }
  const explain = a.explain?.trim() ? (
    <p className="mt-2 border-l-2 border-line pl-3 text-sm whitespace-pre-line text-ink-soft">{a.explain}</p>
  ) : null;

  switch (q.type) {
    case "single": {
      const v = a.value as string;
      return (
        <>
          {v ? (v === OTHER ? `Other: ${a.other ?? ""}` : optionLabel(q, v)) : <Empty />}
          {explain}
        </>
      );
    }
    case "multi": {
      const vs = (a.value as string[]) ?? [];
      if (!vs.length) return <Empty />;
      return (
        <ul className="flex flex-wrap gap-1.5">
          {vs.map((v) => (
            <li key={v} className="rounded-md border border-line bg-paper px-2 py-0.5 text-sm">
              {v === OTHER ? `Other: ${a.other ?? ""}` : optionLabel(q, v)}
            </li>
          ))}
        </ul>
      );
    }
    case "text":
    case "longtext":
    case "number": {
      const v = (a.value as string)?.trim();
      return v ? (
        <p className="whitespace-pre-line leading-relaxed">
          {v}
          {q.type === "number" && q.unit ? ` ${q.unit}` : ""}
        </p>
      ) : (
        <Empty />
      );
    }
    case "repeater": {
      const rows = ((a.value as RepeaterRow[]) ?? []).filter((r) => Object.values(r).some((x) => x?.trim()));
      if (!rows.length) return <Empty />;
      return (
        <table className="w-full max-w-lg text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-faint">
              {q.fields.map((f) => (
                <th key={f.key} className="pb-1 font-medium">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.map((r, i) => (
              <tr key={i}>
                {q.fields.map((f) => (
                  <td key={f.key} className="py-1.5 pr-4">
                    {r[f.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "fields": {
      const rec = (a.value as Record<string, string>) ?? {};
      return (
        <dl className="grid gap-2">
          {q.fields.map((f) => (
            <div key={f.key} className="grid gap-0.5 sm:grid-cols-[180px_1fr] sm:gap-3">
              <dt className="text-sm text-ink-faint">{f.label}</dt>
              <dd className="whitespace-pre-line">{rec[f.key]?.trim() || <Empty>—</Empty>}</dd>
            </div>
          ))}
        </dl>
      );
    }
  }
}
