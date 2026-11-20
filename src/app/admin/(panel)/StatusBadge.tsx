import { STATUS_OPTIONS } from "@/lib/questionnaire";

const STYLES: Record<string, string> = {
  new: "bg-accent-soft text-accent-ink border-accent/25",
  reviewed: "bg-paper text-ink-soft border-line",
  follow_up: "bg-gold-soft text-[#8a5d15] border-gold/30",
  excluded: "bg-danger/5 text-danger border-danger/25",
};

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STYLES[status] ?? STYLES.reviewed}`}>
      {label}
    </span>
  );
}
