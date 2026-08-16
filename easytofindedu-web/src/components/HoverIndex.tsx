import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { initials } from '../lib/format';

export interface IndexRow {
  id: string;
  href: string;
  title: string;
  meta?: string | null;
  trailing?: string | null;
  image: string | null;
}

/**
 * Editorial index with Framer Motion spring-based cursor-following preview.
 * Hovering a row dims neighbours, slides the row right, and floats that
 * record's photograph trailing the cursor with spring physics.
 */
export function HoverIndex({ rows }: { rows: IndexRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Spring-tracked cursor position relative to the list container
  const rawX = useSpring(0, { stiffness: 90, damping: 22, mass: 0.6 });
  const rawY = useSpring(0, { stiffness: 90, damping: 22, mass: 0.6 });

  // Offset so the preview is centred on the cursor
  const previewX = useTransform(rawX, (v) => v - 120);
  const previewY = useTransform(rawY, (v) => v - 150);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={listRef}
      className="relative"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setActive(null)}
    >
      {/* Floating preview */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden h-[300px] w-[240px] overflow-hidden md:block"
        style={{ x: previewX, y: previewY, opacity: active === null ? 0 : 1 }}
        transition={{ opacity: { duration: 0.35 } }}
      >
        {rows.map((row, i) => (
          <motion.div
            key={row.id}
            className="absolute inset-0"
            animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.08 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {row.image ? (
              <img src={row.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-night-700">
                <span className="font-display text-4xl text-gold-500/70">{initials(row.title)}</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Rows */}
      <div className="border-t border-ink-300/45">
        {rows.map((row, i) => {
          const dimmed = active !== null && active !== i;
          return (
            <Link
              key={row.id}
              to={row.href}
              className="group block border-b border-ink-300/45"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <motion.div
                className="flex items-baseline gap-5 py-6 md:gap-8 md:py-7"
                animate={{
                  opacity: dimmed ? 0.32 : 1,
                  x: active === i ? 18 : 0,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="folio w-7 shrink-0 pt-1">{String(i + 1).padStart(2, '0')}</span>

                <h3 className="min-w-0 flex-1 font-display text-[26px] text-ink transition-colors duration-500 group-hover:text-gold-700 md:text-[38px]">
                  {row.title}
                </h3>

                {row.meta && (
                  <span className="hidden shrink-0 text-sm text-ink-500 md:block md:w-52">{row.meta}</span>
                )}
                {row.trailing && (
                  <span className="hidden shrink-0 tabular-nums text-sm text-ink-400 sm:block">{row.trailing}</span>
                )}

                <motion.span
                  aria-hidden
                  className="shrink-0 text-ink-400"
                  animate={{ opacity: active === i ? 1 : 0, x: active === i ? 0 : -8 }}
                  transition={{ duration: 0.4 }}
                >
                  ↗
                </motion.span>
              </motion.div>

              {/* Mobile inline image */}
              {row.image && (
                <div className="mb-6 h-44 w-full overflow-hidden md:hidden">
                  <img src={row.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
