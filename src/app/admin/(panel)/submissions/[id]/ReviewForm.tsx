"use client";

import { useActionState } from "react";
import { STATUS_OPTIONS } from "@/lib/questionnaire";
import { updateReview, type ReviewState } from "@/app/admin/actions";

export function ReviewForm({ id, status, notes }: { id: string; status: string; notes: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(updateReview, {});

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-ink-soft">Status</legend>
        {STATUS_OPTIONS.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="radio" name="status" value={o.value} defaultChecked={status === o.value} className="accent-[var(--color-accent)]" />
            {o.label}
          </label>
        ))}
      </fieldset>
      <label className="grid gap-1.5">
        <span className="text-xs font-medium text-ink-soft">Notes</span>
        <textarea
          name="admin_notes"
          defaultValue={notes}
          rows={5}
          maxLength={5000}
          placeholder="Observations, cross-checks with interviews, follow-up questions…"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-70"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {state.ok && !pending && <span className="text-sm text-success">Saved</span>}
        {state.error && <span className="text-sm text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
