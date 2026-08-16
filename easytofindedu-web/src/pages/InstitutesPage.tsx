import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchInstitutes } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { cityName, cx, placeLine } from '../lib/format';
import { EmptyNote, ErrorNote, Section, Spinner } from '../components/primitives';
import { PageHero } from '../components/PageHero';
import { IMG } from '../lib/images';
import { Reveal } from '../components/motion';
import { InstituteCard } from '../components/InstituteCard';

type Sort = 'name' | 'oldest' | 'newest';

const SORTS: { key: Sort; label: string }[] = [
  { key: 'name', label: 'A–Z' },
  { key: 'oldest', label: 'Longest running' },
  { key: 'newest', label: 'Newest' },
];

export function InstitutesPage() {
  const { data, loading, error } = useAsync((signal) => fetchInstitutes(100, signal), []);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [city, setCity] = useState<string>('All');
  const [sort, setSort] = useState<Sort>('name');

  const all = data?.items ?? [];

  const cities = useMemo(() => {
    const names = new Set<string>();
    all.forEach((i) => {
      const name = cityName(i);
      if (name) names.add(name);
    });
    return ['All', ...[...names].sort()];
  }, [all]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter((i) => {
      const matchesCity = city === 'All' || cityName(i) === city;
      const matchesQuery =
        !q || i.name.toLowerCase().includes(q) || placeLine(i).toLowerCase().includes(q);
      return matchesCity && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.trim().localeCompare(b.name.trim());
      const ay = a.establishedYear ?? 0;
      const by = b.establishedYear ?? 0;
      return sort === 'oldest' ? ay - by : by - ay;
    });
  }, [all, query, city, sort]);

  // hero image is now a curated Unsplash photograph

  return (
    <>
      <PageHero
        eyebrow="Institute Discovery"
        titleLines={[<>Coaching that</>, <><span className="gilded italic">earns</span> its fee.</>]}
        intro="Test-preparation and coaching centres, documented in full — facilities, faculty experience, transparency and location."
        image={IMG.instituteHero}
        stats={[
          { value: all.length || '—', label: 'Institutes' },
          { value: cities.length > 1 ? cities.length - 1 : '—', label: 'Cities' },
          { value: 'Verified', label: 'Every listing' },
          { value: 'Free', label: 'To browse' },
        ]}
      />

      <Section className="py-16 md:py-20">
      <div className="mt-14 border-t border-night-800 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search institutes</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or area"
              className="w-full border-0 border-b border-cream-300 bg-transparent pb-3 pr-8 font-display text-xl text-ink placeholder:text-ink-400 focus:border-gold-700 focus:outline-none focus:ring-0"
            />
            <span aria-hidden className="pointer-events-none absolute bottom-3 right-0 text-ink-400">↳</span>
          </label>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {SORTS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                className={cx(
                  'text-[11px] uppercase tracking-overline transition-colors duration-500',
                  sort === option.key ? 'text-gold-700' : 'text-ink-400 hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {cities.length > 2 && (
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            {cities.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCity(name)}
                className={cx(
                  'text-sm transition-colors duration-500',
                  city === name ? 'text-ink underline underline-offset-4' : 'text-ink-400 hover:text-ink',
                )}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <Spinner label="Loading institutes" />}
      {error && <div className="mt-12"><ErrorNote message={error} /></div>}

      {data && (
        <>
          <p className="mt-10 overline">
            {visible.length} {visible.length === 1 ? 'institute' : 'institutes'}
          </p>

          {visible.length === 0 ? (
            <EmptyNote title="Nothing matches that search." hint="Try a different name, area or city." />
          ) : (
            <div className="mt-8 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((institute, i) => (
                <Reveal key={institute._id} delay={(i % 3) * 80}>
                  <InstituteCard institute={institute} index={i} />
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
