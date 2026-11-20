import Link from "next/link";
import type { ReactNode } from "react";

export function Wordmark() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-ink font-serif text-[15px] font-semibold text-paper"
      >
        R
      </span>
      <span className="leading-tight">
        <span className="block text-[14px] font-semibold text-ink">School Management Research</span>
        <span className="block text-[11px] text-ink-faint">Academic study · Peshawar</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Wordmark />
        {right}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-ink-faint sm:px-6">
        This is an independent university research project. It is not an official website of any school or school
        network, and it is not affiliated with or endorsed by the campuses mentioned.
      </div>
    </footer>
  );
}
