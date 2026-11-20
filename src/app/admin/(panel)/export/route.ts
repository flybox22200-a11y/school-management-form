import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { QUESTIONS, STATUS_OPTIONS, campusLabel, formatAnswer } from "@/lib/questionnaire";
import { exportSubmissions, parseFilters, rowToAnswers } from "@/lib/submissions";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Re-verify the session and admin membership here — route handlers are
  // not protected by page-level checks. RLS also blocks non-admin reads.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp = Object.fromEntries(request.nextUrl.searchParams.entries());
  const format = sp.format === "json" ? "json" : "csv";
  const rows = await exportSubmissions(supabase, parseFilters(sp));
  const stamp = new Date().toISOString().slice(0, 10);

  const headers = {
    "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename="school-research-responses-${stamp}.${format}"`,
  };

  if (format === "json") {
    const body = rows.map((r) => ({
      id: r.id,
      reference_code: r.reference_code,
      created_at: r.created_at,
      status: r.status,
      admin_notes: r.admin_notes,
      campus: r.campus,
      respondent_role: r.respondent_role,
      management_involvement: r.management_involvement,
      employee_count: r.employee_count,
      management_familiarity: r.management_familiarity,
      schema_version: r.schema_version,
      answers: rowToAnswers(r),
    }));
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
  const header = [
    "Reference",
    "Submitted (UTC)",
    "Status",
    "Researcher notes",
    "Campus",
    ...QUESTIONS.map((q) => `Q${q.number}. ${q.prompt}`),
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    const a = rowToAnswers(r);
    lines.push(
      [
        r.reference_code,
        r.created_at,
        statusLabel(r.status),
        r.admin_notes ?? "",
        campusLabel(r.campus),
        ...QUESTIONS.map((q) => formatAnswer(q, a[q.id])),
      ]
        .map(csvCell)
        .join(","),
    );
  }

  // BOM so Excel opens UTF-8 correctly; CRLF per RFC 4180.
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
  });
}

function csvCell(value: string): string {
  let v = value ?? "";
  // Guard against spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
