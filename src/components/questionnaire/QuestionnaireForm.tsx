"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  QUESTIONS,
  SECTIONS,
  formatAnswer,
  isAnswered,
  type Answer,
  type Answers,
} from "@/lib/questionnaire";
import { validateQuestions, type ValidationErrors } from "@/lib/validation";
import { submitQuestionnaire } from "@/app/questionnaire/actions";
import { QuestionField } from "./QuestionField";

const DRAFT_KEY = "smr-questionnaire-draft-v1";
const REVIEW = SECTIONS.length; // step index of the review screen

type Draft = { answers: Answers; step: number; savedAt: number };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function QuestionnaireForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [restored, setRestored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore a saved draft once, after mount.
  useEffect(() => {
    const d = readDraft();
    if (d && Object.keys(d.answers ?? {}).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setAnswers(d.answers);
      setStep(Math.min(Math.max(0, d.step ?? 0), REVIEW));
      setRestored(true);
    }
    setLoaded(true);
  }, []);

  // Autosave on every change.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step, savedAt: Date.now() } satisfies Draft));
    } catch {
      /* storage unavailable — answers still live in memory */
    }
  }, [answers, step, loaded]);

  const setAnswer = (id: string, next: Answer | undefined) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      if (next === undefined) delete copy[id];
      else copy[id] = next;
      return copy;
    });
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const goTo = (s: number) => {
    setStep(s);
    setSubmitError(null);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const focusFirstError = (errs: ValidationErrors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`question-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      el?.querySelector<HTMLElement>("input,textarea,select,button")?.focus({ preventScroll: true });
    });
  };

  const next = () => {
    const section = SECTIONS[step];
    const errs = validateQuestions(section.questions, answers);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError(errs);
      return;
    }
    goTo(step + 1);
  };

  const startOver = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setAnswers({});
    setErrors({});
    setRestored(false);
    setConsent(false);
    goTo(0);
  };

  const submit = () => {
    const errs = validateQuestions(QUESTIONS, answers);
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstId = Object.keys(errs)[0];
      const idx = SECTIONS.findIndex((s) => s.questions.some((q) => q.id === firstId));
      goTo(idx);
      focusFirstError(errs);
      return;
    }
    if (!consent) {
      setSubmitError("Please tick the consent box to submit.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const res = await submitQuestionnaire({
        answers,
        consent,
        website: honeypot.current?.value || undefined,
      });
      if (res.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
        router.push(`/thank-you?ref=${encodeURIComponent(res.reference)}`);
      } else {
        setSubmitError(res.message);
        if (res.errors && Object.keys(res.errors).length) {
          setErrors(res.errors);
        }
      }
    });
  };

  const answeredCount = QUESTIONS.filter((q) => isAnswered(q, answers[q.id])).length;
  const progress = Math.round((step / REVIEW) * 100);
  const section = SECTIONS[step];

  return (
    <div ref={topRef} className="scroll-mt-4">
      {/* Progress */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4 text-xs text-ink-soft">
          <span className="font-medium text-ink">
            {step < REVIEW ? (
              <>
                Section {step + 1} of {SECTIONS.length}
                <span className="hidden sm:inline"> · {section.title}</span>
              </>
            ) : (
              "Review & submit"
            )}
          </span>
          <span>
            {answeredCount} of {QUESTIONS.length} answered
          </span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Questionnaire progress"
        >
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(progress, 3)}%` }} />
        </div>
        <ol className="mt-2.5 hidden gap-1 md:flex" aria-label="Sections">
          {SECTIONS.map((s, i) => (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => (i < step ? goTo(i) : undefined)}
                disabled={i >= step}
                title={s.title}
                className={`block h-1 w-full rounded-full transition ${
                  i < step ? "cursor-pointer bg-accent/60 hover:bg-accent" : i === step ? "bg-ink" : "bg-line"
                }`}
              >
                <span className="sr-only">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {restored && step < REVIEW && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          <span>Welcome back — we restored the answers you saved on this device.</span>
          <button type="button" onClick={startOver} className="font-medium underline underline-offset-2 hover:no-underline">
            Start over
          </button>
        </div>
      )}

      {/* Honeypot (hidden from people and assistive tech) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {step < REVIEW ? (
        <section key={section.id} className="animate-fade-in pt-8" aria-labelledby={`sec-${section.id}`}>
          <header className="mb-6">
            {section.code && (
              <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">{section.code}</p>
            )}
            <h2 id={`sec-${section.id}`} className="mt-1 font-serif text-[28px] leading-tight text-ink sm:text-3xl">
              {section.title}
            </h2>
            {section.purpose && <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">{section.purpose}</p>}
            {section.note && (
              <p className="mt-4 rounded-xl border-l-4 border-gold bg-gold-soft px-4 py-3 text-sm text-ink">
                <strong className="font-semibold">Important: </strong>
                {section.note}
              </p>
            )}
          </header>

          {Object.keys(errors).length > 0 && (
            <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              Please complete the highlighted question{Object.keys(errors).length > 1 ? "s" : ""} before continuing.
            </p>
          )}

          <div className="grid gap-4">
            {section.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                answer={answers[q.id]}
                allAnswers={answers}
                error={errors[q.id]}
                onChange={(n) => setAnswer(q.id, n)}
              />
            ))}
          </div>
        </section>
      ) : (
        <Review answers={answers} onEdit={goTo} consent={consent} setConsent={setConsent} />
      )}

      {submitError && (
        <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      {/* Navigation */}
      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 0 || pending}
          className="rounded-xl px-4 py-3 text-[15px] font-medium text-ink-soft transition hover:bg-white hover:text-ink disabled:invisible"
        >
          ← Previous
        </button>
        {step < REVIEW ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-ink px-6 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
          >
            {step === REVIEW - 1 ? "Review answers" : "Next"} →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-accent-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 disabled:opacity-70"
          >
            {pending && (
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {pending ? "Submitting…" : "Submit response"}
          </button>
        )}
      </nav>
      {step < REVIEW && (
        <p className="mt-3 text-center text-xs text-ink-faint">Your answers are saved on this device as you go.</p>
      )}
    </div>
  );
}

function Review({
  answers,
  onEdit,
  consent,
  setConsent,
}: {
  answers: Answers;
  onEdit: (step: number) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
}) {
  return (
    <section className="animate-fade-in pt-8" aria-labelledby="review-title">
      <header className="mb-6">
        <h2 id="review-title" className="font-serif text-[28px] leading-tight text-ink sm:text-3xl">
          Review your answers
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
          Check everything below. Use <em>Edit</em> to change a section — your other answers will be kept.
        </p>
      </header>

      <div className="grid gap-4">
        {SECTIONS.map((s, i) => (
          <div key={s.id} className="rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <h3 className="text-[15px] font-semibold text-ink">
                {s.code && <span className="mr-2 font-mono text-xs font-medium text-accent">{s.code}</span>}
                {s.title}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="rounded-lg px-2.5 py-1 text-sm font-medium text-accent transition hover:bg-accent-soft"
              >
                Edit
              </button>
            </div>
            <dl className="divide-y divide-line/70">
              {s.questions.map((q) => {
                const text = formatAnswer(q, answers[q.id]);
                return (
                  <div key={q.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
                    <dt className="text-sm text-ink-soft">
                      <span className="mr-1.5 font-mono text-xs text-ink-faint">Q{q.number}</span>
                      {q.prompt}
                    </dt>
                    <dd className={`whitespace-pre-line text-sm ${text ? "text-ink" : "italic text-ink-faint"}`}>
                      {text || "Not answered"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-5 text-[15px] text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
        />
        <span>
          I confirm that my answers reflect my actual experience and knowledge, and I agree that they may be used for
          academic research purposes.
        </span>
      </label>
    </section>
  );
}
