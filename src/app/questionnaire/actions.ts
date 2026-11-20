"use server";

import { randomInt } from "node:crypto";
import { QUESTIONS, SCHEMA_VERSION, OTHER, type Answers } from "@/lib/questionnaire";
import { sanitizeAnswers, validateQuestions, type ValidationErrors } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; errors?: ValidationErrors };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function makeReference(): string {
  const pick = (n: number) =>
    Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `SMR-${pick(4)}-${pick(4)}`;
}

function roleColumn(answers: Answers): string {
  const a = answers.q2;
  if (!a) return "unknown";
  if (a.special) return a.special;
  if (a.value === OTHER) return `other: ${a.other?.trim() ?? ""}`.slice(0, 200);
  return String(a.value);
}

const scalar = (answers: Answers, id: string): string | null => {
  const a = answers[id];
  if (!a) return null;
  return a.special ?? (typeof a.value === "string" ? a.value : null);
};

export async function submitQuestionnaire(payload: {
  answers: unknown;
  consent: boolean;
  website?: string; // honeypot
}): Promise<SubmitResult> {
  // Bots tend to fill every field; humans never see this one.
  if (payload.website) {
    return { ok: true, reference: makeReference() };
  }
  if (!payload.consent) {
    return { ok: false, message: "Please confirm the consent statement before submitting." };
  }

  const answers = sanitizeAnswers(payload.answers);
  const errors = validateQuestions(QUESTIONS, answers);
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Some answers need attention. Please review the highlighted questions.",
      errors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "The portal is not connected to its database yet. Please contact the researcher.",
    };
  }

  // q1, q3–q5 live in dedicated columns; q2 is kept in `answers` too so the
  // raw "Other" text survives alongside the flattened role column.
  const { q1, q3, q4: _q4, q5: _q5, ...rest } = answers;
  void _q4;
  void _q5;
  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference();
    const { error } = await supabase.from("submissions").insert({
      campus: q1?.value as string,
      respondent_role: roleColumn(answers),
      management_involvement: q3?.value as string,
      employee_count: scalar(answers, "q4"),
      management_familiarity: scalar(answers, "q5"),
      answers: rest,
      reference_code: reference,
      schema_version: SCHEMA_VERSION,
    });

    if (!error) return { ok: true, reference };
    // 23505 = unique violation on reference_code → retry with a new code.
    if (error.code !== "23505") {
      console.error("Submission insert failed:", error.message);
      return {
        ok: false,
        message: "We couldn't save your response. Please try again in a moment.",
      };
    }
  }
  return { ok: false, message: "We couldn't save your response. Please try again." };
}
