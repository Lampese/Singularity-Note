import Link from "next/link";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { ThemeModeSwitch } from "@/components/ui/ThemeModeSwitch";
import { LegalFooterLinks } from "@/components/legal/LegalFooterLinks";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function LegalDocumentPage({
  title,
  updatedAt,
  summary,
  sections,
}: {
  title: string;
  updatedAt: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-bg px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="frosted-surface-prominent rounded-[28px] px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-text transition-colors hover:text-accent"
            >
              <BrandLogo className="h-7 w-auto" />
              <span className="text-sm font-medium">Singularity Note</span>
            </Link>
            <ThemeModeSwitch placement="inline" />
          </div>
          <div className="mt-8 space-y-3">
            <p className="type-caption uppercase tracking-[0.22em] text-text-muted">Legal</p>
            <h1 className="type-page-title text-text">{title}</h1>
            <p className="type-body-secondary max-w-[52rem] text-text-secondary">{summary}</p>
            <p className="text-sm text-text-muted">最后更新：{updatedAt}</p>
          </div>
        </header>

        <article className="frosted-surface-prominent rounded-[28px] px-6 py-6 sm:px-8">
          <div className="prose markdown-prose max-w-none text-text">
            {sections.map((section) => (
              <section key={section.title} className="mb-8 last:mb-0">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <footer className="flex flex-wrap items-center justify-between gap-4 px-2 pb-4 text-sm text-text-muted">
          <span>© {new Date().getFullYear()} Singularity Note</span>
          <LegalFooterLinks />
        </footer>
      </div>
    </main>
  );
}
