import type { Metadata } from "next";
import { Suspense } from "react";
import { Wordmark } from "@/components/SiteChrome";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Researcher sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <h1 className="font-serif text-2xl text-ink">Researcher sign in</h1>
          <p className="mt-1 mb-6 text-sm text-ink-soft">Private area for reviewing questionnaire responses.</p>
          <Suspense fallback={<LoginForm />}>
            <LoginWithNotice searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function LoginWithNotice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { error } = await searchParams;
  const notice =
    error === "not_admin"
      ? "This account is not authorized to view responses. Ask the project owner to add it to the admins list."
      : error === "not_configured"
        ? "Supabase is not configured on the server. Set SUPABASE_URL and SUPABASE_ANON_KEY."
        : undefined;
  return <LoginForm notice={notice} />;
}
