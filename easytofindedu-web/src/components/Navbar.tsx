import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cx } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { Action } from './primitives';
import { Magnetic } from './motion';
import { Wordmark } from './Logo';
import { API_BASE_URL } from '../lib/api';
import { WalletModal } from './WalletModal';

const LINKS = [
  { to: '/hostels', label: 'Hostels' },
  { to: '/institutes', label: 'Institutes' },
  { to: '/colleges', label: 'Colleges' },
  { to: '/career-guidance', label: 'Career Guidance' },
  { to: '/abroad', label: 'Abroad' },
  { to: '/online-courses', label: 'Online' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const location = useLocation();
  const { user, logout, getToken } = useAuth();

  // The homepage opens on a dark full-bleed hero, so the bar starts light there.
  // All pages that open with a full-bleed dark hero need a light navbar.
  const HERO_ROUTES = ['/hostels', '/institutes', '/colleges', '/journal', '/abroad', '/online-courses'];
  const overHero = (location.pathname === '/' || HERO_ROUTES.includes(location.pathname)) && !scrolled;

  // Fetch wallet coins if user is logged in
  useEffect(() => {
    const fetchCoins = async () => {
      if (user && user.role === 'student') {
        try {
          const token = getToken();
          const response = await fetch(`${API_BASE_URL}/wallet/wallet`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setCoins(data.data?.coins ?? 0);
          }
        } catch (error) {
          console.error('Failed to fetch wallet:', error);
          setCoins(0);
        }
      }
    };
    fetchCoins();
  }, [user, getToken]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-40 transition-all duration-700 ease-editorial',
          scrolled
            ? 'border-b border-gold-500/20 bg-cream/90 py-0 backdrop-blur-xl'
            : 'border-b border-transparent py-3',
        )}
      >
        <div className="mx-auto flex h-[76px] w-full max-w-page items-center justify-between px-6 md:px-12">
          <Wordmark light={overHero} size={38} />

          <nav className="hidden items-center gap-8 xl:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'link-underline text-[12px] uppercase tracking-wide2 transition-colors duration-500',
                    isActive
                      ? 'text-gold-500'
                      : overHero
                        ? 'text-cream-100/80 hover:text-cream-100'
                        : 'text-ink-700 hover:text-night-800',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {/* Auth button */}
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                {user.role === 'student' && coins !== null && (
                  <button
                    onClick={() => setWalletModalOpen(true)}
                    className={cx(
                      'flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 transition-all duration-300 hover:scale-105 cursor-pointer',
                      overHero
                        ? 'border-gold-500/30 bg-gold-500/10 hover:border-gold-500/50 hover:bg-gold-500/20'
                        : 'border-gold-600/25 bg-gold-50 hover:border-gold-600/40 hover:bg-gold-100'
                    )}
                  >
                    <span className={cx(
                      'text-[13px] font-medium tabular-nums',
                      overHero ? 'text-gold-300' : 'text-gold-700'
                    )}>
                      {coins}
                    </span>
                    <span className={cx(
                      'text-[10px] uppercase tracking-wide',
                      overHero ? 'text-gold-400/80' : 'text-gold-600/70'
                    )}>
                      Coins
                    </span>
                  </button>
                )}
                <span className={cx('text-[12px] uppercase tracking-wide2', overHero ? 'text-cream-100/70' : 'text-ink-500')}>
                  {user.name.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={cx('text-[11px] uppercase tracking-overline transition-colors duration-300', overHero ? 'text-cream-100/50 hover:text-cream-100' : 'text-ink-400 hover:text-night-800')}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Magnetic strength={0.18}>
                <Link to="/login" className="hidden md:inline-block">
                  <Action variant={overHero ? 'light' : 'outline'} className="px-7 py-3">
                    Login
                  </Action>
                </Link>
              </Magnetic>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[7px] xl:hidden"
            >
              <span
                className={cx(
                  'h-px w-7 transition-all duration-500 ease-editorial',
                  open ? 'translate-y-[4px] rotate-45 bg-cream-100' : overHero ? 'bg-cream-100' : 'bg-night-800',
                )}
              />
              <span
                className={cx(
                  'h-px w-7 transition-all duration-500 ease-editorial',
                  open ? '-translate-y-[4px] -rotate-45 bg-cream-100' : overHero ? 'bg-cream-100' : 'bg-night-800',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen overlay menu. */}
      <div
        className={cx(
          'fixed inset-0 z-30 bg-night-900 transition-all duration-700 ease-editorial xl:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav className="flex h-full flex-col px-8 py-24 overflow-y-auto">
          {/* Logo at top */}
          <div className="mb-8 pb-6 border-b border-gold-500/15"
            style={{
              transform: open ? 'translateY(0)' : 'translateY(24px)',
              opacity: open ? 1 : 0,
              transition: 'transform 800ms cubic-bezier(0.22,1,0.36,1), opacity 800ms',
            }}
          >
            <Wordmark light={true} size={32} />
          </div>

          {/* Auth section at top - Login or User info */}
          <div className="mb-6"
            style={{
              transitionDelay: '70ms',
              transform: open ? 'translateY(0)' : 'translateY(24px)',
              opacity: open ? 1 : 0,
              transition: 'transform 800ms cubic-bezier(0.22,1,0.36,1), opacity 800ms',
            }}
          >
            {user ? (
              <div className="space-y-4">
                <div className="text-cream-100/70 text-sm">
                  Logged in as <span className="text-cream-100 font-medium">{user.name}</span>
                </div>
                {user.role === 'student' && coins !== null && (
                  <button
                    onClick={() => {
                      setWalletModalOpen(true);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 w-fit hover:bg-gold-500/20 hover:border-gold-500/50 transition-all"
                  >
                    <span className="text-gold-300 text-lg font-medium tabular-nums">
                      {coins}
                    </span>
                    <span className="text-gold-400/80 text-xs uppercase tracking-wide">
                      Coins
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="text-gold-400 hover:text-gold-300 text-sm uppercase tracking-wide transition-colors"
                >
                  Sign Out →
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="inline-block">
                <Action variant="light" className="px-8 py-3 text-base">
                  Login
                </Action>
              </Link>
            )}
          </div>

          {/* Navigation links */}
          <div className="border-t border-gold-500/15">
            {LINKS.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-6 border-b border-gold-500/15 py-5"
                style={{
                  transitionDelay: `${(i + 2) * 70}ms`,
                  transform: open ? 'translateY(0)' : 'translateY(24px)',
                  opacity: open ? 1 : 0,
                  transition: 'transform 800ms cubic-bezier(0.22,1,0.36,1), opacity 800ms',
                }}
              >
                <span className="folio">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[28px] text-cream-100 transition-colors duration-500 group-hover:text-gold-400">
                  {link.label}
                </span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Wallet Modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}
