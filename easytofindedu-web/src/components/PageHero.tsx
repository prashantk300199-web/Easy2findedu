import type { ReactNode } from 'react';
import { Section } from './primitives';
import { LineReveal, Parallax, Reveal } from './motion';

/**
 * Shared cinematic masthead for every inner page: full-bleed photograph,
 * scrim, eyebrow, display title and optional stat row.
 */
export function PageHero({
  eyebrow,
  titleLines,
  intro,
  image,
  stats,
  children,
}: {
  eyebrow: string;
  titleLines: ReactNode[];
  intro?: string;
  image?: string | null;
  stats?: { value: ReactNode; label: string }[];
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-night-900">
      {image && (
        <Parallax speed={0.12} className="absolute inset-0 -top-20 -bottom-20">
          <img src={image} alt="" className="h-full w-full object-cover opacity-40 saturate-[0.7]" />
        </Parallax>
      )}
      <div className="absolute inset-0 scrim" />

      <Section className="relative pb-20 pt-24 md:pb-24 md:pt-28">
        <Reveal>
          <div className="inline-flex items-center gap-4 border border-gold-500/35 px-5 py-2.5">
            <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" />
            <span className="text-[10px] uppercase tracking-overline text-gold-300">{eyebrow}</span>
          </div>
        </Reveal>

        <LineReveal
          as="h1"
          delay={120}
          className="mt-9 max-w-4xl font-display text-d1 text-cream-100"
          lines={titleLines}
        />

        {intro && (
          <Reveal delay={420}>
            <p className="mt-9 max-w-xl text-[16px] leading-relaxed text-cream-100/65">{intro}</p>
          </Reveal>
        )}

        {stats && stats.length > 0 && (
          <Reveal delay={520}>
            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-y-8 border-t border-gold-500/20 pt-9 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-none text-gold-400">
                    {s.value}
                  </dd>
                  <dt className="mt-3 text-[10px] uppercase tracking-overline text-cream-100/50">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {children}
      </Section>
    </div>
  );
}
