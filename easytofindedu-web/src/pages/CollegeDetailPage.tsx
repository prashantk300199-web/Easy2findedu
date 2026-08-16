import { Link, useParams } from 'react-router-dom';
import { fetchCollege } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import { getCollegeImage } from '../lib/format';
import { ErrorNote, Overline, Section, Spinner, Tag } from '../components/primitives';
import { LineReveal, Reveal } from '../components/motion';
import { Figure } from '../components/Figure';
import type { CollegeCourse } from '../lib/types';

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const QUOTA_LABELS: Record<string, string> = {
  directAdmissionAvailable: 'Direct admission',
  managementQuota: 'Management quota',
  nriQuota: 'NRI quota',
  stateQuota: 'State quota',
  aiqQuota: 'All-India quota',
  scholarshipAdmission: 'Scholarship admission',
};

function CourseRow({ entry }: { entry: CollegeCourse }) {
  const course = typeof entry.course === 'object' ? entry.course : null;
  const name = course?.courseName ?? (typeof entry.course === 'string' ? entry.course : 'Course');
  const total = entry.fees?.totalYearlyExpense ?? entry.fees?.tuitionFee;
  const duration = course?.duration?.value
    ? `${course.duration.value} ${course.duration.unit ?? ''}`.trim()
    : null;

  return (
    <div className="border-t border-cream-300 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h3 className="font-display text-xl text-ink">{name}</h3>
          {course?.fullForm && <p className="mt-1 text-sm text-ink-500">{course.fullForm}</p>}
        </div>
        {total ? (
          <div className="text-right">
            <p className="font-display text-lg tabular-nums text-ink">{rupees.format(total)}</p>
            <p className="overline mt-1">Per year</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-400">
        {duration && <span>{duration}</span>}
        {course?.degreeType && <span>{course.degreeType}</span>}
        {course?.semesters ? <span>{course.semesters} semesters</span> : null}
        {/* intakeSeats is 1 for every record upstream — an unset placeholder, not a real capacity. */}
        {course?.intakeSeats && course.intakeSeats > 1 ? <span>{course.intakeSeats} seats</span> : null}
        {course?.modeOfStudy && <span>{course.modeOfStudy}</span>}
        {course?.internshipIncluded && <span>Internship included</span>}
      </div>

      {course?.eligibility && (
        <p className="mt-4 text-sm leading-relaxed text-ink-500">
          <span className="text-ink-600">Eligibility · </span>
          {course.eligibility}
        </p>
      )}

      {course?.entranceExamsAccepted?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {course.entranceExamsAccepted.map((exam) => (
            <Tag key={exam}>{exam}</Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useAsync((signal) => fetchCollege(id!, signal), [id]);

  if (loading) return <Section><Spinner label="Loading college" /></Section>;
  if (error) return <Section className="py-20"><ErrorNote message={error} /></Section>;
  if (!data) return null;

  const college = data;
  const placements = college.placements;
  const quotas = Object.entries(college.admission?.quotas ?? {})
    .filter(([key, on]) => on && QUOTA_LABELS[key])
    .map(([key]) => QUOTA_LABELS[key]);

  const stats = [
    placements?.placementPercentage ? { value: `${placements.placementPercentage}%`, label: 'Placed' } : null,
    placements?.averagePackage ? { value: `${placements.averagePackage} LPA`, label: 'Average package' } : null,
    placements?.highestPackage ? { value: `${placements.highestPackage} LPA`, label: 'Highest package' } : null,
    placements?.internshipPercentage ? { value: `${placements.internshipPercentage}%`, label: 'Internships' } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <>
      <Section className="pt-10">
        <Link to="/colleges" className="link-underline text-sm text-ink-500 hover:text-ink">
          ← All colleges
        </Link>

        <header className="mt-10 grid gap-10 border-t border-night-800 pt-8 md:grid-cols-[1fr_200px] md:items-start">
          <div>
            {college.collegeType && <Overline>{college.collegeType}</Overline>}
            <LineReveal
              as="h1"
              className="mt-5 font-display text-d2 text-ink"
              lines={[<>{college.name}</>]}
            />
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              {college.establishedYear && <span>Established {college.establishedYear}</span>}
              {college.ownershipType && <span>{college.ownershipType}</span>}
              {college.affiliationType && <span>{college.affiliationType}</span>}
            </div>
          </div>

          <Figure src={getCollegeImage(college)} alt={college.name} name={college.name} ratio="aspect-square" />
        </header>

        {stats.length > 0 && (
          <dl className="mt-16 grid grid-cols-2 gap-y-10 border-t border-cream-300 pt-10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-4xl tabular-nums text-ink">{stat.value}</dd>
                <dt className="overline mt-3">{stat.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </Section>

      <Section className="py-20">
        <div className="grid gap-x-16 gap-y-16 md:grid-cols-[1.6fr_1fr]">
          <div>
            {college.about && (
              <Reveal>
                <Overline>About</Overline>
                <p className="mt-6 whitespace-pre-line font-display text-xl leading-relaxed text-ink-600">
                  {college.about}
                </p>
              </Reveal>
            )}

            {college.coursesOffered?.length ? (
              <Reveal className="mt-16">
                <Overline>Courses offered</Overline>
                <div className="mt-8">
                  {college.coursesOffered.map((entry, i) => (
                    <CourseRow key={entry._id ?? i} entry={entry} />
                  ))}
                </div>
              </Reveal>
            ) : null}

            {college.admission?.process && (
              <Reveal className="mt-16">
                <Overline>Admission</Overline>
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                  {college.admission.process}
                </p>
              </Reveal>
            )}
          </div>

          <aside>
            {college.approvedBy?.length ? (
              <div>
                <Overline>Approvals</Overline>
                <div className="mt-5 flex flex-wrap gap-2">
                  {college.approvedBy.map((body) => (
                    <Tag key={body}>{body}</Tag>
                  ))}
                </div>
              </div>
            ) : null}

            {college.accreditation?.length ? (
              <div className="mt-12">
                <Overline>Accreditation</Overline>
                <div className="mt-5 flex flex-wrap gap-2">
                  {college.accreditation.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </div>
            ) : null}

            {quotas.length > 0 && (
              <div className="mt-12">
                <Overline>Admission routes</Overline>
                <ul className="mt-5">
                  {quotas.map((quota) => (
                    <li key={quota} className="border-t border-cream-300 py-3 text-sm text-ink-600">
                      {quota}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {placements?.topRecruiters?.length ? (
              <div className="mt-12">
                <Overline>Top recruiters</Overline>
                <ul className="mt-5">
                  {placements.topRecruiters.map((recruiter) => (
                    <li key={recruiter} className="border-t border-cream-300 py-3 text-sm text-ink-600">
                      {recruiter.replace(/\.$/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {college.hostel?.isAvailable && (
              <div className="mt-12 bg-gold-100 p-6">
                <Overline>Hostel</Overline>
                <p className="mt-3 font-display text-lg text-gold-700">
                  Available on campus{college.hostel.foodIncluded ? ', meals included' : ''}
                </p>
              </div>
            )}

            {college.contact?.address && (
              <div className="mt-12">
                <Overline>Address</Overline>
                <p className="mt-4 text-sm leading-relaxed text-ink-600">
                  {college.contact.address.replace(/^Full Address:\s*/i, '')}
                </p>
              </div>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
