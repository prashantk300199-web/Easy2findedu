import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { AIPetChat } from './AIPetChat';

// Cheap, stable id so the dismissal flag survives renders.
const DISMISS_KEY = 'ai_pet_dismissed_v1';
const LAST_BUBBLE_KEY = 'ai_pet_last_bubble_v1';

const PROACTIVE_BUBBLES: { id: string; text: string; pageMatch?: RegExp }[] = [
  { id: 'bubble-hostel', text: 'Looking for a hostel? 🏠', pageMatch: /^\/$|^\/career/ },
  { id: 'bubble-college', text: 'Want help finding a college? 🎓', pageMatch: /^\/$|^\/colleges/ },
  { id: 'bubble-institute', text: 'Need a coaching institute? 📚', pageMatch: /^\/$|^\/institutes/ },
  { id: 'bubble-compare', text: 'Want me to compare colleges for you? ⚖️', pageMatch: /^\/colleges|^\/institutes|^\/hostels/ },
  { id: 'bubble-course', text: 'Not sure which course? I can help. 🧭', pageMatch: /^\/career/ },
  { id: 'bubble-scholarship', text: 'Looking for scholarships? 💰', pageMatch: /^\/career/ },
];

const pickBubble = (pathname: string) => {
  const candidates = PROACTIVE_BUBBLES.filter((b) => !b.pageMatch || b.pageMatch.test(pathname));
  const pool = candidates.length ? candidates : PROACTIVE_BUBBLES;
  const last = (() => {
    try {
      return localStorage.getItem(LAST_BUBBLE_KEY) || '';
    } catch {
      return '';
    }
  })();
  const filtered = pool.filter((b) => b.id !== last);
  return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
};

export function AIPet() {
  const location = useLocation();
  const pathname = location.pathname;
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bubble, setBubble] = useState<{ id: string; text: string } | null>(null);
  const [contextIds, setContextIds] = useState<{ hostels?: string[]; institutes?: string[]; colleges?: string[] }>({});
  const timerRef = useRef<number | null>(null);
  const firstShowRef = useRef(false);

  // Hide the pet on routes where it would interfere (admin / dashboards / login).
  const shouldHide = useMemo(() => {
    if (!pathname) return false;
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/hostel-dashboard') ||
      pathname.startsWith('/institute-dashboard') ||
      pathname.startsWith('/institute-registration') ||
      pathname.startsWith('/institute-owner') ||
      pathname.startsWith('/college-dashboard') ||
      pathname.startsWith('/college-registration') ||
      pathname.startsWith('/college-owner') ||
      pathname === '/login'
    ) {
      return true;
    }
    return false;
  }, [pathname]);

  // Read the currently-viewed hostel/institute/college id off the URL so the
  // pet can offer contextual comparisons.
  useEffect(() => {
    const set: { hostels?: string[]; institutes?: string[]; colleges?: string[] } = {};
    const hostel = pathname.match(/^\/hostels\/([^/?#]+)/);
    const inst = pathname.match(/^\/institutes\/([^/?#]+)/);
    const coll = pathname.match(/^\/colleges\/([^/?#]+)/);
    if (hostel) set.hostels = [hostel[1]];
    if (inst) set.institutes = [inst[1]];
    if (coll) set.colleges = [coll[1]];
    setContextIds(set);
  }, [pathname]);

  // Periodic proactive bubble (only when the chat is closed).
  useEffect(() => {
    if (open || muted || shouldHide) return;
    if (firstShowRef.current) {
      // First show on this page after 4s, then every ~25s.
      timerRef.current = window.setTimeout(() => {
        const next = pickBubble(pathname);
        setBubble(next);
        try {
          localStorage.setItem(LAST_BUBBLE_KEY, next.id);
        } catch {
          /* ignore */
        }
      }, 4000);
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }
    firstShowRef.current = true;
    return undefined;
  }, [open, muted, shouldHide, pathname]);

  // Auto-hide bubble after 7s.
  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(null), 7000);
    return () => window.clearTimeout(t);
  }, [bubble]);

  const dismissBubble = useCallback(() => setBubble(null), []);

  const mutePet = useCallback(() => {
    setMuted(true);
    setBubble(null);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  // Restore mute state on mount.
  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') setMuted(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleListingsShown = useCallback(
    (buckets: { hostels: string[]; institutes: string[]; colleges: string[] }) => {
      setContextIds((prev) => ({
        hostels: prev.hostels ? Array.from(new Set([...prev.hostels, ...buckets.hostels])) : buckets.hostels,
        institutes: prev.institutes ? Array.from(new Set([...prev.institutes, ...buckets.institutes])) : buckets.institutes,
        colleges: prev.colleges ? Array.from(new Set([...prev.colleges, ...buckets.colleges])) : buckets.colleges,
      }));
    },
    [],
  );

  if (shouldHide) return null;

  return (
    <>
      {/* Speech bubble */}
      <AnimatePresence>
        {!open && bubble && !muted && (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            // Sits above the floating pet button on the bottom-right.
            className="fixed bottom-[7.2rem] right-4 z-[55] max-w-[260px] border border-cream-300 bg-cream-100 px-3 py-2 text-[12px] text-night-900 shadow-lift sm:right-6"
          >
            <button
              onClick={dismissBubble}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-cream-300 bg-night-800 text-cream-100 transition-colors hover:bg-gold-500 hover:text-night-900"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <p className="leading-snug pr-4">{bubble.text}</p>
            <button
              onClick={() => {
                dismissBubble();
                setOpen(true);
              }}
              className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide2 text-gold-700 transition-colors hover:text-night-900"
            >
              Ask me →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating pet button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI Pet' : 'Open AI Pet'}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        // Position above the mobile bottom nav (h≈60px) with breathing room.
        className="group fixed bottom-20 right-4 z-[58] flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/40 bg-gradient-to-br from-night-800 to-night-700 text-cream-100 shadow-liftLg ring-1 ring-gold-500/30 transition-shadow hover:shadow-goldGlow sm:bottom-24 sm:right-6 sm:h-16 sm:w-16"
      >
        <span
          aria-hidden
          className={`text-2xl transition-transform duration-300 ${open ? 'rotate-180' : 'animate-floatY'} sm:text-3xl`}
        >
          🐾
        </span>
        <span className="absolute -bottom-5 right-0 text-[9px] font-semibold uppercase tracking-wide2 text-gold-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          EasyToFind Pet
        </span>
      </motion.button>

      {/* Mute toggle */}
      {!muted ? (
        <button
          onClick={mutePet}
          aria-label="Mute AI Pet"
          title="Mute AI Pet"
          className="fixed bottom-[5.6rem] right-[5.2rem] z-[57] hidden h-7 w-7 items-center justify-center rounded-full border border-cream-300 bg-cream-100 text-ink-500 transition-colors hover:bg-night-800 hover:text-cream-100 sm:right-[6.2rem] sm:flex"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => {
            setMuted(false);
            try {
              localStorage.removeItem(DISMISS_KEY);
            } catch {
              /* ignore */
            }
          }}
          aria-label="Unmute AI Pet"
          title="Unmute AI Pet"
          className="fixed bottom-[5.6rem] right-[5.2rem] z-[57] hidden h-7 w-7 items-center justify-center rounded-full border border-cream-300 bg-cream-100 text-ink-500 transition-colors hover:bg-night-800 hover:text-cream-100 sm:right-[6.2rem] sm:flex"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      <AIPetChat
        open={open}
        onClose={() => setOpen(false)}
        pathname={pathname}
        contextListingIds={contextIds}
        onListingsShown={handleListingsShown}
      />
    </>
  );
}

export default AIPet;