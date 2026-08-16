import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
  link?: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=600&fit=crop',
    title: 'Special Offer: 50% Off on Registration',
    description: 'Get 50% discount on hostel registration fees this month!',
    link: '/hostels'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=600&fit=crop',
    title: 'New Premium Hostels Added',
    description: 'Explore our latest verified premium hostels with modern amenities',
    link: '/hostels'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=600&fit=crop',
    title: 'Find Your Perfect College',
    description: 'Discover top colleges and institutes across India',
    link: '/colleges'
  }
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[500px] overflow-hidden bg-night-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night-900/90 to-night-900/40" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-7xl px-6 lg:px-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl"
              >
                <h2 className="font-display text-5xl text-cream-100 mb-4">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xl text-cream-100/80 mb-8">
                  {slides[currentSlide].description}
                </p>
                {slides[currentSlide].link && (
                  <a
                    href={slides[currentSlide].link}
                    className="inline-block bg-gold-500 hover:bg-gold-600 text-night-900 px-8 py-4 font-medium transition-colors"
                  >
                    Explore Now →
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-12 bg-gold-500' : 'w-2 bg-cream-100/40 hover:bg-cream-100/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-cream-100/10 hover:bg-cream-100/20 backdrop-blur-sm text-cream-100 p-4 transition-colors z-10"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-cream-100/10 hover:bg-cream-100/20 backdrop-blur-sm text-cream-100 p-4 transition-colors z-10"
        aria-label="Next slide"
      >
        →
      </button>
    </div>
  );
}
