"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/auth";
import { STATUS_OPTIONS } from "@/lib/questionnaire";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!email || !password) return { error: "Enter your email and password.", email };
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured on the server yet.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Incorrect email or password.", email };

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type ReviewState = { ok?: boolean; error?: string };

export async function updateReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").slice(0, 5000);

  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid submission." };
  if (!STATUS_OPTIONS.some((o) => o.value === status)) return { error: "Invalid status." };

  const { error } = await supabase
    .from("submissions")
    .update({ status, admin_notes: notes.trim() || null })
    .eq("id", id);

  if (error) return { error: "Could not save. Please try again." };
  refresh();
  return { ok: true };
}
