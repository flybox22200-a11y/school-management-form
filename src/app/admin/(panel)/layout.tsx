import Link from "next/link";
import { Suspense } from "react";
import { Wordmark } from "@/components/SiteChrome";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-line bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Wordmark />
            <nav className="hidden text-sm sm:block">
              <Link href="/admin" className="font-medium text-ink-soft hover:text-ink">
                Responses
              </Link>
            </nav>
          </div>
          <Suspense fallback={<span className="h-5 w-40 animate-pulse rounded bg-paper-2" />}>
            <Account />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </>
  );
}

async function Account() {
  const { user } = await requireAdmin();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden max-w-[16rem] truncate text-ink-soft md:inline">{user.email}</span>
      <form action={logout}>
        <button type="submit" className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink">
          Sign out
        </button>
      </form>
    </div>
  );
}
