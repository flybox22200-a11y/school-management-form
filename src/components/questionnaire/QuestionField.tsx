"use client";

import { useId } from "react";
import {
  OTHER,
  QUESTION_BY_ID,
  SPECIAL_LABELS,
  optionLabel,
  specialsFor,
  type Answer,
  type Answers,
  type Question,
  type RepeaterRow,
  type Special,
  type SubField,
} from "@/lib/questionnaire";
import { LIMITS } from "@/lib/validation";

type Props = {
  question: Question;
  answer: Answer | undefined;
  allAnswers: Answers;
  error?: string;
  onChange: (next: Answer | undefined) => void;
};

const inputBase =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint shadow-xs transition focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 disabled:bg-paper-2 disabled:text-ink-faint";

export function QuestionField({ question: q, answer, allAnswers, error, onChange }: Props) {
  const uid = useId();
  const a = answer ?? {};
  const special = a.special;
  const disabled = !!special;
  const errId = `${uid}-err`;
  const helpId = `${uid}-help`;

  const set = (patch: Partial<Answer>) => onChange({ ...a, ...patch });

  const toggleSpecial = (s: Special) =>
    onChange({ ...a, special: special === s ? undefined : s });

  return (
    <fieldset
      id={`question-${q.id}`}
      aria-invalid={!!error}
      aria-describedby={[q.help ? helpId : "", error ? errId : ""].filter(Boolean).join(" ") || undefined}
      className={`scroll-mt-28 rounded-2xl border bg-white p-5 sm:p-6 transition ${
        error ? "border-danger/60 ring-3 ring-danger/10" : "border-line"
      }`}
    >
      <legend className="sr-only">
        Question {q.number}: {q.prompt}
      </legend>
      <div aria-hidden className="flex gap-3">
        <span className="mt-0.5 shrink-0 font-mono text-xs font-medium tracking-wide text-accent">
          Q{q.number}
        </span>
        <p className="text-[16px] font-medium leading-snug text-ink">
          {q.prompt}
          {q.required && (
            <span className="ml-1 text-danger" title="Required">
              *
            </span>
          )}
        </p>
      </div>

      <div className="mt-1 pl-0 sm:pl-9">
        {q.help && (
          <p id={helpId} className="mt-1 text-sm text-ink-soft">
            {q.help}
          </p>
        )}
        {q.hints && (
          <ul className="mt-2 grid gap-1 text-sm text-ink-soft sm:grid-cols-2">
            {q.hints.map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden className="text-accent">
                  ›
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className={`mt-4 ${disabled ? "pointer-events-none opacity-45" : ""}`} inert={disabled}>
          <Input q={q} a={a} set={set} allAnswers={allAnswers} uid={uid} />
        </div>

        {specialsFor(q).length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-faint">Jawab nahi de sakte?</span>
            {specialsFor(q).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={special === s}
                onClick={() => toggleSpecial(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  special === s
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-paper text-ink-soft hover:border-ink-faint hover:text-ink"
                }`}
              >
                {SPECIAL_LABELS[s]}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p id={errId} role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-danger">
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-current">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.75 4.5h1.5v5h-1.5v-5zm0 6.5h1.5v1.5h-1.5V13z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}

type InputProps = {
  q: Question;
  a: Answer;
  set: (p: Partial<Answer>) => void;
  allAnswers: Answers;
  uid: string;
};

function Input({ q, a, set, allAnswers, uid }: InputProps) {
  switch (q.type) {
    case "single":
      return <SingleInput q={q} a={a} set={set} uid={uid} />;
    case "multi":
      return <MultiInput q={q} a={a} set={set} uid={uid} />;
    case "text":
      return (
        <input
          type="text"
          className={inputBase}
          maxLength={LIMITS.shortText}
          placeholder={q.placeholder}
          value={(a.value as string) ?? ""}
          onChange={(e) => set({ value: e.target.value })}
        />
      );
    case "longtext":
      return (
        <LongText
          value={(a.value as string) ?? ""}
          placeholder={q.placeholder ?? "Apna jawab likhein…"}
          onChange={(v) => set({ value: v })}
        />
      );
    case "number":
      return (
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className={`${inputBase} max-w-36`}
            value={(a.value as string) ?? ""}
            onChange={(e) => set({ value: e.target.value })}
            aria-label={q.prompt}
          />
          {q.unit && <span className="text-sm text-ink-soft">{q.unit}</span>}
        </div>
      );
    case "repeater":
      return <RepeaterInput q={q} a={a} set={set} allAnswers={allAnswers} />;
    case "fields":
      return <FieldsInput q={q} a={a} set={set} uid={uid} />;
  }
}

function Choice({
  type,
  name,
  checked,
  label,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-[15px] transition ${
        checked
          ? "border-accent bg-accent-soft text-ink"
          : "border-line bg-white text-ink hover:border-ink-faint"
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

function OtherText({ a, set }: { a: Answer; set: InputProps["set"] }) {
  return (
    <input
      type="text"
      autoFocus
      className={`${inputBase} mt-3`}
      placeholder="Wazahat karein…"
      maxLength={LIMITS.shortText}
      value={a.other ?? ""}
      onChange={(e) => set({ other: e.target.value })}
      aria-label="Deegar ki wazahat"
    />
  );
}

function SingleInput({ q, a, set, uid }: Omit<InputProps, "allAnswers"> & { q: Extract<Question, { type: "single" }> }) {
  const value = (a.value as string) ?? "";
  const showExplainWhen = q.explainWhen && value === q.explainWhen.value;

  return (
    <div>
      {q.dropdown ? (
        <select
          className={`${inputBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%235b6472%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%235b6472%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10 sm:max-w-sm`}
          value={value}
          onChange={(e) => set({ value: e.target.value })}
          aria-label={q.prompt}
        >
          <option value="">Muntakhib karein…</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => (
            <Choice
              key={o.value}
              type="radio"
              name={`${uid}-${q.id}`}
              checked={value === o.value}
              label={o.label}
              onChange={() => set({ value: o.value })}
            />
          ))}
        </div>
      )}
      {value === OTHER && <OtherText a={a} set={set} />}
      {showExplainWhen && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">{q.explainWhen!.label}</label>
          <LongText rows={3} value={a.explain ?? ""} onChange={(v) => set({ explain: v })} />
        </div>
      )}
      {q.explain && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">{q.explain.label}</label>
          <LongText rows={2} value={a.explain ?? ""} onChange={(v) => set({ explain: v })} />
        </div>
      )}
    </div>
  );
}

function MultiInput({ q, a, set, uid }: Omit<InputProps, "allAnswers"> & { q: Extract<Question, { type: "multi" }> }) {
  const values = (a.value as string[]) ?? [];
  const toggle = (v: string) =>
    set({ value: values.includes(v) ? values.filter((x) => x !== v) : [...values, v] });
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => (
          <Choice
            key={o.value}
            type="checkbox"
            name={`${uid}-${q.id}`}
            checked={values.includes(o.value)}
            label={o.label}
            onChange={() => toggle(o.value)}
          />
        ))}
      </div>
      {values.includes(OTHER) && <OtherText a={a} set={set} />}
    </div>
  );
}

function LongText({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const near = value.length > LIMITS.longText * 0.9;
  return (
    <div>
      <textarea
        className={`${inputBase} min-h-24 resize-y leading-relaxed`}
        rows={rows}
        maxLength={LIMITS.longText}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {near && (
        <p className="mt-1 text-right text-xs text-ink-faint">
          {value.length} / {LIMITS.longText}
        </p>
      )}
    </div>
  );
}

function SubInput({
  f,
  value,
  onChange,
  id,
}: {
  f: SubField;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  if (f.input === "longtext") {
    return <LongText rows={3} value={value} onChange={onChange} placeholder={f.placeholder} />;
  }
  return (
    <input
      id={id}
      type={f.input === "number" ? "number" : "text"}
      inputMode={f.input === "number" ? "numeric" : undefined}
      min={f.input === "number" ? 0 : undefined}
      className={inputBase}
      maxLength={LIMITS.shortText}
      placeholder={f.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function FieldsInput({ q, a, set, uid }: Omit<InputProps, "allAnswers"> & { q: Extract<Question, { type: "fields" }> }) {
  const rec = (a.value as Record<string, string>) ?? {};
  return (
    <div className="grid gap-4">
      {q.fields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`${uid}-${f.key}`} className="mb-1.5 block text-sm font-medium text-ink-soft">
            {f.label}
          </label>
          <SubInput
            id={`${uid}-${f.key}`}
            f={f}
            value={rec[f.key] ?? ""}
            onChange={(v) => set({ value: { ...rec, [f.key]: v } })}
          />
        </div>
      ))}
    </div>
  );
}

function RepeaterInput({
  q,
  a,
  set,
  allAnswers,
}: Omit<InputProps, "uid"> & { q: Extract<Question, { type: "repeater" }> }) {
  const rows = (a.value as RepeaterRow[]) ?? [];
  const blank = (): RepeaterRow => Object.fromEntries(q.fields.map((f) => [f.key, ""]));
  const shown = rows.length ? rows : [blank()];

  const update = (i: number, key: string, v: string) => {
    const next = shown.map((r, idx) => (idx === i ? { ...r, [key]: v } : r));
    set({ value: next });
  };
  const remove = (i: number) => set({ value: shown.filter((_, idx) => idx !== i) });
  const add = () => set({ value: [...shown, blank()] });

  // Offer to pre-fill department names from an earlier multi-select.
  const seedQ = q.seedFrom ? allAnswers[q.seedFrom] : undefined;
  const seedValues = Array.isArray(seedQ?.value) && !seedQ?.special ? (seedQ.value as string[]) : [];
  const firstKey = q.fields[0].key;
  const existing = new Set(shown.map((r) => r[firstKey]?.trim().toLowerCase()));
  const seedLabels = seedValues
    .map((v) =>
      v === OTHER ? seedQ?.other?.trim() || "" : optionLabel(QUESTION_BY_ID[q.seedFrom!], v),
    )
    .filter((l) => l && !existing.has(l.toLowerCase()));

  const fillFromSeed = () => {
    const kept = shown.filter((r) => Object.values(r).some((x) => x.trim()));
    set({
      value: [...kept, ...seedLabels.map((l) => ({ ...blank(), [firstKey]: l }))],
    });
  };

  return (
    <div className="grid gap-3">
      {seedLabels.length > 0 && (
        <button
          type="button"
          onClick={fillFromSeed}
          className="justify-self-start rounded-lg border border-dashed border-accent/50 bg-accent-soft px-3 py-2 text-sm font-medium text-accent-ink transition hover:border-accent"
        >
          ↳ Q{q.seedFrom!.slice(1)} mein muntakhib kiye gaye {seedLabels.length} shobe yahan add karein
        </button>
      )}
      {shown.map((row, i) => (
        <div
          key={i}
          className="grid items-end gap-3 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          {q.fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-medium text-ink-soft">{f.label}</span>
              <SubInput f={f} id={`${q.id}-${i}-${f.key}`} value={row[f.key] ?? ""} onChange={(v) => update(i, f.key, v)} />
            </label>
          ))}
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={shown.length === 1 && !Object.values(row).some((x) => x.trim())}
            className="h-10 rounded-lg px-3 text-sm text-ink-soft transition hover:bg-white hover:text-danger disabled:invisible"
            aria-label={`Line ${i + 1} hatayein`}
          >
            Hatayein
          </button>
        </div>
      ))}
      {shown.length < LIMITS.repeaterRows && (
        <button
          type="button"
          onClick={add}
          className="justify-self-start rounded-lg px-1 py-1 text-sm font-medium text-accent hover:text-accent-ink"
        >
          + {q.addLabel}
        </button>
      )}
    </div>
  );
}
