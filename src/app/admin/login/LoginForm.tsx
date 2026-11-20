"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const field =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base sm:text-[15px] text-ink shadow-xs focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="grid gap-4">
      {(state.error || notice) && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {state.error ?? notice}
        </p>
      )}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Email</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={state.email} className={field} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-ink px-5 py-3 text-[15px] font-medium text-white transition hover:bg-ink/90 disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
