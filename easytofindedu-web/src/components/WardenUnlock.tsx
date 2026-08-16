import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface WardenDetails {
  name?: string;
  contact_number?: string;
}

interface WardenUnlockProps {
  hostelId: string;
  warden: WardenDetails;
}

export function WardenUnlock({ hostelId, warden }: WardenUnlockProps) {
  const { user, getToken } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', purpose: '' });

  const handleUnlock = () => {
    if (!user) {
      alert('Please login to view warden details');
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      await fetch(`https://easytofindedu.onrender.com/api/v1/hostels/${hostelId}/warden-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setUnlocked(true);
    } catch {
      setUnlocked(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!warden.name && !warden.contact_number) return null;

  return (
    <div className="mt-8 border border-cream-300 bg-cream-50 p-6" onClick={(e) => e.stopPropagation()}>
      <p className="overline text-gold-700 mb-4">Warden Details</p>

      {unlocked ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {warden.name && (
            <div className="flex items-center gap-3">
              <span className="text-ink-400 text-sm w-20">Name</span>
              <span className="font-medium text-night-800">{warden.name}</span>
            </div>
          )}
          {warden.contact_number && (
            <div className="flex items-center gap-3">
              <span className="text-ink-400 text-sm w-20">Contact</span>
              <a href={`tel:${warden.contact_number}`} className="font-medium text-gold-700 hover:text-gold-800">
                {warden.contact_number}
              </a>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="relative">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-ink-400 text-sm w-20">Name</span>
              <span className="font-medium text-night-800">{warden.name || 'Hidden Name'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-ink-400 text-sm w-20">Contact</span>
              <span className="font-medium text-night-800">+91 XXXXXXXXXX</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-ink-500 mb-3">
              🔒 Warden details are hidden to protect resident privacy
            </p>
            <button
              onClick={handleUnlock}
              className="bg-gold-500 hover:bg-gold-600 text-night-900 px-6 py-3 text-sm font-medium transition-colors"
            >
              🔓 Unlock Warden Details
            </button>
          </div>
        </div>
      )}

      {/* Unlock Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-night-900/70 backdrop-blur-sm p-4"
            style={{ pointerEvents: 'all' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl text-night-800 mb-2">Unlock Warden Details</h3>
              <p className="text-sm text-ink-500 mb-6">Please share your basic details to access warden contact information.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Phone Number *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Purpose</label>
                  <input
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                    placeholder="e.g. Hostel admission enquiry"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-night-900 py-3 font-medium transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'View Warden Details'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-cream-300 text-ink-500 hover:bg-cream-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
