import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, AlertCircle, CheckCircle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as draftService from '../services/instituteDraft.service';
import Step1InstituteInfo from '../components/institute-registration/Step1InstituteInfo';
import Step2Category from '../components/institute-registration/Step2Category';
import Step3LocationContact from '../components/institute-registration/Step3LocationContact';
import Step4Courses from '../components/institute-registration/Step4Courses';
import Step5Batches from '../components/institute-registration/Step5Batches';
import Step6LearningExperience from '../components/institute-registration/Step6LearningExperience';
import Step7Facilities from '../components/institute-registration/Step7Facilities';
import Step8Faculty from '../components/institute-registration/Step8Faculty';
import Step9FeesScholarships from '../components/institute-registration/Step9FeesScholarships';
import Step10Admission from '../components/institute-registration/Step10Admission';
import Step11Career from '../components/institute-registration/Step11Career';
import Step12Results from '../components/institute-registration/Step12Results';
import Step13Gallery from '../components/institute-registration/Step13Gallery';
import Step14Verification from '../components/institute-registration/Step14Verification';

const TOTAL_STEPS = 14;
const AUTO_SAVE_DELAY = 30000; // 30 seconds

export default function InstituteRegistration() {
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

  // Load draft on mount
  useEffect(() => {
    if (user?.role === 'institute_owner') {
      loadDraft();
    } else {
      navigate('/login');
    }
  }, [user]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && !saving) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        performAutoSave();
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, saving, formData, currentStep]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadDraft = async () => {
    try {
      setLoading(true);
      const response = await draftService.getDraft();

      if (response.success && response.data) {
        const draft = response.data;

        // Restore form data
        const restoredData: any = {};
        if (draft.step1InstituteInfo) restoredData.step1 = draft.step1InstituteInfo;
        if (draft.step2Category) restoredData.step2 = draft.step2Category;
        if (draft.step3LocationContact) restoredData.step3 = draft.step3LocationContact;
        if (draft.step4Courses) restoredData.step4 = draft.step4Courses;
        if (draft.step5Batches) restoredData.step5 = draft.step5Batches;
        if (draft.step6LearningExperience) restoredData.step6 = draft.step6LearningExperience;
        if (draft.step7Facilities) restoredData.step7 = draft.step7Facilities;
        if (draft.step8Faculty) restoredData.step8 = draft.step8Faculty;
        if (draft.step9Fees) restoredData.step9 = draft.step9Fees;
        if (draft.step10Admission) restoredData.step10 = draft.step10Admission;
        if (draft.step11Career) restoredData.step11 = draft.step11Career;
        if (draft.step12Results) restoredData.step12 = draft.step12Results;
        if (draft.step13Gallery) restoredData.step13 = draft.step13Gallery;
        if (draft.step14Verification) restoredData.step14 = draft.step14Verification;

        setFormData(restoredData);
        setCurrentStep(draft.currentStep || 1);
        setCompletionPercentage(draft.completionPercentage || 0);
        setLastSaved(draft.lastSavedAt ? new Date(draft.lastSavedAt) : null);
        lastDataRef.current = restoredData;
      }
    } catch (err: any) {
      console.error('Failed to load draft:', err);
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

      const draftPayload = {
        currentStep,
        step1InstituteInfo: formData.step1 || null,
        step2Category: formData.step2 || null,
        step3LocationContact: formData.step3 || null,
        step4Courses: formData.step4 || null,
        step5Batches: formData.step5 || null,
        step6LearningExperience: formData.step6 || null,
        step7Facilities: formData.step7 || null,
        step8Faculty: formData.step8 || null,
        step9Fees: formData.step9 || null,
        step10Admission: formData.step10 || null,
        step11Career: formData.step11 || null,
        step12Results: formData.step12 || null,
        step13Gallery: formData.step13 || null,
        step14Verification: formData.step14 || null
      };

      const response = await draftService.saveDraft(draftPayload);

      if (response.success) {
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
      setError(err.response?.data?.message || 'Failed to save draft. Please try again.');
      throw err;
    } finally {
      if (showFeedback) setSaving(false);
    }
  };

  const handleNext = async (stepData: any) => {
    try {
      setSaving(true);
      setError(null);

      // Update form data
      const updatedData = {
        ...formData,
        [`step${currentStep}`]: stepData
      };
      setFormData(updatedData);

      // Save to backend
      const draftPayload = {
        currentStep: currentStep + 1,
        [`step${currentStep}InstituteInfo`]: currentStep === 1 ? stepData : formData.step1,
        [`step${currentStep}Category`]: currentStep === 2 ? stepData : formData.step2,
        [`step${currentStep}LocationContact`]: currentStep === 3 ? stepData : formData.step3,
        [`step${currentStep}Courses`]: currentStep === 4 ? stepData : formData.step4,
        [`step${currentStep}Facilities`]: currentStep === 5 ? stepData : formData.step5,
        [`step${currentStep}Faculty`]: currentStep === 6 ? stepData : formData.step6,
        [`step${currentStep}Fees`]: currentStep === 7 ? stepData : formData.step7,
        [`step${currentStep}Admission`]: currentStep === 8 ? stepData : formData.step8,
        [`step${currentStep}Career`]: currentStep === 9 ? stepData : formData.step9,
        [`step${currentStep}Gallery`]: currentStep === 10 ? stepData : formData.step10,
        [`step${currentStep}Verification`]: currentStep === 11 ? stepData : formData.step11
      };

      await draftService.saveDraft(draftPayload);

      // Move to next step
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        // Final submission
        await handleFinalSubmit();
      }

      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Failed to save and proceed:', err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async (stepData: any) => {
    try {
      // Update current step data
      const updatedData = {
        ...formData,
        [`step${currentStep}`]: stepData
      };
      setFormData(updatedData);

      await saveDraftData(true);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSaving(true);
      const response = await draftService.submitDraft();

      if (response.success) {
        alert('Registration submitted successfully! Your institute will be reviewed by our team.');
        navigate('/institute-owner/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to submit:', err);
      setError(err.response?.data?.message || 'Failed to submit registration');
    } finally {
      setSaving(false);
    }
  };

  const handleDataChange = (stepData: any) => {
    const updatedData = {
      ...formData,
      [`step${currentStep}`]: stepData
    };

    // Check if data actually changed
    const hasChanged = JSON.stringify(updatedData) !== JSON.stringify(lastDataRef.current);
    setHasUnsavedChanges(hasChanged);
    setFormData(updatedData);
  };

  const renderStep = () => {
    const stepProps = {
      data: formData[`step${currentStep}`],
      onNext: handleNext,
      onBack: handleBack,
      onSaveDraft: handleSaveDraft,
      loading: saving,
      onChange: handleDataChange
    };

    // For Step 5 (Batches), pass coursesData from Step 4
    if (currentStep === 5) {
      return <Step5Batches {...stepProps} coursesData={formData.step4} />;
    }

    switch (currentStep) {
      case 1: return <Step1InstituteInfo {...stepProps} />;
      case 2: return <Step2Category {...stepProps} />;
      case 3: return <Step3LocationContact {...stepProps} />;
      case 4: return <Step4Courses {...stepProps} />;
      case 5: return <Step5Batches {...stepProps} coursesData={formData.step4} />;
      case 6: return <Step6LearningExperience {...stepProps} />;
      case 7: return <Step7Facilities {...stepProps} />;
      case 8: return <Step8Faculty {...stepProps} />;
      case 9: return <Step9FeesScholarships {...stepProps} />;
      case 10: return <Step10Admission {...stepProps} />;
      case 11: return <Step11Career {...stepProps} />;
      case 12: return <Step12Results {...stepProps} />;
      case 13: return <Step13Gallery {...stepProps} />;
      case 14: return <Step14Verification {...stepProps} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
          <p className="text-cream-100 text-lg">Loading your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Save Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-4xl text-cream-100 mb-2">
                Institute Registration
              </h1>
              <p className="text-cream-100/60">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-4">
              {autoSaving && (
                <div className="flex items-center gap-2 text-gold-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}

              {saveSuccess && !autoSaving && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}

              {lastSaved && !autoSaving && !saveSuccess && (
                <div className="flex items-center gap-2 text-cream-100/60">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
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

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-night-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-cream-100/60 mt-1 text-right">
              {completionPercentage}% Complete
            </p>
          </div>
        </div>

        {/* Error Message */}
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
                onClick={() => saveDraftData(true)}
                className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
              >
                Retry saving
              </button>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
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
