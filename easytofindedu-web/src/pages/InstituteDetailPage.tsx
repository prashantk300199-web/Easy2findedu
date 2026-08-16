import { Link, useParams } from 'react-router-dom';
import { fetchInstitute } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { facilityList, imageUrl, placeLine } from '../lib/format';
import { ErrorNote, Overline, Section, Spinner } from '../components/primitives';
import { LineReveal, Reveal } from '../components/motion';
import { Figure } from '../components/Figure';
import type { Institute } from '../lib/types';

function Gallery({ institute }: { institute: Institute }) {
  const images = (institute.galleryImages ?? []).map(imageUrl).filter((u): u is string => Boolean(u));
  if (images.length === 0) return null;

  const [lead, ...rest] = images;

  return (
    <div className="mt-12 grid gap-3 md:grid-cols-3">
      <div className="md:col-span-2">
        <Figure src={lead} alt={institute.name} name={institute.name} ratio="aspect-[16/10]" />
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
        {rest.slice(0, 3).map((src, i) => (
          <Figure key={src} src={src} alt={`${institute.name} photograph ${i + 2}`} name={institute.name} ratio="aspect-square md:aspect-[16/9]" />
        ))}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="border-t border-cream-300 py-5">
      <dt className="overline">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-ink-600">{value}</dd>
    </div>
  );
}

/** Upstream stores these policy fields as newline-separated lists. */
function Prose({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <ul className="mt-4 space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-600">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold-700" />
            {line}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-4 text-sm leading-relaxed text-ink-600">{text}</p>;
}

export function InstituteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useAsync((signal) => fetchInstitute(id!, signal), [id]);

  if (loading) return <Section><Spinner label="Loading institute" /></Section>;
  if (error) return <Section className="py-20"><ErrorNote message={error} /></Section>;
  if (!data) return null;

  const institute = data;
  const place = placeLine(institute);
  const facilities = facilityList(institute);
  const academic = institute.academicInfo;
  const transparency = institute.transparency ?? {};
  const policies = [
    { label: 'Admission process', text: transparency.admissionProcess },
    { label: 'Fee clarity', text: transparency.feeClarity },
    { label: 'Refund policy', text: transparency.refundPolicy },
    { label: 'Grievance system', text: transparency.grievanceSystem },
    { label: 'Code of conduct', text: transparency.codeOfConduct },
  ].filter((p) => p.text && p.text.trim());

  return (
    <>
      <Section className="pt-10">
        <Link to="/institutes" className="link-underline text-sm text-ink-500 hover:text-ink">
          ← All institutes
        </Link>

        <header className="mt-10 grid gap-10 border-t border-night-800 pt-8 md:grid-cols-[1.7fr_1fr] md:items-end">
          <div>
            {place && <Overline>{place}</Overline>}
            <LineReveal
              as="h1"
              className="mt-5 font-display text-d2 text-ink"
              lines={[<>{institute.name.trim()}</>]}
            />
          </div>

          <dl className="grid grid-cols-2 gap-6 md:pb-3">
            {institute.establishedYear ? (
              <div>
                <dd className="font-display text-3xl tabular-nums text-ink">{institute.establishedYear}</dd>
                <dt className="overline mt-2">Established</dt>
              </div>
            ) : null}
            {institute.avgFacultyExperience ? (
              <div>
                <dd className="font-display text-3xl tabular-nums text-ink">
                  {institute.avgFacultyExperience} yrs
                </dd>
                <dt className="overline mt-2">Avg. faculty</dt>
              </div>
            ) : null}
          </dl>
        </header>

        <Gallery institute={institute} />
      </Section>

      <Section className="py-20">
        <div className="grid gap-x-16 gap-y-16 md:grid-cols-[1.6fr_1fr]">
          <div>
            {institute.about && (
              <Reveal>
                <Overline>About</Overline>
                <p className="mt-6 whitespace-pre-line font-display text-xl leading-relaxed text-ink-600">
                  {institute.about}
                </p>
              </Reveal>
            )}

            {policies.length > 0 && (
              <Reveal className="mt-16">
                <Overline>Transparency</Overline>
                <div className="mt-8 space-y-10">
                  {policies.map((policy) => (
                    <div key={policy.label} className="border-t border-cream-300 pt-6">
                      <h3 className="font-display text-xl text-ink">{policy.label}</h3>
                      <Prose text={policy.text!} />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {facilities.length > 0 && (
              <Reveal className="mt-16">
                <Overline>Facilities</Overline>
                <ul className="mt-6 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
                  {facilities.map((facility) => (
                    <li key={facility} className="border-t border-cream-300 py-3 text-sm text-ink-600">
                      {facility}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          <aside>
            <Overline>Details</Overline>
            <dl className="mt-6">
              <Spec label="Director" value={institute.directorName} />
              <Spec label="Branches" value={institute.totalBranches} />
              <Spec label="Student–faculty ratio" value={academic?.studentFacultyRatio} />
              <Spec label="Teaching methodology" value={academic?.teachingMethodology} />
              <Spec label="Mock test frequency" value={academic?.mockTestFrequency?.trim()} />
              <Spec label="Address" value={institute.location?.fullAddress} />
              <Spec label="Landmark" value={institute.location?.landmark} />
            </dl>

            {institute.websiteUrl && (
              <a
                href={institute.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group mt-8 inline-flex items-center gap-3 bg-night-900 px-7 py-4 text-sm text-cream-100 transition-colors duration-500 hover:bg-gold-700"
              >
                Visit website
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">↗</span>
              </a>
            )}

            {institute.location?.distanceFromLandmarks?.length ? (
              <div className="mt-12">
                <Overline>Nearby</Overline>
                <ul className="mt-5">
                  {institute.location.distanceFromLandmarks.map((entry, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-4 border-t border-cream-300 py-3 text-sm">
                      <span className="text-ink-600">{entry.landmarkName}</span>
                      <span className="tabular-nums text-ink-400">{entry.distanceInKm} km</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  );
}
