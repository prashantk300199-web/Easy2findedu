import { Link } from 'react-router-dom';
import type { Institute } from '../lib/types';
import { facilityList, imageUrl, placeLine } from '../lib/format';
import { Figure } from './Figure';

export function InstituteCard({ institute, index }: { institute: Institute; index?: number }) {
  const cover = imageUrl(institute.galleryImages?.[0]) ?? imageUrl(institute.logo);
  const place = placeLine(institute);
  const facilities = facilityList(institute);

  return (
    <Link to={`/institutes/${institute._id}`} className="group block">
      <article>
        <Figure src={cover} alt={institute.name} name={institute.name} />

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[22px] leading-tight text-ink transition-colors duration-500 group-hover:text-gold-700">
            {institute.name.trim()}
          </h3>
          {typeof index === 'number' && (
            <span className="shrink-0 font-sans text-xs tabular-nums text-ink-400">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </div>

        {place && <p className="mt-2 text-sm text-ink-500">{place}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-400">
          {institute.establishedYear && <span>Est. {institute.establishedYear}</span>}
          {institute.avgFacultyExperience ? <span>{institute.avgFacultyExperience} yrs avg. faculty</span> : null}
          {facilities.length > 0 && <span>{facilities.length} facilities</span>}
        </div>
      </article>
    </Link>
  );
}
