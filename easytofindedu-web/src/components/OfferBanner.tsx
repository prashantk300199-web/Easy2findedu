import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount?: string;
  imageUrl?: string;
  linkUrl?: string;
  validUntil?: string;
  isActive: boolean;
}

export function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (offers.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
      }, 5000); // Auto-slide every 5 seconds
      return () => clearInterval(timer);
    }
  }, [offers.length]);

  const fetchOffers = async () => {
    try {
      const response = await fetch('https://easytofindedu.onrender.com/api/v1/offers?isActive=true');
      const data = await response.json();
      if (data.success) {
        setOffers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  if (!isVisible || loading || offers.length === 0) return null;

  const currentOffer = offers[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-r from-gold-500 to-gold-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left Arrow */}
          {offers.length > 1 && (
            <button
              onClick={handlePrevious}
              className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Previous offer"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Offer Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentOffer._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex items-center justify-center gap-3 text-center"
            >
              {currentOffer.linkUrl ? (
                <Link
                  to={currentOffer.linkUrl}
                  className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <OfferContent offer={currentOffer} />
                </Link>
              ) : (
                <OfferContent offer={currentOffer} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right Arrow */}
          {offers.length > 1 && (
            <button
              onClick={handleNext}
              className="hidden sm:flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Next offer"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center w-6 h-6 text-white hover:bg-white/20 transition-colors"
            aria-label="Close offer banner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dots Indicator */}
        {offers.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OfferContent({ offer }: { offer: Offer }) {
  return (
    <>
      {offer.imageUrl && (
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="h-12 w-12 object-cover hidden sm:block"
        />
      )}
      <div className="flex-1">
        <p className="font-display text-lg font-bold text-white">
          {offer.discount && (
            <span className="inline-block bg-white text-gold-600 px-2 py-0.5 text-sm mr-2">
              {offer.discount}
            </span>
          )}
          {offer.title}
        </p>
        {offer.description && (
          <p className="text-sm text-white/90 mt-0.5 hidden sm:block">
            {offer.description}
          </p>
        )}
      </div>
    </>
  );
}
