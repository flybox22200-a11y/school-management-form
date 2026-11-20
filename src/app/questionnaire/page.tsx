import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";

export const metadata: Metadata = { title: "Questionnaire" };

export default function QuestionnairePage() {
  return (
    <>
      <SiteHeader
        right={
          <Link href="/#privacy" className="text-sm text-ink-soft hover:text-ink">
            Privacy
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
        <QuestionnaireForm />
      </main>
      <SiteFooter />
    </>
  );
}
