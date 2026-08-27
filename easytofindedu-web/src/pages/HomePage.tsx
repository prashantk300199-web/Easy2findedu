import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBlogs, fetchColleges, fetchHostels, fetchInstitutes } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import {
  bedsAvailable,
  hostelPlace,
  hostelTypeLabel,
  imageUrl,
  inr,
  placeLine,
  rentFrom,
} from '../lib/format';
import { IMG } from '../lib/images';
import { Action, Overline, Section, SectionMark, Spinner, Tag } from '../components/primitives';
import { Counter, LineReveal, Magnetic, Marquee, Parallax, Reveal, Tilt } from '../components/motion';
import { Figure } from '../components/Figure';
import type { Institute } from '../lib/types';
import { HeroBanner } from '../components/HeroBanner';
import { ReferralWallet } from '../components/ReferralWallet';
import { useAuth } from '../contexts/AuthContext';

/* ══════════════════════ HERO ══════════════════════ */

function Hero({ counts }: { counts: number[] }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/institutes?q=${encodeURIComponent(query.trim())}` : '/institutes');
  };

  const stats = [
    { n: counts[0], label: 'Institutes' },
    { n: counts[1], label: 'Hostels' },
    { n: counts[2], label: 'Colleges' },
    { n: 29, label: 'Cities' },
  ];

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-night-900">
      {/* Full-bleed Unsplash photograph — Parallax creates cinematic depth */}
      <Parallax speed={0.16} className="absolute inset-0 -top-24 -bottom-24">
        <img src={IMG.hero} alt="" className="h-full w-full object-cover opacity-65" />
      </Parallax>
      <div className="absolute inset-0 scrim" />

      <Section className="relative flex min-h-[100svh] flex-col justify-center pb-28 pt-40">
        <Reveal>
          <div className="inline-flex items-center gap-4 border border-gold-500/35 px-5 py-2.5">
            <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" />
            <span className="text-[10px] uppercase tracking-overline text-gold-300">
              India's Trusted Student Platform
            </span>
          </div>
        </Reveal>

        <LineReveal
          as="h1"
          delay={140}
          className="mt-10 max-w-5xl font-display text-d1 text-cream-100"
          lines={[
            <>Your complete</>,
            <>student journey</>,
            <>
              starts <span className="gilded italic">here.</span>
            </>,
          ]}
        />

        <Reveal delay={520}>
          <p className="mt-10 max-w-xl text-[17px] leading-relaxed text-cream-100/70">
            Institutes, colleges and hostels across India — verified, compared and documented in
            full, so every decision you make is an informed one.
          </p>
        </Reveal>

        {/* Search */}
        <Reveal delay={640}>
          <form onSubmit={submit} className="mt-12 max-w-2xl">
            <div className="glass flex items-center gap-4 p-2.5">
              <span className="pl-4 text-gold-400">◎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search institutes, colleges or areas…"
                aria-label="Search"
                className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-cream-100 placeholder:text-cream-100/45 focus:outline-none"
              />
              <button type="submit" className="shrink-0">
                <Action className="px-7 py-4">Search</Action>
              </button>
            </div>
          </form>
        </Reveal>

        {/* Live counts */}
        <Reveal delay={760}>
          <dl className="mt-20 grid max-w-3xl grid-cols-2 gap-y-10 border-t border-gold-500/20 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-[clamp(2.2rem,3.6vw,3.2rem)] leading-none text-gold-400">
                  <Counter to={s.n} suffix="+" />
                </dd>
                <dt className="mt-3 text-[10px] uppercase tracking-overline text-cream-100/50">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 hidden h-14 w-px -translate-x-1/2 overflow-hidden bg-gold-500/20 md:block">
        <span className="block h-full w-full animate-scrollHint bg-gold-500" />
      </div>
    </div>
  );
}

/* ══════════════════ PATHWAYS ══════════════════ */

const PATHWAYS = [
  { to: '/hostels',        label: 'Hostel Finder',        note: '75+ verified student residences',      span: 'lg:col-span-2 lg:row-span-2', img: IMG.hostelHero },
  { to: '/colleges',       label: 'Indian Colleges',      note: 'Degrees, placements and fees',         span: '',                            img: IMG.colleges },
  { to: '/abroad',         label: 'Global Universities',  note: 'Study beyond the border',              span: '',                            img: IMG.abroad },
  { to: '/career-guidance',label: 'Career Guidance',      note: 'From confusion to clarity',            span: 'lg:col-span-2',               img: IMG.career },
  { to: '/institutes',     label: 'Institute Discovery',  note: 'Coaching, documented in full',         span: '',                            img: IMG.institutes },
  { to: '/online-courses', label: 'Online Courses',       note: 'Learn from anywhere',                  span: '',                            img: IMG.online },
];

function Pathways() {
  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="01" label="India · Abroad · Online" />

      <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
        <LineReveal
          className="max-w-2xl font-display text-d2 text-night-800"
          lines={[<>Everywhere a student</>, <>might study — <span className="italic text-gold-600">mapped.</span></>]}
        />
        <p className="max-w-sm pb-2 text-sm leading-relaxed text-ink-500">
          Six routes into the same catalogue. Whichever one you take, the records are verified before
          they reach you.
        </p>
      </div>

      {/* Bento grid — the lead tile carries the weight. */}
      <div className="mt-16 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PATHWAYS.map((p, i) => (
          <Reveal key={p.label} delay={(i % 4) * 80} className={p.span}>
            <Link to={p.to} className="group relative block h-full overflow-hidden bg-night-800">
              <img
                src={p.img}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-50 saturate-[0.65] transition-all duration-1200 ease-editorial group-hover:scale-[1.07] group-hover:opacity-70 group-hover:saturate-100"
              />
              <div className="absolute inset-0 scrim-soft" />

              <div className="relative flex h-full flex-col justify-end p-7">
                <span className="folio">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-display text-[26px] text-cream-100">{p.label}</h3>
                <p className="mt-2 text-sm text-cream-100/60">{p.note}</p>

                <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-gold-400 transition-transform duration-700 ease-editorial group-hover:translate-x-1.5">
                  Explore <span>→</span>
                </span>
              </div>

              {/* Gold frame draws in on hover */}
              <span className="pointer-events-none absolute inset-0 border border-gold-500/0 transition-colors duration-700 group-hover:border-gold-500/50" />
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ══════════════════ HOSTELS ══════════════════ */

function FeaturedHostels() {
  const { data, loading } = useAsync((signal) => fetchHostels(12, signal), []);
  const hostels = data?.items.slice(0, 6) ?? [];

  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="02" label="Accommodation" />

      <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
        <LineReveal
          className="max-w-2xl font-display text-d2 text-night-800"
          lines={[<>Featured</>, <><span className="italic text-gold-600">hostels.</span></>]}
        />
        <Link to="/hostels" className="link-underline pb-3 text-[11px] uppercase tracking-wide2 text-ink-700">
          View all →
        </Link>
      </div>

      {loading && <Spinner label="Loading hostels" />}

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hostels.map((h, i) => {
          const rent = rentFrom(h);
          const free = bedsAvailable(h);
          return (
            <Reveal key={h._id} delay={(i % 3) * 100}>
              <Tilt>
                <Link to={`/hostels/${h.slug}`} className="group block bg-cream-50 border-t-2 border-transparent shadow-lift transition-all duration-500 hover:border-gold-500 hover:shadow-goldGlow hover:shadow-liftLg">
                  <div className="relative">
                    <Figure src={imageUrl(h.photos?.[0])} alt={h.name} name={h.name} ratio="aspect-[4/3]" />
                    <span className="absolute left-0 top-5 bg-night-900/85 px-4 py-2 text-[10px] uppercase tracking-wide2 text-gold-400 backdrop-blur-sm">
                      {hostelTypeLabel(h.hostel_type)}
                    </span>
                    {free > 0 && (
                      <span className="absolute right-4 top-5 bg-gold-500 px-3 py-1.5 text-[10px] uppercase tracking-wide2 text-night-800">
                        {free} beds free
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-[22px] leading-tight text-night-800 transition-colors duration-500 group-hover:text-gold-700">
                      {h.name}
                    </h3>
                    <p className="mt-2 text-sm text-ink-500">{hostelPlace(h)}</p>

                    <div className="mt-5 flex items-baseline justify-between border-t border-cream-300 pt-5">
                      {rent ? (
                        <p className="text-sm text-ink-700">
                          <span className="font-display text-xl text-night-800">{inr.format(rent)}</span>
                          <span className="text-ink-400"> / month</span>
                        </p>
                      ) : (
                        <span className="text-sm text-ink-400">Rent on request</span>
                      )}
                      <span className="text-[10px] uppercase tracking-wide2 text-gold-700 transition-transform duration-700 group-hover:translate-x-1">
                        Details →
                      </span>
                    </div>
                  </div>
                </Link>
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ══════════════════ INSTITUTES ══════════════════ */

function FeaturedInstitutes({ items, loading }: { items: Institute[]; loading: boolean }) {
  const shown = items.slice(0, 6);

  return (
    <div className="relative bg-night-900 py-28 md:py-36">
      <Section>
        <SectionMark folio="03" label="Top Institutes" light />

        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <LineReveal
            className="max-w-2xl font-display text-d2 text-cream-100"
            lines={[<>Places that take</>, <><span className="gilded italic">teaching</span> seriously.</>]}
          />
          <Link to="/institutes" className="link-underline pb-3 text-[11px] uppercase tracking-wide2 text-gold-400">
            View all →
          </Link>
        </div>

        {loading && <Spinner label="Loading institutes" light />}

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((inst, i) => (
            <Reveal key={inst._id} delay={(i % 3) * 100}>
              <Link
                to={`/institutes/${inst._id}`}
                className="group block border border-gold-500/20 bg-night-800/50 transition-all duration-700 hover:border-gold-500/60 hover:bg-night-700/60 hover:shadow-goldGlow"
              >
                <Figure
                  src={imageUrl(inst.galleryImages?.[0]) ?? imageUrl(inst.logo)}
                  alt={inst.name}
                  name={inst.name}
                  ratio="aspect-[16/11]"
                />
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[21px] leading-tight text-cream-100 transition-colors duration-500 group-hover:text-gold-400">
                      {inst.name.trim()}
                    </h3>
                    <span className="folio shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-2 text-sm text-cream-100/50">{placeLine(inst)}</p>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-gold-500/15 pt-5 text-[11px] uppercase tracking-wide2 text-cream-100/40">
                    {inst.establishedYear && <span>Est. {inst.establishedYear}</span>}
                    {inst.avgFacultyExperience ? <span>{inst.avgFacultyExperience} yrs faculty</span> : null}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════ COLLEGES ══════════════════ */

function TopColleges() {
  const { data, loading } = useAsync((signal) => fetchColleges(signal), []);
  const colleges = data?.slice(0, 4) ?? [];

  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="04" label="Indian Colleges" />

      <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
        <LineReveal
          className="max-w-2xl font-display text-d2 text-night-800"
          lines={[<>Degrees that</>, <><span className="italic text-gold-600">carry</span> weight.</>]}
        />
        <Link to="/colleges" className="link-underline pb-3 text-[11px] uppercase tracking-wide2 text-ink-700">
          View all →
        </Link>
      </div>

      {loading && <Spinner label="Loading colleges" />}

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {colleges.map((c, i) => (
          <Reveal key={c._id} delay={(i % 4) * 90}>
            <Link to={`/colleges/${c._id}`} className="group flex h-full flex-col bg-cream-50 border-t-2 border-transparent shadow-lift transition-all duration-500 hover:border-gold-500 hover:shadow-goldGlow">
              <Figure src={imageUrl(c.logo)} alt={c.name} name={c.name} ratio="aspect-[16/10]" />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-[20px] leading-snug text-night-800 transition-colors duration-500 group-hover:text-gold-700">
                  {c.name}
                </h3>
                {c.collegeType && <p className="mt-2 text-xs text-ink-400">{c.collegeType}</p>}

                <div className="mt-auto flex items-end justify-between border-t border-cream-300 pt-5">
                  {c.placements?.placementPercentage ? (
                    <div>
                      <p className="font-display text-2xl text-gold-600">{c.placements.placementPercentage}%</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide2 text-ink-400">Placed</p>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-400">{c.establishedYear ? `Est. ${c.establishedYear}` : ''}</span>
                  )}
                  {c.coursesOffered?.length ? (
                    <span className="text-[10px] uppercase tracking-wide2 text-ink-400">
                      {c.coursesOffered.length} courses
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ══════════════════ CAREER BAND ══════════════════ */

function CareerBand() {
  return (
    <div className="relative overflow-hidden bg-night-800">
      <Parallax speed={0.1} className="absolute inset-0 -top-16 -bottom-16">
        <img src={IMG.careerBand} alt="" className="h-full w-full object-cover opacity-30 saturate-[0.5]" />
      </Parallax>
      <div className="absolute inset-0 bg-night-900/65" />

      <Section className="relative py-32 md:py-40">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Overline light>Career Guidance</Overline>
            <LineReveal
              className="mt-8 font-display text-d2 text-cream-100"
              lines={[
                <>From <span className="italic text-cream-100/45">“what should I do?”</span></>,
                <>to <span className="gilded italic">“where should I go?”</span></>,
              ]}
            />
            <Reveal delay={300}>
              <p className="mt-9 max-w-lg text-[16px] leading-relaxed text-cream-100/65">
                Take our questionnaire and get a personalised route — the stream, the entrance exam,
                the institute to sit it at, and the room you'll sleep in while you prepare.
              </p>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-11 flex flex-wrap items-center gap-8">
                <Magnetic>
                  <Link to="/career-guidance">
                    <Action>Start Your Journey</Action>
                  </Link>
                </Magnetic>
                <Link to="/journal" className="link-underline text-[11px] uppercase tracking-wide2 text-cream-100/70">
                  Read the guides
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="space-y-4">
            {[
              { k: '98%', v: 'Match accuracy against stated interests' },
              { k: '3 min', v: 'To a complete personalised pathway' },
              { k: 'Top 3', v: 'Recommendations, ranked and explained' },
            ].map((row, i) => (
              <Reveal key={row.k} delay={i * 130}>
                <div className="glass flex items-center gap-7 p-7">
                  <span className="font-display text-3xl text-gold-400">{row.k}</span>
                  <span className="text-sm leading-relaxed text-cream-100/70">{row.v}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════ TESTIMONIALS ══════════════════ */

/**
 * PLACEHOLDER CONTENT — there is no reviews endpoint on the API yet.
 * Replace with genuine student reviews before this goes live.
 */
const TESTIMONIALS = [
  { q: 'I compared six coaching institutes in an afternoon. The fee breakdowns alone saved my family a lot of guesswork.', n: 'Placeholder name', r: 'Class 12 · Patna' },
  { q: 'Finding a hostel near my institute was the part I dreaded. Seeing the distances listed made it straightforward.', n: 'Placeholder name', r: 'NEET aspirant' },
  { q: 'The transparency section is what sold me — refund policy and grievance process, written down in one place.', n: 'Placeholder name', r: 'Parent · Boring Road' },
];

function Testimonials() {
  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="05" label="What Students Say" />

      <LineReveal
        className="mt-12 max-w-3xl font-display text-d2 text-night-800"
        lines={[<>Real stories from</>, <>students who <span className="italic text-gold-600">found their place.</span></>]}
      />

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={i} delay={i * 120}>
            <figure className="flex h-full flex-col border-t-2 border-gold-500 bg-cream-50 p-9 shadow-lift">
              <span className="font-display text-5xl leading-none text-gold-400">“</span>
              <blockquote className="mt-4 flex-1 font-display text-[19px] italic leading-relaxed text-night-800">
                {t.q}
              </blockquote>
              <figcaption className="mt-8 border-t border-cream-300 pt-5">
                <p className="text-sm text-night-800">{t.n}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide2 text-ink-400">{t.r}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ══════════════════ TRUST ══════════════════ */

const TRUST = [
  { t: 'Verified Listings', d: 'Every institute and hostel is reviewed and approved before publication.' },
  { t: 'Genuine Reviews', d: 'Feedback from students who actually enrolled or stayed.' },
  { t: 'Complete Transparency', d: 'Fee clarity, refund policy and grievance process, written down.' },
  { t: 'Smart Search', d: 'Filter by area, rent, facilities and distance to your institute.' },
  { t: 'Personalised for You', d: 'Guidance matched to your stream, marks and constraints.' },
  { t: 'Complete Ecosystem', d: 'Study and stay are one decision, so they live in one catalogue.' },
];

function Trust() {
  return (
    <div className="bg-cream-200 py-28 md:py-36">
      <Section>
        <SectionMark folio="06" label="Why Students Trust Us" />

        <LineReveal
          className="mt-12 max-w-3xl font-display text-d2 text-night-800"
          lines={[<>Documented,</>, <>not <span className="italic text-gold-600">advertised.</span></>]}
        />

        <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((item, i) => (
            <Reveal key={item.t} delay={(i % 3) * 100}>
              <div className="group border-t border-gold-500/40 pt-7">
                <div className="flex items-baseline gap-5">
                  <span className="folio">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-d4 text-night-800">{item.t}</h3>
                </div>
                <p className="mt-4 pl-11 text-sm leading-relaxed text-ink-500">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ══════════════════ PROCESS ══════════════════ */

const STEPS = [
  { t: 'Career Clarity Starts Here', d: 'Answer a structured questionnaire on interests, strengths and constraints.' },
  { t: 'Explore Institutes, Colleges & Hostels', d: 'Browse verified records with fees, facilities and outcomes attached.' },
  { t: 'Make Data-Driven Decisions', d: 'Compare options on the same axes — no sponsored ordering.' },
  { t: 'Connect, Visit & Secure Admission', d: 'Enquire directly, schedule a visit and complete your admission.' },
];

function Process() {
  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="07" label="How It Works" />

      <LineReveal
        className="mt-12 max-w-3xl font-display text-d2 text-night-800"
        lines={[<>One platform for every</>, <>student <span className="italic text-gold-600">decision.</span></>]}
      />

      <div className="mt-16 grid gap-y-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
        {STEPS.map((s, i) => (
          <Reveal key={s.t} delay={i * 110}>
            <div className="relative pr-6">
              <span className="font-display text-[64px] leading-none text-gold-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 font-display text-[21px] leading-snug text-night-800">{s.t}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">{s.d}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute right-0 top-8 hidden h-px w-4 bg-gold-500/50 lg:block" />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ══════════════════ GUIDES ══════════════════ */

function Guides() {
  const { data } = useAsync((signal) => fetchBlogs(4, signal), []);
  if (!data || data.length === 0) return null;
  const [lead, ...rest] = data;

  return (
    <Section className="py-28 md:py-36">
      <SectionMark folio="08" label="Student Guides" />

      <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
        <LineReveal
          className="max-w-2xl font-display text-d2 text-night-800"
          lines={[<>Notes on</>, <><span className="italic text-gold-600">choosing well.</span></>]}
        />
        <Link to="/journal" className="link-underline pb-3 text-[11px] uppercase tracking-wide2 text-ink-700">
          All guides →
        </Link>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <Link to="/journal" className="group block">
            <Figure src={imageUrl(lead.coverImage)} alt={lead.title} name={lead.title} ratio="aspect-[16/9]" />
            <div className="mt-7">
              {lead.category && <Tag>{lead.category}</Tag>}
              <h3 className="mt-5 max-w-xl font-display text-d3 leading-tight text-night-800 transition-colors duration-500 group-hover:text-gold-700">
                {lead.title}
              </h3>
              {lead.excerpt && <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-500">{lead.excerpt}</p>}
            </div>
          </Link>
        </Reveal>

        <div>
          {rest.map((post, i) => (
            <Reveal key={post._id} delay={i * 110}>
              <Link to="/journal" className="group flex gap-6 border-b border-cream-300 py-7 first:pt-0">
                <span className="folio pt-1.5">{String(i + 2).padStart(2, '0')}</span>
                <div>
                  {post.category && (
                    <p className="text-[10px] uppercase tracking-wide2 text-gold-700">{post.category}</p>
                  )}
                  <h3 className="mt-3 font-display text-[19px] leading-snug text-night-800 transition-colors duration-500 group-hover:text-gold-700">
                    {post.title}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ══════════════════ PAGE ══════════════════ */

export function HomePage() {
  const { user } = useAuth();
  const institutes = useAsync((signal) => fetchInstitutes(100, signal), []);
  const colleges = useAsync((signal) => fetchColleges(signal), []);
  const hostels = useAsync((signal) => fetchHostels(1, signal), []);

  const items = institutes.data?.items ?? [];

  return (
    <>
      <Hero
        counts={[
          institutes.data?.pagination?.total ?? items.length,
          hostels.data?.total ?? 0,
          colleges.data?.length ?? 0,
        ]}
      />

      <HeroBanner />

      {/* Referral Wallet - visible only for logged-in students */}
      {user && user.role === 'student' && (
        <Section className="py-8">
          <ReferralWallet />
        </Section>
      )}

      <div className="border-b border-cream-300 bg-cream-100 py-8">
        <Marquee items={['Patna', 'Boring Road', 'Patliputra Colony', 'Kankarbagh', 'Rajendra Nagar', 'Ashiana']} />
      </div>

      <Pathways />
      <FeaturedHostels />
      <FeaturedInstitutes items={items} loading={institutes.loading} />
      <TopColleges />
      <CareerBand />
      <Testimonials />
      <Trust />
      <Process />
      <Guides />
    </>
  );
}
