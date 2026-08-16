import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHostels } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { bedsAvailable, cx, hostelPlace, hostelTypeLabel, imageUrl, inr, rentFrom } from '../lib/format';
import { EmptyNote, ErrorNote, Section, Spinner } from '../components/primitives';
import { PageHero } from '../components/PageHero';
import { IMG } from '../lib/images';
import { Reveal } from '../components/motion';
import { Figure } from '../components/Figure';
import { WishlistButton } from '../components/WishlistButton';
import { CompactReviewDisplay } from '../components/ReviewSystem';

type Sort = 'default' | 'rent-asc' | 'rent-desc';

const PAGE = 18;

export function HostelsPage() {
  const { data, loading, error } = useAsync((signal) => fetchHostels(100, signal), []);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState<Sort>('default');
  // 75 records at full-bleed would run past 20,000px; reveal them in batches.
  const [shown, setShown] = useState(PAGE);

  const all = data?.items ?? [];

  const types = useMemo(() => {
    const set = new Set<string>();
    all.forEach((h) => h.hostel_type && set.add(h.hostel_type));
    return ['All', ...[...set].sort()];
  }, [all]);

  useEffect(() => {
    setShown(PAGE);
  }, [query, type, sort]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter((h) => {
      const matchesType = type === 'All' || h.hostel_type === type;
      const matchesQuery =
        !q || h.name.toLowerCase().includes(q) || hostelPlace(h).toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });

    if (sort === 'default') return filtered;
    return [...filtered].sort((a, b) => {
      const ar = rentFrom(a) ?? Number.MAX_SAFE_INTEGER;
      const br = rentFrom(b) ?? Number.MAX_SAFE_INTEGER;
      return sort === 'rent-asc' ? ar - br : br - ar;
    });
  }, [all, query, type, sort]);

  return (
    <>
      <PageHero
        eyebrow="Student Housing"
        titleLines={[<>A home away</>, <>from <span className="gilded italic">home.</span></>]}
        intro="Verified student housing — rent, room types, security, house rules and distance to the institutes that matter."
        image={IMG.hostelHero}
        stats={[
          { value: all.length || '—', label: 'Hostels' },
          { value: all.reduce((n, h) => n + bedsAvailable(h), 0) || '—', label: 'Beds free' },
          { value: 'Verified', label: 'Every listing' },
          { value: 'No', label: 'Brokerage' },
        ]}
      />
      <Section className="py-16 md:py-20">
      <div className="mt-16 border-t border-night-800 pt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Search hostels</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or area"
              className="w-full border-0 border-b border-cream-400 bg-transparent pb-4 pr-8 font-display text-d4 text-ink placeholder:text-ink-400 focus:border-gold-700 focus:outline-none focus:ring-0"
            />
          </label>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {(
              [
                ['default', 'Featured'],
                ['rent-asc', 'Rent ↑'],
                ['rent-desc', 'Rent ↓'],
              ] as [Sort, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cx(
                  'text-[10px] uppercase tracking-overline transition-colors duration-500',
                  sort === key ? 'text-gold-700' : 'text-ink-400 hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {types.length > 2 && (
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {types.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setType(name)}
                className={cx(
                  'text-sm transition-colors duration-500',
                  type === name ? 'text-ink underline underline-offset-4' : 'text-ink-400 hover:text-ink',
                )}
              >
                {name === 'All' ? 'All' : hostelTypeLabel(name)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <Spinner label="Loading hostels" />}
      {error && <div className="mt-12"><ErrorNote message={error} /></div>}

      {data && (
        <>
          <p className="mt-10 overline">
            Showing {Math.min(shown, visible.length)} of {visible.length}{' '}
            {visible.length === 1 ? 'hostel' : 'hostels'}
          </p>

          {visible.length === 0 ? (
            <EmptyNote title="Nothing matches that search." hint="Try a different name or area." />
          ) : (
            <div className="mt-8 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {visible.slice(0, shown).map((hostel, i) => {
                const rent = rentFrom(hostel);
                const free = bedsAvailable(hostel);
                return (
                  <Reveal key={hostel._id} delay={(i % 3) * 70}>
                    <Link to={`/hostels/${hostel.slug}`} className="group block">
                      <article>
                        <div className="relative overflow-hidden">
                          <Figure
                            src={imageUrl(hostel.photos?.[0])}
                            alt={hostel.name}
                            name={hostel.name}
                            ratio="aspect-[4/5]"
                          />
                          <span className="absolute left-4 top-4 bg-night-900/85 px-3 py-1.5 text-[10px] uppercase tracking-overline text-gold-400 backdrop-blur-sm">
                            {hostelTypeLabel(hostel.hostel_type)}
                          </span>
                          <div className="absolute right-3 top-3" onClick={(e) => e.preventDefault()}>
                            <WishlistButton itemId={hostel._id} itemType="hostel" compact />
                          </div>
                          {(hostel as any).offer && (
                            <span className="absolute left-0 bottom-5 bg-red-500 text-white text-[10px] uppercase tracking-wide px-3 py-1.5 font-bold">
                              {(hostel as any).offer}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-baseline justify-between gap-4">
                          <h2 className="font-display text-[22px] leading-tight text-ink transition-colors duration-500 group-hover:text-gold-700">
                            {hostel.name}
                          </h2>
                          <span className="folio">{String(i + 1).padStart(2, '0')}</span>
                        </div>

                        <p className="mt-2 text-sm text-ink-500">{hostelPlace(hostel)}</p>
                        {(hostel as any).averageRating && (
                          <div className="mt-1">
                            <CompactReviewDisplay rating={(hostel as any).averageRating ?? 4.2} reviewCount={(hostel as any).totalReviews ?? 0} />
                          </div>
                        )}

                        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-cream-300 pt-4">
                          {rent ? (
                            <p className="text-sm text-ink-700">
                              <span className="font-display text-lg">{inr.format(rent)}</span>
                              <span className="text-ink-400"> / month</span>
                            </p>
                          ) : (
                            <span className="text-sm text-ink-400">Rent on request</span>
                          )}
                          {free > 0 && <span className="text-xs text-gold-600">{free} beds free</span>}
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}

          {shown < visible.length && (
            <div className="mt-20 flex justify-center border-t border-cream-300 pt-14">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="group inline-flex items-center gap-4 border border-night-800 px-10 py-5 text-[12px] uppercase tracking-overline text-ink transition-colors duration-500 hover:bg-night-900 hover:text-cream-100"
              >
                Show {Math.min(PAGE, visible.length - shown)} more
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-y-0.5">↓</span>
              </button>
            </div>
          )}
        </>
      )}
      </Section>
    </>
  );
}
