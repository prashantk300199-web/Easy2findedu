import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ScheduleVisitProps {
  propertyId: string;
  propertyType: 'hostel' | 'college' | 'institute';
  propertyName: string;
}

export function ScheduleVisit({ propertyId, propertyType, propertyName }: ScheduleVisitProps) {
  const { user, getToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    studentPhone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('https://easytofindedu.onrender.com/api/v1/schedule-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          propertyId,
          propertyType,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 3000);
      } else {
        alert('Failed to schedule visit. Please try again.');
      }
    } catch (error) {
      alert('Failed to schedule visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="bg-night-800 hover:bg-gold-600 text-cream-100 px-6 py-3 text-sm font-medium transition-colors"
      >
        📅 Schedule a Visit
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-night-900/70 backdrop-blur-sm p-4"
            onClick={() => !submitting && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {success ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="font-display text-2xl text-night-800 mb-2">Visit Scheduled!</h3>
                  <p className="text-sm text-ink-500">We'll contact you soon to confirm the details.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl text-night-800 mb-2">Schedule a Visit</h3>
                  <p className="text-sm text-ink-500 mb-1">Property: <span className="font-medium text-night-800">{propertyName}</span></p>
                  <p className="text-sm text-ink-400 mb-6">Fill in your details below and we'll arrange your visit.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Full Name *</label>
                      <input
                        required
                        value={form.studentName}
                        onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                        className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.studentEmail}
                        onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                        className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Phone Number *</label>
                      <input
                        required
                        value={form.studentPhone}
                        onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                        className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Preferred Date *</label>
                        <input
                          required
                          type="date"
                          value={form.preferredDate}
                          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Preferred Time *</label>
                        <input
                          required
                          type="time"
                          value={form.preferredTime}
                          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                          className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1">Message (Optional)</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={3}
                        className="w-full border border-cream-300 bg-white text-night-800 px-4 py-3 focus:outline-none focus:border-gold-500"
                        placeholder="Any specific requirements or questions..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-gold-500 hover:bg-gold-600 text-night-900 py-3 font-medium transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Scheduling...' : 'Schedule Visit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={submitting}
                        className="px-6 py-3 border border-cream-300 text-ink-500 hover:bg-cream-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
