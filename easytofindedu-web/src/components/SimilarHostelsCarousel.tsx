import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Hostel } from '../lib/types';
import { imageUrl, rentFrom, inr, hostelPlace } from '../lib/format';
import { Figure } from './Figure';

interface SimilarHostelsCarouselProps {
  hostels: Hostel[];
  currentHostelId: string;
}

export function SimilarHostelsCarousel({ hostels, currentHostelId }: SimilarHostelsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const similarHostels = hostels
    .filter(h => h._id !== currentHostelId)
    .slice(0, 10);

  if (similarHostels.length === 0) return null;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320; // Card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="border-t border-cream-300 pt-12 mt-16 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-night-800">Similar Hostels</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 border transition-colors ${
              canScrollLeft
                ? 'border-night-800 text-night-800 hover:bg-night-800 hover:text-cream-100'
                : 'border-cream-300 text-cream-300 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 border transition-colors ${
              canScrollRight
                ? 'border-night-800 text-night-800 hover:bg-night-800 hover:text-cream-100'
                : 'border-cream-300 text-cream-300 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-scroll scrollbar-hide pb-4 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {similarHostels.map((hostel) => (
          <SimilarHostelCard key={hostel._id} hostel={hostel} />
        ))}
      </div>
    </div>
  );
}

function SimilarHostelCard({ hostel }: { hostel: Hostel }) {
  const rent = rentFrom(hostel);

  return (
    <Link
      to={`/hostels/${hostel.slug}`}
      className="group flex-shrink-0 w-[300px] border border-cream-300 bg-white hover:shadow-lg transition-shadow duration-300"
    >
      <div className="h-48 overflow-hidden">
        <Figure
          src={imageUrl(hostel.photos?.[0])}
          alt={hostel.name}
          name={hostel.name}
          ratio="aspect-[4/3]"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-night-800 group-hover:text-gold-700 transition-colors duration-300 line-clamp-2">
          {hostel.name}
        </h3>
        <p className="mt-1 text-xs text-ink-500">{hostelPlace(hostel)}</p>

        {rent && (
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-xl text-gold-700">{inr.format(rent)}</span>
            <span className="text-xs text-ink-400">/month</span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {hostel.hostel_type && (
            <span className="text-[9px] uppercase tracking-wide px-2 py-1 bg-cream-100 text-ink-500 border border-cream-300">
              {hostel.hostel_type === 'girls' ? 'Girls' : hostel.hostel_type === 'boys' ? 'Boys' : 'Co-ed'}
            </span>
          )}
          {hostel.total_hostel_beds && (
            <span className="text-[9px] uppercase tracking-wide px-2 py-1 bg-cream-100 text-ink-500 border border-cream-300">
              {hostel.total_hostel_beds} Beds
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
