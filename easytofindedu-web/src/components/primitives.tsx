import type { ReactNode } from 'react';
import { cx } from '../lib/format';

export function Section({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'header' | 'footer';
}) {
  return <Tag className={cx('relative z-10 mx-auto w-full max-w-page px-6 md:px-12', className)}>{children}</Tag>;
}

export function Overline({ children, className, light = false }: { children: ReactNode; className?: string; light?: boolean }) {
  return <p className={cx(light ? 'overline-light' : 'overline', className)}>{children}</p>;
}

/** Opens a section: gold rule, folio, label. The recurring structural motif. */
export function SectionMark({
  folio,
  label,
  light = false,
  className,
}: {
  folio: string;
  label: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cx('flex items-center gap-6', className)}>
      <span className="folio">{folio}</span>
      <span className={light ? 'overline-light' : 'overline'}>{label}</span>
      <span className={cx('h-px flex-1', light ? 'rule-gold-dark' : 'rule-gold')} />
    </div>
  );
}

export function Spinner({ label = 'Loading', light = false }: { label?: string; light?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32" role="status">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rotate-45 border border-gold-500/40" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-gold-500" />
      </div>
      <p className={light ? 'overline-light' : 'overline'}>{label}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="border-l-2 border-wine bg-cream-200 px-8 py-7">
      <p className="overline text-wine">Unable to load</p>
      <p className="mt-3 text-sm text-ink-700">{message}</p>
    </div>
  );
}

export function EmptyNote({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border-t border-cream-300 py-32 text-center">
      <p className="font-display text-d3 text-ink-700">{title}</p>
      {hint && <p className="mt-4 text-sm text-ink-400">{hint}</p>}
    </div>
  );
}

export function Tag({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cx(
        'inline-block border px-4 py-1.5 text-[10px] uppercase tracking-wide2',
        dark ? 'border-gold-500/40 text-gold-300' : 'border-gold-500/50 text-gold-700',
      )}
    >
      {children}
    </span>
  );
}

/**
 * Primary action. A gold panel wipes across from the left on hover,
 * which reads as considerably more crafted than a colour swap.
 */
export function Action({
  children,
  variant = 'gold',
  className,
}: {
  children: ReactNode;
  variant?: 'gold' | 'outline' | 'light';
  className?: string;
}) {
  const base =
    'group/act relative inline-flex items-center gap-4 overflow-hidden px-10 py-5 text-[11px] uppercase tracking-wide2 transition-colors duration-700';

  const skin =
    variant === 'gold'
      ? 'bg-gold-500 text-night-800'
      : variant === 'light'
        ? 'border border-cream-100/35 text-cream-100 hover:text-night-800'
        : 'border border-night-800 text-night-800 hover:text-cream-100';

  const wipe =
    variant === 'gold'
      ? 'bg-night-800'
      : variant === 'light'
        ? 'bg-cream-100'
        : 'bg-night-800';

  return (
    <span className={cx(base, skin, className)}>
      <span
        aria-hidden
        className={cx(
          'absolute inset-0 -translate-x-full transition-transform duration-700 ease-editorial group-hover/act:translate-x-0',
          wipe,
        )}
      />
      <span className={cx('relative z-10 transition-colors duration-700', variant === 'gold' && 'group-hover/act:text-gold-400')}>
        {children}
      </span>
      <span className="relative z-10 transition-transform duration-700 ease-editorial group-hover/act:translate-x-1.5">
        →
      </span>
    </span>
  );
}
