import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { QUESTIONS, SECTIONS } from "@/lib/questionnaire";

const TOPICS = [
  "Organizational structure",
  "Decision-making",
  "Performance measurement",
  "Recruitment",
  "Employee management",
  "Operational challenges",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-10 sm:px-6 sm:pt-20">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent">
            Academic research questionnaire
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-[40px] leading-[1.08] tracking-tight text-ink sm:text-6xl">
            School Management Research
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            We are conducting academic research to understand how school management operates in practice. This
            questionnaire focuses on organizational structure, decision-making, performance measurement, recruitment,
            employee management, and operational challenges.
          </p>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
            Your responses will be used for academic research purposes. Please provide accurate information based on
            your actual experience and knowledge.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-7 py-4 text-[16px] font-medium text-white shadow-sm transition hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
            >
              Start Questionnaire
              <span aria-hidden>→</span>
            </Link>
            <span className="text-sm text-ink-soft">
              About 20–30 minutes · {QUESTIONS.length} questions in {SECTIONS.length} short sections
            </span>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3">
          <Card title="Who should respond">
            School management and relevant staff — principals, vice principals, coordinators, teachers and
            administrative staff. You don&apos;t need to know every answer.
          </Card>
          <Card title="Campuses">
            You&apos;ll choose your campus in the first question: <strong className="text-ink">Ring Road Campus</strong>,{" "}
            <strong className="text-ink">Kabootar Chowk Preschool</strong>, or both.
          </Card>
          <Card title="How it works">
            One section at a time. Answers are saved on your device as you go, and you can review everything before
            submitting. No account needed.
          </Card>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="font-serif text-2xl text-ink">What we&apos;ll ask about</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <li key={t} className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm text-ink-soft">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                If you don&apos;t know an answer, choose <strong className="text-ink">Maloom nahi (Don&apos;t know)</strong>.
                If you prefer not to answer, choose <strong className="text-ink">Declined</strong>. Please don&apos;t
                guess — an honest &ldquo;don&apos;t know&rdquo; is more useful than an invented answer.
              </p>
            </div>
            <div id="privacy" className="rounded-2xl border border-line bg-paper p-6">
              <h2 className="font-serif text-2xl text-ink">Privacy</h2>
              <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed text-ink-soft">
                <li>• The questionnaire does not ask for your name.</li>
                <li>
                  • Responses are stored securely and are visible only to the researcher conducting this study.
                </li>
                <li>• Answers are used only for academic purposes and are reported without identifying individuals.</li>
                <li>
                  • If you agree to a follow-up, any contact details you share are used only to ask a clarification
                  question.
                </li>
                <li>• Participation is voluntary, and you may skip any question that isn&apos;t marked as required.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
          <Link
            href="/questionnaire"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-[16px] font-medium text-white shadow-sm transition hover:bg-accent-ink"
          >
            Start Questionnaire <span aria-hidden>→</span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
