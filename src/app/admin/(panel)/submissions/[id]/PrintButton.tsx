"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-ink-faint hover:text-ink print:hidden"
    >
      Print / PDF
    </button>
  );
}
