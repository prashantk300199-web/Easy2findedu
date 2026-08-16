import { Link } from 'react-router-dom';
import { Action, Overline, Section, SectionMark } from '../components/primitives';
import { LineReveal, Magnetic, Reveal } from '../components/motion';

const STAGES = [
  {
    n: '01',
    t: 'Where you stand',
    d: 'Your stream, marks, constraints and the subjects you actually enjoy — recorded honestly, without aspiration inflation.',
  },
  {
    n: '02',
    t: 'What suits you',
    d: 'Interests and aptitudes weighed against real course requirements, not personality-quiz theatre.',
  },
  {
    n: '03',
    t: 'Where it leads',
    d: 'Each match traced forward to the degrees, entrance exams and roles it genuinely opens.',
  },
  {
    n: '04',
    t: 'How to get there',
    d: 'The institutes, colleges and hostels on that path — with fees, facilities and distances attached.',
  },
];

const QUESTIONS = [
  'Should I take PCM, PCB or PCMB after Class 10?',
  'Is a private college worth the fee difference?',
  'Which entrance exams actually matter for my stream?',
  'Can I afford to study away from home?',
  'What happens if I change my mind after a year?',
];

export function CareerGuidancePage() {
  return (
    <>
      <Section className="pb-24 pt-12 md:pb-32">
        <div className="flex items-center gap-5">
          <span className="h-px w-12 bg-gold-500" />
          <Overline>Career Guidance</Overline>
        </div>

        <LineReveal
          as="h1"
          className="mt-10 font-display text-d1 text-ink"
          lines={[
            <>From <span className="italic text-ink-400">“what</span></>,
            <><span className="italic text-ink-400">should I do?”</span></>,
            <>to <span className="italic text-gold-700">“where</span></>,
            <><span className="italic text-gold-700">should I go?”</span></>,
          ]}
        />

        <div className="mt-16 grid gap-14 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-lg text-[17px] leading-relaxed text-ink-600">
            Most guidance stops at naming a career. This one continues until you know the exam to
            sit, the institute to sit it at, and the room you will sleep in while you prepare.
          </p>

          <Magnetic>
            <Link to="/institutes">
              <Action>Start the questionnaire</Action>
            </Link>
          </Magnetic>
        </div>
      </Section>

      <Section className="py-24 md:py-28">
        <SectionMark folio="I" label="How it works" />

        <div className="mt-14 border-t border-cream-300">
          {STAGES.map((stage, i) => (
            <Reveal key={stage.n} delay={i * 80}>
              <div className="grid gap-4 border-b border-cream-300 py-9 md:grid-cols-[3.5rem_1fr_1.4fr] md:gap-8">
                <span className="folio">{stage.n}</span>
                <h2 className="font-display text-d4 text-ink">{stage.t}</h2>
                <p className="max-w-lg text-sm leading-relaxed text-ink-500">{stage.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="relative z-10 my-24 bg-night-900 py-28 text-cream-100">
        <Section>
          <Overline className="text-cream-100/50">Questions it answers</Overline>

          <div className="mt-12">
            {QUESTIONS.map((q, i) => (
              <Reveal key={q} delay={i * 70}>
                <p className="border-t border-gold-500/20 py-7 font-display text-[26px] italic leading-snug text-cream-100/85 md:text-[34px]">
                  “{q}”
                </p>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>

      <Section className="pb-16">
        <div className="border-t border-night-800 pt-10">
          <LineReveal
            className="max-w-3xl font-display text-d2 text-ink"
            lines={[<>The path is already</>, <><span className="italic text-gold-700">documented.</span></>]}
          />
          <div className="mt-12 flex flex-wrap gap-8">
            <Magnetic>
              <Link to="/institutes">
                <Action>Browse institutes</Action>
              </Link>
            </Magnetic>
            <Link to="/journal" className="link-underline self-center text-sm text-ink-600 hover:text-ink">
              Read the student guides
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
