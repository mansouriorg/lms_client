import { Fragment } from 'react';
import Link from 'next/link';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { type LegalDoc, textParts } from '@/lib/legal';

const LINK = 'font-medium text-indigo-400 underline underline-offset-2 hover:text-indigo-300';
const FOOTER_LINK = 'text-slate-400 hover:text-white transition-colors';

// A text of lib/legal.ts, with its "[label](/path)" links
function Rich({ text }: { text: string }) {
  return (
    <>
      {textParts(text).map((part, index) =>
        part.href ? (
          <Link key={index} href={part.href} className={LINK}>
            {part.text}
          </Link>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

// The frame of the Terms of Service and the Privacy Policy: the title and its
// date, "In short", the list of sections, the sections, then links to both
// pages (the open one is marked as current).
export default function LegalPage({
  doc,
  updated,
  current,
}: {
  doc: LegalDoc;
  updated: string;
  current: 'terms' | 'privacy';
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{doc.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{updated}</p>
        <p className="mt-6 text-slate-300 leading-relaxed">
          <Rich text={doc.intro} />
        </p>

        <section aria-labelledby="in-short" className="mt-8 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
          <h2 id="in-short" className="text-base font-semibold text-white">
            In short
          </h2>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-300 leading-relaxed">
            {doc.summary.map((point) => (
              <li key={point}>
                <Rich text={point} />
              </li>
            ))}
          </ul>
        </section>

        <nav aria-labelledby="on-this-page" className="mt-8">
          <h2 id="on-this-page" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            On this page
          </h2>
          <ol className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 list-decimal pl-5 text-sm text-slate-500">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-indigo-400 hover:text-indigo-300">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24">
              <h2 id={`${section.id}-title`} className="text-xl font-bold text-white">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-slate-300 leading-relaxed">
                {section.blocks.map((block, blockIndex) =>
                  typeof block === 'string' ? (
                    <p key={blockIndex}>
                      <Rich text={block} />
                    </p>
                  ) : (
                    <ul key={blockIndex} className="list-disc pl-5 space-y-2">
                      {block.map((item) => (
                        <li key={item}>
                          <Rich text={item} />
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <nav
          aria-label="Legal pages"
          className="mt-14 pt-6 border-t border-slate-800 flex flex-wrap gap-x-6 gap-y-2 text-sm"
        >
          <Link href="/terms" aria-current={current === 'terms' ? 'page' : undefined} className={FOOTER_LINK}>
            Terms of Service
          </Link>
          <Link href="/privacy" aria-current={current === 'privacy' ? 'page' : undefined} className={FOOTER_LINK}>
            Privacy Policy
          </Link>
          <Link href="/centers" className={FOOTER_LINK}>
            Academies
          </Link>
          <Link href="/auth/register" className={FOOTER_LINK}>
            Create an account
          </Link>
        </nav>
      </main>
    </div>
  );
}
