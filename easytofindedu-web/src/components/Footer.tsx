import { Link } from 'react-router-dom';
import { Action, Section } from './primitives';
import { LineReveal, Magnetic } from './motion';
import { Wordmark } from './Logo';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/institutes', label: 'Institutes' },
      { to: '/colleges', label: 'Colleges' },
      { to: '/hostels', label: 'Hostels' },
      { to: '/abroad', label: 'Study Abroad' },
      { to: '/online-courses', label: 'Online Courses' },
    ],
  },
  {
    title: 'Student Services',
    links: [
      { to: '/career-guidance', label: 'Career Guidance' },
      { to: '/journal', label: 'Student Guides' },
      { to: '/institutes', label: 'Compare Institutes' },
      { to: '/hostels', label: 'Compare Hostels' },
    ],
  },
  {
    title: 'Cities',
    links: [
      { to: '/hostels', label: 'Patna' },
      { to: '/hostels', label: 'Boring Road' },
      { to: '/hostels', label: 'Patliputra Colony' },
      { to: '/institutes', label: 'All Cities' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-night-900 text-cream-100">
      <Section className="pb-14 pt-28">
        {/* Closing invitation */}
        <div className="border-b border-gold-500/20 pb-20">
          <div className="grid gap-14 lg:grid-cols-[1.5fr_auto] lg:items-end">
            <LineReveal
              className="max-w-3xl font-display text-d2"
              lines={[
                <>Ready to find your</>,
                <>
                  <span className="gilded italic">perfect path?</span>
                </>,
              ]}
            />
            <Magnetic>
              <Link to="/career-guidance">
                <Action>Begin Your Journey</Action>
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Mobile navigation menu */}
        <div className="border-b border-gold-500/20 py-12 md:hidden">
          <nav className="grid grid-cols-2 gap-4">
            <Link
              to="/hostels"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Hostels
            </Link>
            <Link
              to="/institutes"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Institutes
            </Link>
            <Link
              to="/colleges"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Colleges
            </Link>
            <Link
              to="/career-guidance"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Careers
            </Link>
            <Link
              to="/abroad"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Abroad
            </Link>
            <Link
              to="/online-courses"
              className="rounded-lg bg-gold-500/10 px-6 py-4 text-center font-medium text-cream-100 transition-colors hover:bg-gold-500/20"
            >
              Online
            </Link>
          </nav>
        </div>

        <div className="grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Wordmark light size={42} />
            <p className="mt-7 max-w-xs text-sm leading-relaxed text-cream-100/55">
              India's trusted platform for institutes, colleges and student housing — verified,
              compared and documented in full.
            </p>
            <p className="mt-8 text-sm text-cream-100/40">Patna, Bihar · India</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="overline-light">{col.title}</p>
              <ul className="mt-7 space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="link-underline text-sm text-cream-100/65 transition-colors duration-500 hover:text-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-gold-500/20 pt-9 text-xs text-cream-100/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EasyToFind. All rights reserved.</p>
          <p className="tracking-wide2">Verified Listings · Genuine Reviews · No Brokerage</p>
        </div>
      </Section>
    </footer>
  );
}
