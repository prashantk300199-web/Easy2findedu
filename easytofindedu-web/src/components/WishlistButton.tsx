import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  itemId: string;
  itemType: 'hostel' | 'college' | 'institute';
  compact?: boolean;
}

export function WishlistButton({ itemId, itemType: _itemType, compact = false }: WishlistButtonProps) {
  const { user, getToken } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, itemId]);

  const checkWishlistStatus = async () => {
    try {
      const token = getToken();
      const res = await fetch(`https://easytofindedu.onrender.com/api/v1/student/auth/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: any[] = data.wishlist ?? data.data?.wishlist ?? [];
      setIsWishlisted(list.some((w: any) => (w._id ?? w) === itemId));
    } catch {
      // silently fail
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to add to wishlist');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`https://easytofindedu.onrender.com/api/v1/student/auth/wishlist/${itemId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Wishlist error:', err);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={toggleWishlist}
        disabled={loading}
        className={`p-2 transition-all ${
          isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleWishlist}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 border transition-all duration-300 ${
        isWishlisted
          ? 'bg-red-50 border-red-300 text-red-600'
          : 'bg-cream-50 border-cream-300 text-night-800 hover:border-gold-400 hover:bg-gold-50'
      }`}
    >
      <span className="text-xl">{isWishlisted ? '❤️' : '🤍'}</span>
      <span className="text-sm font-sans tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
      </span>
    </motion.button>
  );
}

// Wishlist Page Component
export function WishlistPage() {
  const { user, getToken } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const token = getToken();
      const res = await fetch('https://easytofindedu.onrender.com/api/v1/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-500">Please login to view your wishlist</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl text-night-800 mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl text-ink-500 mb-4">Your wishlist is empty</p>
          <p className="text-ink-400">Start adding hostels, colleges, and institutes to your wishlist!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div key={item._id} className="border border-cream-300 bg-white p-6">
              <h3 className="font-display text-xl text-night-800 mb-2">{item.name}</h3>
              <p className="text-sm text-ink-500 mb-4">{item.type}</p>
              <a
                href={`/${item.type}s/${item._id}`}
                className="text-gold-600 hover:text-gold-700 text-sm font-medium"
              >
                View Details →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
