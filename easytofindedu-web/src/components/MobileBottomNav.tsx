import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/hostels', label: 'Hostels', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  )},
  { to: '/institutes', label: 'Institutes', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20M4 19.5v-15A2.5 2.5 0 016.5 2H18a2 2 0 012 2v12.5M20 17h2m-2 5h2M9 9h.01M9 13h.01M13 9h.01M13 13h.01" />
    </svg>
  )},
  { to: '/colleges', label: 'Colleges', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )},
  { to: '/career-guidance', label: 'Career', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-4V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5zm6 13h-2v-3h-4v3H8v-5h8v5z" />
    </svg>
  )},
  { to: '/abroad', label: 'Abroad', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0 0V2m0 20c2.761 0 5-4.477 5-10S14.761 2 12 2m0 20c-2.761 0-5-4.477-5-10S9.239 2 12 2M2 12h20" />
    </svg>
  )},
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-night-900/95 backdrop-blur-lg border-t border-gold-500/30 md:hidden shadow-2xl">
      <div className="flex items-center justify-around px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-1.5 px-3 py-1.5 min-w-0 flex-1 transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-t from-gold-500/20 to-gold-500/5 rounded-xl border border-gold-500/30"
                  transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
                />
              )}
              <motion.div
                className={`relative z-10 ${isActive ? 'text-gold-400' : 'text-cream-100/60'}`}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              <span
                className={`text-[10px] font-semibold relative z-10 truncate max-w-full tracking-wide ${
                  isActive ? 'text-gold-400' : 'text-cream-100/50'
                }`}
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
