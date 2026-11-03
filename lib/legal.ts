// The Terms of Service (/terms) and the Privacy Policy (/privacy): their text,
// written for how the platform really works (manual payments, what each role
// sees), and the few facts to fill in before launch.
// The file has no imports, so `pnpm test` can run it with Node directly.
// This text is a starting point, not legal advice: have it checked by a
// lawyer before the platform opens to the public.

// The date shown at the top of both pages, and the version people accept at
// sign-up: change it with the text, together with TERMS_VERSION in the
// server (server/src/config/legal.ts), which refuses any other version.
export const LEGAL_UPDATED = '2026-11-01';

// Accounts are for adults only (Tunisian law 2004-63, article 28, puts the
// data of a child under the consent of a parent and a family judge)
export const LEGAL_MIN_AGE = 18;

// The email for questions and data requests. Empty: people write to their
// academy, which forwards the message to the platform team.
export const LEGAL_CONTACT_EMAIL = '';

// Where the server and the database are hosted, as words that follow "are
// hosted" (for example "in Tunisia"). Empty: not chosen yet.
export const DATA_HOSTING = '';

// A paragraph, or a list of points. "[Academies](/centers)" in a text is a
// link to a page of the site.
export type LegalBlock = string | string[];
export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };
export type LegalDoc = { title: string; intro: string; summary: string[]; sections: LegalSection[] };
export type LegalFacts = { brand: string; contactEmail: string; hosting: string };

export type TextPart = { text: string; href?: string };

// "Last updated: 1 November 2026"
export function updatedLabel(iso: string): string {
  const when = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(when.getTime())) return '';
  const day = when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return `Last updated: ${day}`;
}

// Who to write to, with or without a platform email
export function contactText(email: string): string {
  const address = email.trim();
  if (address !== '') return `For a question or a request, write to ${address}.`;
  return 'For a question or a request, write to the academy you study with: its email address and phone number are on its page in [Academies](/centers), and it passes your message on to the platform team.';
}

// Where the data is kept, or that the place is not chosen yet
export function hostingText(place: string): string {
  const where = place.trim();
  if (where !== '') return `The server and the database of the platform are hosted ${where}.`;
  return 'The hosting place of the server and the database is not chosen yet: it will be named here before the platform opens to the public. If it is outside Tunisia, data will only be kept there with the authorization that Tunisian law requires.';
}

// "See [Academies](/centers)." -> the text, then the link, then the text.
// Only links to pages of the site ("/...") are made into links.
export function textParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) parts.push({ text: text.slice(last, at) });
    parts.push({ text: match[1], href: match[2] });
    last = at + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

// Every page a document links to (for the tests)
export function linkPaths(doc: LegalDoc): string[] {
  const texts = [doc.intro, ...doc.summary, ...doc.sections.flatMap((section) => section.blocks.flat())];
  return texts.flatMap((text) => textParts(text).flatMap((part) => (part.href ? [part.href] : [])));
}

export function termsDoc(facts: LegalFacts): LegalDoc {
  const b = facts.brand;
  return {
    title: 'Terms of Service',
    intro: `These terms explain how ${b} works and what you agree to when you create an account. Read them with the [Privacy Policy](/privacy), which explains what happens to your personal data.`,
    summary: [
      `${b} connects students with academies. Each academy runs its own courses, prices and live sessions.`,
      `You need to be ${LEGAL_MIN_AGE} or older to create an account.`,
      'Nothing is paid on the website: you pay the academy by cash or bank transfer, and your access opens once the academy confirms the payment.',
      'Courses and files are for your own learning: do not share your account or pass them on.',
    ],
    sections: [
      {
        id: 'service',
        title: `What ${b} is`,
        blocks: [
          `${b} is an online platform where academies (training schools) publish courses, digital products and live sessions, and where students buy them and learn. The team that runs ${b} (the platform team) runs the website and the accounts. Each academy is responsible for what it publishes and sells.`,
        ],
      },
      {
        id: 'account',
        title: 'Your account',
        blocks: [
          [
            `You must be ${LEGAL_MIN_AGE} or older to create an account.`,
            'Give your real name and an email address you use: the academy uses them to recognize your orders and to contact you.',
            'Keep your password secret. An account is for one person: do not share it.',
            'If you forget your password, ask on the [Forgot password](/auth/forgot-password) page. The platform team checks that the request comes from you, then sends you a link that works once, for 24 hours.',
          ],
        ],
      },
      {
        id: 'orders',
        title: 'Orders and payment',
        blocks: [
          [
            'Prices are in Tunisian dinars (TND) and are shown on each course and product page, with the discount of a coupon when you use one.',
            'When you place an order, you get an order reference and the contact details of the academy. Nothing is paid on the website: you pay the academy directly, by cash or bank transfer, and give the reference.',
            'Your access to the course, or the download of the product, opens once the academy confirms that it received your payment. Your orders are in Purchases, in your space.',
            'A question about a payment or a refund goes to the academy you paid: the platform team does not receive or hold the money.',
          ],
        ],
      },
      {
        id: 'use',
        title: 'Using the courses',
        blocks: [
          [
            'Videos, lessons, quizzes, files and live sessions are for your own learning.',
            'Do not copy, record, resell or publish them, and do not share your access or your download links.',
            'Some videos are played from YouTube or Vimeo, and live sessions take place on services such as Zoom or Google Meet: those services have their own terms.',
          ],
        ],
      },
      {
        id: 'posts',
        title: 'What you write',
        blocks: [
          'Questions under a lesson, and their replies, are shown with your first and last name to the other students of the course and to its academy. Write them with respect: no insults, no personal data of other people, nothing illegal, no advertising.',
          'You keep the rights to what you write. You allow the academy and the platform team to show it on the course, and to remove it if it breaks these terms.',
        ],
      },
      {
        id: 'academies',
        title: 'What the academies do',
        blocks: [
          'Each academy is responsible for its courses, prices, coupons and live sessions, for having the rights to what it publishes, and for giving access to the students who paid it.',
        ],
      },
      {
        id: 'platform',
        title: 'What the platform team does',
        blocks: [
          'The platform team keeps the website running and protects the accounts, but cannot promise that the website is never interrupted or free of errors. Features can change.',
          'It can suspend or close an account that breaks these terms, for example one that shares paid courses.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        blocks: [
          'When these terms change, the date at the top of this page changes. A change that matters for you, for example in how payments work, is announced on the website before it applies.',
        ],
      },
      {
        id: 'contact',
        title: 'Law and contact',
        blocks: ['These terms follow Tunisian law.', contactText(facts.contactEmail)],
      },
    ],
  };
}

export function privacyDoc(facts: LegalFacts): LegalDoc {
  const b = facts.brand;
  return {
    title: 'Privacy Policy',
    intro: `This page explains which personal data ${b} keeps, why, who can see it, and your rights under Tunisian law (Organic Law No. 2004-63 of 27 July 2004 on the protection of personal data). It goes with the [Terms of Service](/terms).`,
    summary: [
      'We keep what your account, your orders and your learning need, and nothing for advertising.',
      'Your academy sees the details of its students; the platform team sees all accounts to run the website.',
      'There is no tracking or advertising cookie. Your sign-in stops working after one day.',
      'You can ask to see, correct or delete your data at any time.',
    ],
    sections: [
      {
        id: 'who',
        title: 'Who is responsible',
        blocks: [
          `${b} is run by the platform team, which is responsible for the personal data of the website ("we" in this policy). Each academy also uses the data of its own students, to teach them and to handle their payments.`,
          contactText(facts.contactEmail),
        ],
      },
      {
        id: 'data',
        title: 'What we keep',
        blocks: [
          [
            'Your account: first name, last name, email address, the phone number you add in Settings (optional), your role, and your password, kept only as a one-way hash that nobody can read back.',
            'Your orders: what you bought, the price, the coupon used, the order reference, the dates and whether it is paid.',
            'Your learning: the lessons you completed, your quiz scores (the number of right answers), the questions and replies you write, and the live sessions you book, with their meeting link.',
            'A forgotten password: when you asked, and the dates of the link. The link itself is kept only as a one-way hash.',
            'No bank card details: nothing is paid on the website.',
          ],
        ],
      },
      {
        id: 'why',
        title: 'Why we keep it',
        blocks: [
          [
            'To create your account and let you sign in.',
            'To record your orders, so that the academy can confirm your payment and open your access.',
            'To show your progress, quiz results and live sessions, and to let the academy follow its students and answer their questions.',
            'To check a password reset request and send you the link.',
            'To keep the website safe, for example by limiting repeated sign-in attempts.',
          ],
          'Your data is not sold, and it is not used for advertising.',
        ],
      },
      {
        id: 'access',
        title: 'Who can see it',
        blocks: [
          [
            'The academy whose course or product you buy: your name, email address, phone number, orders, progress, quiz scores, questions and live sessions with it.',
            'The other students of a course: your first and last name next to the questions and replies you write under its lessons.',
            'The platform team: all accounts and orders, to run the website, answer password resets and help the academies.',
            'Nobody else, unless the law requires it (for example a decision of a court).',
          ],
        ],
      },
      {
        id: 'browser',
        title: 'Cookies and your browser',
        blocks: [
          'The website sets no tracking or advertising cookie. When you sign in, your browser keeps a sign-in key and your name in its local storage; the key stops working after one day, and signing out removes both.',
          'The server uses your IP address for a short time to limit repeated attempts, for example on the sign-in page. It is not saved with your account.',
          'Lesson videos from YouTube (in its privacy-enhanced mode) or Vimeo, and live sessions on services such as Zoom or Google Meet, are run by those services: when you use them, they receive your IP address and may set their own cookies, under their own privacy policies.',
        ],
      },
      {
        id: 'storage',
        title: 'Where, how long and how safely',
        blocks: [
          hostingText(facts.hosting),
          'Your data is kept while your account exists. When your account is deleted, your data is deleted too, except the order records that the academies must keep longer for their accounting, as the law requires.',
          'Passwords and password reset links are stored only as one-way hashes, a sign-in stops working after one day, and repeated sign-in attempts are limited.',
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        blocks: [
          'Under Tunisian law, you can:',
          [
            'see the data we keep about you and get a copy of it;',
            'correct, complete or update it (you can change your name and phone number yourself, in Settings);',
            'have wrong data deleted, or ask for your whole account to be deleted;',
            'object to the use of your data for a legitimate reason, and withdraw your consent at any time (your account is then closed, as it cannot work without this data).',
          ],
          `${contactText(facts.contactEmail)} We answer within one month.`,
          'You can also complain to the INPDP (Instance Nationale de Protection des Donn\u00e9es Personnelles), the Tunisian authority for personal data.',
        ],
      },
      {
        id: 'age',
        title: 'Age',
        blocks: [
          `Accounts are for people aged ${LEGAL_MIN_AGE} or older. If you learn that a person under ${LEGAL_MIN_AGE} created an account, tell us: we close it and delete its data.`,
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
          'When this policy changes, the date at the top of this page changes. An important change is announced on the website before it applies.',
        ],
      },
    ],
  };
}
