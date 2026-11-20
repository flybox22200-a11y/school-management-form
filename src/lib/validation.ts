import {
  OTHER,
  QUESTIONS,
  type Answer,
  type Answers,
  type Question,
  type RepeaterRow,
  type Special,
  isAnswered,
  specialsFor,
} from "./questionnaire";

export const LIMITS = {
  shortText: 300,
  longText: 5000,
  repeaterRows: 25,
  maxNumber: 100000,
};

export type ValidationErrors = Record<string, string>;

const str = (x: unknown, max: number): string =>
  typeof x === "string" ? x.slice(0, max) : "";

/**
 * Validate a single question's answer. Returns an error message or null.
 * Used both client-side (per section) and server-side (whole form).
 */
export function validateQuestion(q: Question, a: Answer | undefined): string | null {
  if (!isAnswered(q, a)) {
    return q.required ? "Please answer this question." : null;
  }
  if (!a || a.special) return null;

  const v = a.value;
  if (q.type === "single" && v === OTHER && !a.other?.trim()) {
    return "Please specify “Other”.";
  }
  if (q.type === "multi" && Array.isArray(v) && (v as string[]).includes(OTHER) && !a.other?.trim()) {
    return "Please specify “Other”.";
  }
  if (q.type === "number" && typeof v === "string") {
    if (!/^\d+$/.test(v.trim())) return "Please enter a whole number (0 or more).";
    if (Number(v) > LIMITS.maxNumber) return "That number looks too large.";
  }
  if (q.type === "repeater" && Array.isArray(v)) {
    for (const row of v as RepeaterRow[]) {
      for (const f of q.fields) {
        const cell = row[f.key]?.trim();
        if (f.input === "number" && cell && !/^\d+$/.test(cell)) {
          return `“${f.label}” must be a whole number.`;
        }
      }
    }
  }
  return null;
}

export function validateQuestions(qs: Question[], answers: Answers): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const q of qs) {
    const err = validateQuestion(q, answers[q.id]);
    if (err) errors[q.id] = err;
  }
  return errors;
}

/**
 * Coerce untrusted input into a clean Answers object containing only known
 * question ids and well-formed values. Unknown keys are dropped.
 */
export function sanitizeAnswers(input: unknown): Answers {
  const out: Answers = {};
  if (!input || typeof input !== "object") return out;
  const raw = input as Record<string, unknown>;

  for (const q of QUESTIONS) {
    const a = raw[q.id];
    if (!a || typeof a !== "object") continue;
    const ra = a as Record<string, unknown>;
    const clean: Answer = {};

    const special = ra.special as Special | undefined;
    if (special && specialsFor(q).includes(special)) {
      clean.special = special;
      out[q.id] = clean;
      continue;
    }

    switch (q.type) {
      case "single": {
        const v = str(ra.value, 100);
        if (q.options.some((o) => o.value === v)) clean.value = v;
        break;
      }
      case "multi": {
        if (Array.isArray(ra.value)) {
          const allowed = new Set(q.options.map((o) => o.value));
          clean.value = [...new Set(ra.value.filter((x): x is string => typeof x === "string" && allowed.has(x)))];
        }
        break;
      }
      case "text":
        clean.value = str(ra.value, LIMITS.shortText);
        break;
      case "longtext":
        clean.value = str(ra.value, LIMITS.longText);
        break;
      case "number":
        clean.value = str(ra.value, 10).trim();
        break;
      case "repeater": {
        if (Array.isArray(ra.value)) {
          clean.value = ra.value
            .slice(0, LIMITS.repeaterRows)
            .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
            .map((r) =>
              Object.fromEntries(q.fields.map((f) => [f.key, str(r[f.key], LIMITS.shortText)])),
            )
            .filter((r) => Object.values(r).some((x) => x.trim()));
        }
        break;
      }
      case "fields": {
        if (ra.value && typeof ra.value === "object" && !Array.isArray(ra.value)) {
          const rv = ra.value as Record<string, unknown>;
          clean.value = Object.fromEntries(
            q.fields.map((f) => [
              f.key,
              str(rv[f.key], f.input === "longtext" ? LIMITS.longText : LIMITS.shortText),
            ]),
          );
        }
        break;
      }
    }

    const hasOther =
      (q.type === "single" && clean.value === OTHER) ||
      (q.type === "multi" && Array.isArray(clean.value) && (clean.value as string[]).includes(OTHER));
    if (hasOther) clean.other = str(ra.other, LIMITS.shortText);

    const explainAllowed =
      !!q.explain || (!!q.explainWhen && clean.value === q.explainWhen.value);
    if (explainAllowed) {
      const e = str(ra.explain, LIMITS.longText);
      if (e.trim()) clean.explain = e;
    }

    if (isAnswered(q, clean)) out[q.id] = clean;
  }
  return out;
}
