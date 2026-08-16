import {
  motion,
  useInView as fmInView,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cx } from '../lib/format';

/* ── shared easing ───────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
/* ── Reveal ─────────────────────────────────────────────────── */
/**
 * Fade + rise on scroll into view.
 * Uses Framer Motion's whileInView so it fires correctly in every capture.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
  scale,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: scale ?? 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.85, delay: delay / 1000, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── LineReveal ─────────────────────────────────────────────── */
const lineVariants: Variants = {
  hidden: { y: '105%' },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 1.05, delay: i * 0.11, ease },
  }),
};

export function LineReveal({
  lines,
  className,
  delay = 0,
  as: Tag = 'h2',
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = fmInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  return (
    <div ref={ref}>
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.1em', marginBottom: '-0.1em' }}>
            <motion.span
              style={{ display: 'block' }}
              variants={lineVariants}
              custom={i + delay / 110}
              animate={inView ? 'visible' : 'hidden'}
              initial="hidden"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

/* ── Parallax ───────────────────────────────────────────────── */
export function Parallax({
  children,
  speed = 0.14,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className={cx('overflow-hidden', className)}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* ── Counter ────────────────────────────────────────────────── */
import { useEffect, useState } from 'react';

export function Counter({ to, duration = 1700, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = fmInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || !to) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {to ? value : '—'}
      {to ? suffix : ''}
    </span>
  );
}

/* ── Magnetic ───────────────────────────────────────────────── */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 140, damping: 18, mass: 0.8 });
  const y = useSpring(0, { stiffness: 140, damping: 18, mass: 0.8 });

  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={ref} style={{ x, y, display: 'inline-block' }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.span>
  );
}

/* ── Marquee ────────────────────────────────────────────────── */
export function Marquee({
  items,
  className,
  dark = false,
}: {
  items: string[];
  className?: string;
  dark?: boolean;
}) {
  if (!items.length) return null;
  const run = [...items, ...items];

  return (
    <div className={cx('group relative flex overflow-hidden', className)}>
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 42, ease: 'linear', repeat: Infinity }}
        style={{ willChange: 'transform' }}
      >
        {run.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className={cx('px-10 font-display text-[clamp(1.3rem,2.2vw,1.9rem)] italic', dark ? 'text-cream-200/80' : 'text-ink-500')}>
              {item}
            </span>
            <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Tilt ───────────────────────────────────────────────────── */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max);
    rotateX.set(-py * max);
  };
  const onLeave = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
