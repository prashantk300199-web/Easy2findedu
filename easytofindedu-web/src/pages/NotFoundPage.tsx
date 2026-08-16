import { Link } from 'react-router-dom';
import { Overline, Section } from '../components/primitives';

export function NotFoundPage() {
  return (
    <Section className="py-32">
      <Overline>Error 404</Overline>
      <h1 className="mt-6 max-w-2xl font-display text-5xl leading-tight text-ink md:text-6xl">
        This page has moved on.
      </h1>
      <Link
        to="/"
        className="group mt-10 inline-flex items-center gap-3 bg-night-900 px-8 py-4 text-sm text-cream-100 transition-colors duration-500 hover:bg-gold-700"
      >
        Return home
        <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">→</span>
      </Link>
    </Section>
  );
}
