import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Thank you" };

export default function ThankYouPage({ searchParams }: PageProps<"/thank-you">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-3xl border border-line bg-white p-8 text-center sm:p-12">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 font-serif text-3xl text-ink sm:text-4xl">Thank you for your response</h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Your answers have been submitted and saved. We appreciate the time you took to share your experience — it
            directly supports this research.
          </p>
          <Suspense fallback={<div className="mx-auto mt-8 h-[86px] max-w-xs rounded-2xl bg-paper" />}>
            <Reference searchParams={searchParams} />
          </Suspense>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-accent hover:text-accent-ink">
            ← Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

async function Reference({ searchParams }: { searchParams: PageProps<"/thank-you">["searchParams"] }) {
  const { ref } = await searchParams;
  const code = typeof ref === "string" && /^SMR-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(ref) ? ref : null;
  if (!code) return null;
  return (
    <div className="mx-auto mt-8 max-w-xs rounded-2xl border border-dashed border-line bg-paper px-5 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Reference code</p>
      <p className="mt-1 font-mono text-xl font-semibold tracking-wider text-ink">{code}</p>
      <p className="mt-1 text-xs text-ink-faint">Keep this if you want to refer to your response later.</p>
    </div>
  );
}
