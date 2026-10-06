import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, AlertCircle, CheckCircle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as draftService from '../services/collegeDraft.service';
import Step1BasicInfo from '../components/college-registration/Step1BasicInfo';
import Step2Location from '../components/college-registration/Step2Location';
import Step3Affiliation from '../components/college-registration/Step3Affiliation';
import Step4Courses from '../components/college-registration/Step4Courses';
import Step5AdmissionFees from '../components/college-registration/Step5AdmissionFees';
import Step6Facilities from '../components/college-registration/Step6Facilities';
import Step7Hostel from '../components/college-registration/Step7Hostel';
import Step8Placements from '../components/college-registration/Step8Placements';
import Step9Scholarships from '../components/college-registration/Step9Scholarships';
import Step10Gallery from '../components/college-registration/Step10Gallery';
import Step11Documents from '../components/college-registration/Step11Documents';
import Step12Review from '../components/college-registration/Step12Review';

const TOTAL_STEPS = 12;
const AUTO_SAVE_DELAY = 30000;

export default function CollegeOwnerRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDataRef = useRef<any>(null);

  useEffect(() => {
    if (user?.role === 'college_owner') {
      loadDraft();
    } else {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    if (hasUnsavedChanges && !saving) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => performAutoSave(), AUTO_SAVE_DELAY);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [hasUnsavedChanges, saving, formData, currentStep]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraft();

      if (response?.success && response.data) {
        const draft = response.data;

        const restored: any = {};
        if (draft.step1BasicInfo) restored.step1 = draft.step1BasicInfo;
        if (draft.step2Location) restored.step2 = draft.step2Location;
        if (draft.step3Affiliation) restored.step3 = draft.step3Affiliation;
        if (draft.step4Courses) restored.step4 = draft.step4Courses;
        if (draft.step5AdmissionFees) restored.step5 = draft.step5AdmissionFees;
        if (draft.step6Facilities) restored.step6 = draft.step6Facilities;
        if (draft.step7Hostel) restored.step7 = draft.step7Hostel;
        if (draft.step8Placements) restored.step8 = draft.step8Placements;
        if (draft.step9Scholarships) restored.step9 = draft.step9Scholarships;
        if (draft.step10Gallery) restored.step10 = draft.step10Gallery;
        if (draft.step11Documents) restored.step11 = draft.step11Documents;

        setFormData(restored);
        setCurrentStep(draft.currentStep || 1);
        setCompletionPercentage(draft.completionPercentage || 0);
        setLastSaved(draft.lastSavedAt ? new Date(draft.lastSavedAt) : null);
        lastDataRef.current = restored;
      }
    } catch (err: any) {
      console.error('Failed to load college draft:', err);
      setError('Failed to load saved data');
    } finally {
      setLoading(false);
    }
  };

  const performAutoSave = async () => {
    if (saving || autoSaving) return;
    try {
      setAutoSaving(true);
      await saveDraftData(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveDraftData = async (showFeedback = true) => {
    try {
      if (showFeedback) setSaving(true);
      setError(null);

      const payload = {
        currentStep,
        step1BasicInfo: formData.step1 || null,
        step2Location: formData.step2 || null,
        step3Affiliation: formData.step3 || null,
        step4Courses: formData.step4 || null,
        step5AdmissionFees: formData.step5 || null,
        step6Facilities: formData.step6 || null,
        step7Hostel: formData.step7 || null,
        step8Placements: formData.step8 || null,
        step9Scholarships: formData.step9 || null,
        step10Gallery: formData.step10 || null,
        step11Documents: formData.step11 || null,
      };

      const response = await draftService.saveDraft(payload);
      if (response?.success) {
        setLastSaved(new Date());
        setCompletionPercentage(response.data.completionPercentage || 0);
        lastDataRef.current = { ...formData };
        if (showFeedback) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      }
    } catch (err: any) {
      console.error('Save draft error:', err);
      setError(err?.response?.data?.message || 'Failed to save draft. Please try again.');
      throw err;
    } finally {
      if (showFeedback) setSaving(false);
    }
  };

  const handleNext = async (stepData: any) => {
    try {
      setSaving(true);
      setError(null);

      const updated = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updated);

      const payload = {
        currentStep: currentStep + 1,
        step1BasicInfo: currentStep === 1 ? stepData : formData.step1,
        step2Location: currentStep === 2 ? stepData : formData.step2,
        step3Affiliation: currentStep === 3 ? stepData : formData.step3,
        step4Courses: currentStep === 4 ? stepData : formData.step4,
        step5AdmissionFees: currentStep === 5 ? stepData : formData.step5,
        step6Facilities: currentStep === 6 ? stepData : formData.step6,
        step7Hostel: currentStep === 7 ? stepData : formData.step7,
        step8Placements: currentStep === 8 ? stepData : formData.step8,
        step9Scholarships: currentStep === 9 ? stepData : formData.step9,
        step10Gallery: currentStep === 10 ? stepData : formData.step10,
        step11Documents: currentStep === 11 ? stepData : formData.step11,
      };

      await draftService.saveDraft(payload);
      setHasUnsavedChanges(false);

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((p) => p + 1);
        window.scrollTo(0, 0);
      } else {
        await handleFinalSubmit();
      }
    } catch (err: any) {
      console.error('Failed to save and proceed:', err);
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async (stepData: any) => {
    try {
      const updated = { ...formData, [`step${currentStep}`]: stepData };
      setFormData(updated);
      await saveDraftData(true);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSaving(true);
      const response = await draftService.submitDraft();
      if (response?.success) {
        alert('Registration submitted successfully! Your college will be reviewed by our team.');
        navigate('/college-dashboard');
      }
    } catch (err: any) {
      console.error('Failed to submit:', err);
      setError(err?.response?.data?.message || 'Failed to submit registration');
    } finally {
      setSaving(false);
    }
  };

  const handleDataChange = (stepData: any) => {
    const updated = { ...formData, [`step${currentStep}`]: stepData };
    const hasChanged = JSON.stringify(updated) !== JSON.stringify(lastDataRef.current);
    setHasUnsavedChanges(hasChanged);
    setFormData(updated);
  };

  const renderStep = () => {
    const props = {
      data: formData[`step${currentStep}`],
      onNext: handleNext,
      onBack: handleBack,
      onSaveDraft: handleSaveDraft,
      loading: saving,
      onChange: handleDataChange,
    };

    switch (currentStep) {
      case 1: return <Step1BasicInfo {...props} />;
      case 2: return <Step2Location {...props} />;
      case 3: return <Step3Affiliation {...props} />;
      case 4: return <Step4Courses {...props} />;
      case 5: return <Step5AdmissionFees {...props} />;
      case 6: return <Step6Facilities {...props} />;
      case 7: return <Step7Hostel {...props} />;
      case 8: return <Step8Placements {...props} />;
      case 9: return <Step9Scholarships {...props} />;
      case 10: return <Step10Gallery {...props} />;
      case 11: return <Step11Documents {...props} />;
      case 12: return <Step12Review {...props} formData={formData} onEdit={(s) => setCurrentStep(s)} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-cream-100 text-lg">Loading your college onboarding…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 text-white"
      style={{ backgroundColor: '#050912' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h1
                className="text-4xl font-semibold mb-2"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#FBF8F2' }}
              >
                College Onboarding
              </h1>
              <p className="text-sm" style={{ color: 'rgba(251, 248, 242, 0.7)' }}>
                Step {currentStep} of {TOTAL_STEPS}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {autoSaving && (
                <div className="flex items-center gap-2" style={{ color: '#C9A96A' }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Auto-saving…</span>
                </div>
              )}
              {saveSuccess && !autoSaving && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {lastSaved && !autoSaving && !saveSuccess && (
                <div className="flex items-center gap-2" style={{ color: 'rgba(251, 248, 242, 0.7)' }}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Last saved: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              {hasUnsavedChanges && !autoSaving && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#070C18' }}>
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(to right, #C9A96A, #D9C08E)' }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs mt-1 text-right" style={{ color: 'rgba(251, 248, 242, 0.7)' }}>
              {completionPercentage}% Complete
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => saveDraftData(true)}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Retry saving
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
}