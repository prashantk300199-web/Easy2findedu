import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Step1InstituteInfo from '../components/institute-registration/Step1InstituteInfo';
import Step2Category from '../components/institute-registration/Step2Category';
import Step3LocationContact from '../components/institute-registration/Step3LocationContact';
import Step4Courses from '../components/institute-registration/Step4Courses';
import Step5Facilities from '../components/institute-registration/Step5Facilities';
import Step6Faculty from '../components/institute-registration/Step6Faculty';
import Step7FeesScholarships from '../components/institute-registration/Step7FeesScholarships';
import Step8Admission from '../components/institute-registration/Step8Admission';
import Step9Career from '../components/institute-registration/Step9Career';
import Step10Gallery from '../components/institute-registration/Step10Gallery';
import Step11Verification from '../components/institute-registration/Step11Verification';

const TOTAL_STEPS = 12;

interface DraftData {
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
  step7?: any;
  step8?: any;
  step9?: any;
  step10?: any;
  step11?: any;
  step12?: any;
  lastSaved?: string;
}

export default function InstituteRegistration() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DraftData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (user?.role === 'institute_owner') {
      loadDraft();
    }
  }, [user]);

  const loadDraft = async () => {
    try {
      const token = getToken();
      const res = await fetch('https://easytofindedu.onrender.com/api/v1/owner/institutes/draft', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setFormData(data.data.draftData || {});
          setCurrentStep(data.data.currentStep || 1);
        }
      }
    } catch (err) {
      console.log('No existing draft found');
    }
  };

  const saveDraft = async (step: number, stepData: any) => {
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      const formDataToSend = new FormData();
      formDataToSend.append('step', step.toString());
      formDataToSend.append('data', JSON.stringify(stepData));

      // Add files if present (Step 1)
      if (step === 1) {
        if (stepData.logoFile) {
          formDataToSend.append('logo', stepData.logoFile);
        }
        if (stepData.coverImageFile) {
          formDataToSend.append('coverImage', stepData.coverImageFile);
        }
      }

      const res = await fetch('https://easytofindedu.onrender.com/api/v1/owner/institutes/draft', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formDataToSend
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save draft');
      }

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        [`step${step}`]: stepData
      }));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async (stepData: any) => {
    try {
      await saveDraft(currentStep, stepData);
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error('Failed to save and proceed:', err);
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
      await saveDraft(currentStep, stepData);
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  if (!user || user.role !== 'institute_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only institute owners can register institutes.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register Your Institute</h1>
          <p className="text-gray-600 mt-2">Complete all steps to list your institute</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Navigation Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">Saving draft...</p>
          </div>
        )}

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <Step1InstituteInfo
              data={formData.step1}
              onNext={handleNext}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 2 && (
            <Step2Category
              data={formData.step2}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 3 && (
            <Step3LocationContact
              data={formData.step3}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 4 && (
            <Step4Courses
              data={formData.step4}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 5 && (
            <Step5Facilities
              data={formData.step5}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 6 && (
            <Step6Faculty
              data={formData.step6}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 7 && (
            <Step7FeesScholarships
              data={formData.step7}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 8 && (
            <Step8Admission
              data={formData.step8}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 9 && (
            <Step9Career
              data={formData.step9}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 10 && (
            <Step10Gallery
              data={formData.step10}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep === 11 && (
            <Step11Verification
              data={formData.step11}
              onNext={handleNext}
              onBack={handleBack}
              onSaveDraft={handleSaveDraft}
              loading={saving}
            />
          )}
          {currentStep > 11 && (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-4">Step {currentStep} - Coming Soon</h3>
              <p className="text-gray-600 mb-6">This step is under development.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => handleNext({})}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
