import { Link } from 'react-router-dom';
import { Action, Section } from '../components/primitives';
import { LineReveal, Magnetic, Parallax, Reveal } from '../components/motion';
import { IMG } from '../lib/images';

interface Prospect {
  deva: string;
  kicker: string;
  lines: string[];
  intro: string;
  points: { t: string; d: string }[];
}

const CONTENT: Record<'abroad' | 'online', Prospect> = {
  abroad: {
    deva: 'Study Abroad',
    kicker: 'Global universities',
    lines: ['Study', 'beyond', 'the border.'],
    intro:
      'Applications, entrance requirements and funding routes for universities outside India — assembled with the same detail we give a college in Patna.',
    points: [
      { t: 'Entrance requirements', d: 'Tests, transcripts and language thresholds, per country and per course level.' },
      { t: 'Real cost of study', d: 'Tuition, living, visa and travel — totalled honestly, in rupees.' },
      { t: 'Application timelines', d: 'Intake windows and deadlines mapped backwards from the term you want to start.' },
      { t: 'Funding and scholarships', d: 'Which awards a student from Bihar can realistically compete for.' },
    ],
  },
  online: {
    deva: 'Online Courses',
    kicker: 'Online courses',
    lines: ['Learn from', 'wherever', 'you are.'],
    intro:
      'Remote programmes and hybrid batches from recognised providers — recorded with the same scrutiny as a physical campus.',
    points: [
      { t: 'Recognition that holds', d: 'Whether the qualification is accepted by employers and universities.' },
      { t: 'How it is actually taught', d: 'Live batches, recorded lectures, doubt support and test series.' },
      { t: 'Total fee, no surprises', d: 'Full programme cost including material and examination charges.' },
      { t: 'Completion reality', d: 'How many students who enrol actually finish.' },
    ],
  },
};

export function ProspectPage({ kind }: { kind: 'abroad' | 'online' }) {
  const c = CONTENT[kind];
  const heroImg = kind === 'abroad' ? IMG.abroad : IMG.online;

  return (
    <>
      {/* Full-bleed dark hero — matches the homepage hero style */}
      <div className="relative overflow-hidden bg-night-900">
        <Parallax speed={0.14} className="absolute inset-0 -top-20 -bottom-20">
          <img
            src={heroImg}
            alt=""
            className="h-full w-full object-cover opacity-55 saturate-[0.75]"
          />
        </Parallax>
        <div className="absolute inset-0 scrim" />

        <Section className="relative pb-24 pt-28 md:pb-28 md:pt-32">
          <Reveal>
            <div className="inline-flex items-center gap-4 border border-gold-500/35 px-5 py-2.5">
              <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" />
              <span className="text-[10px] uppercase tracking-overline text-gold-300">{c.deva}</span>
            </div>
          </Reveal>

          <LineReveal
            as="h1"
            delay={120}
            className="mt-10 font-display text-d1 text-cream-100"
            lines={c.lines.map((l, i) =>
              i === c.lines.length - 1
                ? <span key={i} className="gilded italic">{l}</span>
                : <>{l}</>
            )}
          />

          <Reveal delay={400}>
            <p className="mt-10 max-w-xl text-[17px] leading-relaxed text-cream-100/70">{c.intro}</p>
          </Reveal>

          <Reveal delay={520}>
            <div className="mt-12 glass inline-flex items-center gap-4 px-6 py-4">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
              <p className="text-sm text-cream-100/80">
                {c.kicker} are being catalogued now — the first records publish shortly.
              </p>
            </div>
          </Reveal>
        </Section>
      </div>

      <Section className="py-20 md:py-28">
        <div className="border-t border-cream-300">
          {c.points.map((point, i) => (
            <Reveal key={point.t} delay={i * 80}>
              <div className="grid gap-4 border-b border-cream-300 py-9 md:grid-cols-[3.5rem_1fr_1.4fr] md:gap-8">
                <span className="folio">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-d4 text-night-800">{point.t}</h2>
                <p className="max-w-lg text-sm leading-relaxed text-ink-500">{point.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-8">
          <Magnetic>
            <Link to="/institutes">
              <Action>Explore what is live</Action>
            </Link>
          </Magnetic>
          <Link to="/career-guidance" className="link-underline text-sm text-ink-600 hover:text-ink">
            Find your path first
          </Link>
        </div>
      </Section>
    </>
  );
}
