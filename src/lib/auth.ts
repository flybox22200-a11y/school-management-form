import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type AdminUser = { id: string; email: string };

/**
 * Data-access-layer check used by every admin page, action and route.
 * Verifies the Supabase session server-side and that the user is on the
 * `admins` allow-list. Redirects to the login page otherwise.
 */
export async function requireAdmin(): Promise<{
  user: AdminUser;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  await cookies();
  if (!isSupabaseConfigured()) redirect("/admin/login?error=not_configured");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) redirect("/admin/login?error=not_admin");

  return {
    user: { id: data.user.id, email: data.user.email ?? "" },
    supabase,
  };
}
