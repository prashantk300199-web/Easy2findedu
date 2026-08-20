import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/hostels', label: 'Hostels', icon: '⌂' },
  { to: '/institutes', label: 'Institutes', icon: '⚐' },
  { to: '/colleges', label: 'Colleges', icon: '▣' },
  { to: '/career-guidance', label: 'Career', icon: '◈' },
  { to: '/abroad', label: 'Abroad', icon: '✦' },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-night-900 border-t border-gold-500/20 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-1 px-3 py-2 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gold-500/10 rounded-lg"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span
                className={`text-[10px] font-medium relative z-10 truncate max-w-full ${
                  isActive ? 'text-gold-400' : 'text-cream-100/65'
                }`}
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
