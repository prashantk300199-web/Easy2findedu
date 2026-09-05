import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, FileText, Clock, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as draftService from '../services/instituteDraft.service';

export default function InstituteOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draftStatus, setDraftStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === 'institute_owner') {
      loadDraftStatus();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadDraftStatus = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraftStatus();

      if (response.success && response.data) {
        setDraftStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to load draft status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueEditing = () => {
    navigate('/institute-owner/register');
  };

  const handleStartNew = () => {
    navigate('/institute-owner/register');
  };

  const handleDeleteDraft = async () => {
    if (!confirm('Are you sure you want to delete your draft? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await draftService.deleteDraft();
      setDraftStatus(null);
      alert('Draft deleted successfully');
    } catch (err) {
      console.error('Failed to delete draft:', err);
      alert('Failed to delete draft');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = () => {
    if (!draftStatus) return null;

    switch (draftStatus.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-900/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
            <Clock className="w-4 h-4" />
            Draft
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
            <FileText className="w-4 h-4" />
            Under Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/20 text-green-400 rounded-full text-sm border border-green-500/30">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/20 text-red-400 rounded-full text-sm border border-red-500/30">
            <AlertCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cream-100 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-cream-100 mb-2">
            Institute Owner Dashboard
          </h1>
          <p className="text-cream-100/60">
            Welcome back, {user?.name || 'Institute Owner'}
          </p>
        </div>

        {/* Draft Status Card */}
        {draftStatus ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-night-800 border border-night-700 rounded-lg p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-cream-100 mb-2">
                  Your Institute Registration
                </h2>
                <p className="text-cream-100/60">
                  Continue where you left off
                </p>
              </div>
              {getStatusBadge()}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cream-100/70">Progress</span>
                <span className="text-sm font-semibold text-gold-400">
                  {draftStatus.completionPercentage || 0}%
                </span>
              </div>
              <div className="h-3 bg-night-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${draftStatus.completionPercentage || 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-night-900/50 border border-night-700 rounded-lg p-4">
                <p className="text-sm text-cream-100/60 mb-1">Current Step</p>
                <p className="text-lg font-semibold text-cream-100">
                  Step {draftStatus.currentStep || 1} of 11
                </p>
              </div>

              {draftStatus.lastSavedAt && (
                <div className="bg-night-900/50 border border-night-700 rounded-lg p-4">
                  <p className="text-sm text-cream-100/60 mb-1">Last Saved</p>
                  <p className="text-lg font-semibold text-cream-100">
                    {new Date(draftStatus.lastSavedAt).toLocaleDateString()} at{' '}
                    {new Date(draftStatus.lastSavedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {draftStatus.status === 'draft' && (
              <div className="flex gap-4">
                <button
                  onClick={handleContinueEditing}
                  className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 transition-all font-bold shadow-goldGlow flex items-center justify-center gap-2"
                >
                  <Edit size={20} />
                  Continue Editing
                </button>

                <button
                  onClick={handleDeleteDraft}
                  disabled={deleting}
                  className="px-6 py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-900/20 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={20} />
                  {deleting ? 'Deleting...' : 'Delete Draft'}
                </button>
              </div>
            )}

            {draftStatus.status === 'submitted' && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400">
                  Your institute registration is currently under review. We'll notify you once it's approved.
                </p>
              </div>
            )}

            {draftStatus.status === 'approved' && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400">
                  Congratulations! Your institute has been approved and is now live on our platform.
                </p>
              </div>
            )}

            {draftStatus.status === 'rejected' && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 mb-2">
                  Your institute registration was rejected. Please review the feedback and resubmit.
                </p>
                <button
                  onClick={handleContinueEditing}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Edit & Resubmit
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-night-800 border border-night-700 rounded-lg p-12 shadow-2xl text-center"
          >
            <FileText className="w-16 h-16 text-gold-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-cream-100 mb-3">
              No Registration Found
            </h2>
            <p className="text-cream-100/60 mb-6">
              Start registering your institute to get listed on our platform
            </p>
            <button
              onClick={handleStartNew}
              className="px-8 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 transition-all font-bold shadow-goldGlow inline-flex items-center gap-2"
            >
              <Edit size={20} />
              Start Registration
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
