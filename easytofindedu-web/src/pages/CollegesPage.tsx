import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchColleges } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { cx, getCollegeImage } from '../lib/format';
import { EmptyNote, ErrorNote, Section, Spinner, Tag } from '../components/primitives';
import { PageHero } from '../components/PageHero';
import { IMG } from '../lib/images';
import { Reveal } from '../components/motion';
import { Figure } from '../components/Figure';
import type { College } from '../lib/types';

function CollegeCard({ college, index }: { college: College; index: number }) {
  const placement = college.placements?.placementPercentage;

  return (
    <Link to={`/colleges/${college._id}`} className="group block">
      <article className="grid gap-6 border-t border-cream-300 pt-6 sm:grid-cols-[180px_1fr]">
        <Figure
          src={getCollegeImage(college)}
          alt={college.name}
          name={college.name}
          ratio="aspect-[4/3] sm:aspect-square"
        />

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-2xl leading-tight text-ink transition-colors duration-500 group-hover:text-gold-700">
              {college.name}
            </h3>
            <span className="shrink-0 font-sans text-xs tabular-nums text-ink-400">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {college.collegeType && <p className="mt-2 text-sm text-ink-500">{college.collegeType}</p>}

          {college.about && (
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-500">{college.about}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-400">
            {college.establishedYear && <span>Est. {college.establishedYear}</span>}
            {college.ownershipType && <span>{college.ownershipType}</span>}
            {placement ? <span>{placement}% placed</span> : null}
            {college.coursesOffered?.length ? <span>{college.coursesOffered.length} courses</span> : null}
          </div>

          {college.approvedBy?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {college.approvedBy.slice(0, 4).map((body) => (
                <Tag key={body}>{body}</Tag>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function CollegesPage() {
  const { data, loading, error } = useAsync((signal) => fetchColleges(signal), []);
  const [query, setQuery] = useState('');
  const [ownership, setOwnership] = useState('All');

  const all = data ?? [];

  const ownerships = useMemo(() => {
    const set = new Set<string>();
    all.forEach((c) => c.ownershipType && set.add(c.ownershipType));
    return ['All', ...[...set].sort()];
  }, [all]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      const matchesOwnership = ownership === 'All' || c.ownershipType === ownership;
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || (c.collegeType ?? '').toLowerCase().includes(q);
      return matchesOwnership && matchesQuery;
    });
  }, [all, query, ownership]);

  return (
    <>
      <PageHero
        eyebrow="Indian Colleges"
        titleLines={[<>Degrees that</>, <><span className="gilded italic">carry</span> weight.</>]}
        intro="Degree colleges and professional institutions — courses, approvals, placement records and admission routes."
        image={IMG.collegeHero}
        stats={[
          { value: all.length || '—', label: 'Colleges' },
          { value: all.reduce((n, c) => n + (c.coursesOffered?.length ?? 0), 0) || '—', label: 'Courses' },
          { value: 'Verified', label: 'Every listing' },
          { value: 'Free', label: 'To browse' },
        ]}
      />
      <Section className="py-16 md:py-20">
      <div className="mt-14 border-t border-night-800 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search colleges</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or discipline"
              className="w-full border-0 border-b border-cream-300 bg-transparent pb-3 pr-8 font-display text-xl text-ink placeholder:text-ink-400 focus:border-gold-700 focus:outline-none focus:ring-0"
            />
            <span aria-hidden className="pointer-events-none absolute bottom-3 right-0 text-ink-400">↳</span>
          </label>

          {ownerships.length > 2 && (
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {ownerships.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setOwnership(name)}
                  className={cx(
                    'text-sm transition-colors duration-500',
                    ownership === name ? 'text-ink underline underline-offset-4' : 'text-ink-400 hover:text-ink',
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <Spinner label="Loading colleges" />}
      {error && <div className="mt-12"><ErrorNote message={error} /></div>}

      {data && (
        <>
          <p className="mt-10 overline">
            {visible.length} {visible.length === 1 ? 'college' : 'colleges'}
          </p>

          {visible.length === 0 ? (
            <EmptyNote title="Nothing matches that search." hint="Try a different name or discipline." />
          ) : (
            <div className="mt-8 space-y-12">
              {visible.map((college, i) => (
                <Reveal key={college._id} delay={Math.min(i, 4) * 70}>
                  <CollegeCard college={college} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
      </Section>
    </>
  );
}
