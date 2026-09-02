import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Bed, Utensils, ShieldCheck, Camera,
  Trash2, Loader2, Navigation, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Save, UserCheck, Map, Clock,
  Gavel, Upload, X, PlusCircle, Phone
} from 'lucide-react';
import {
  AMENITIES, ROOM_TYPES, CITIES, AREAS_PATNA, SUBAREAS_PATNA,
  FormData, getInitialFormData, PhoneNumber
} from '../lib/hostelFormTypes';
import { Step1BasicInfo } from '../components/hostel/Step1BasicInfo';
import { Step2AddressRent } from '../components/hostel/Step2AddressRent';
import { Step3RoomsMeals } from '../components/hostel/Step3RoomsMeals';
import { Step4NearbyRules } from '../components/hostel/Step4NearbyRules';
import { Step5AmenitiesPhotos } from '../components/hostel/Step5AmenitiesPhotos';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.easytofindedu.com/api/v1';

export function AddHostelPage() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customRuleInput, setCustomRuleInput] = useState('');
  const [customInputs, setCustomInputs] = useState({
    area: false,
    subarea: false,
    city: false,
    state: false
  });

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Auto-calculate total hostel beds
  useEffect(() => {
    const totalBeds = formData.rooms.reduce((sum, room) => sum + room.total_beds, 0);
    if (totalBeds !== formData.total_hostel_beds) {
      setFormData(prev => ({ ...prev, total_hostel_beds: totalBeds }));
    }
  }, [formData.rooms]);

  const handleLiveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            location: { ...prev.location, coordinates: [pos.coords.longitude, pos.coords.latitude] }
          }));
        },
        () => setError("Location access denied.")
      );
    }
  };

  const compressImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = Math.round(width / ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          resolve(new File([blob], file.name, { type: blob.type }));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') img.src = reader.result; };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const incoming = Array.from(fileList);

    if (photos.length + incoming.length > 15) {
      setError('You can upload up to 15 photos.');
      return;
    }

    const badType = incoming.find(f => !f.type.startsWith('image/'));
    if (badType) {
      setError('Only image files are allowed.');
      return;
    }

    setError(null);

    try {
      const compressed = await Promise.all(incoming.map(f => compressImage(f)));
      const newPreviews = compressed.map(f => URL.createObjectURL(f));
      setPhotos(prev => [...prev, ...compressed]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (err) {
      setError('Failed to process images. Try smaller files.');
    }

    e.currentTarget.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMenuCardUpload = (index: number, file: File | null) => {
    const newMealPlans = [...formData.meal_plans];
    if (file) {
      newMealPlans[index].menu_file = file;
    } else {
      delete newMealPlans[index].menu_file;
    }
    setFormData(prev => ({ ...prev, meal_plans: newMealPlans }));
  };

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        phone_numbers: [...prev.contact_info.phone_numbers, { number: '', label: `Phone ${prev.contact_info.phone_numbers.length + 1}` }]
      }
    }));
  };

  const removePhoneNumber = (index: number) => {
    if (formData.contact_info.phone_numbers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        phone_numbers: prev.contact_info.phone_numbers.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePhoneNumber = (index: number, field: 'number' | 'label', value: string) => {
    const newPhones = [...formData.contact_info.phone_numbers];
    newPhones[index][field] = value;
    setFormData(prev => ({
      ...prev,
      contact_info: { ...prev.contact_info, phone_numbers: newPhones }
    }));
  };

  useEffect(() => {
    return () => { previews.forEach(u => URL.revokeObjectURL(u)); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 5) {
      setStep(prev => prev + 1);
      setError(null);
      window.scrollTo(0, 0);
      return;
    }

    if (!user) {
      setError('Authentication required.');
      setTimeout(() => navigate('/login'), 900);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);

    // Transform data for backend
    const transformedData = {
      ...formData,
      contact_info: {
        phone: formData.contact_info.phone_numbers[0]?.number || '',
        alternative_phone: formData.contact_info.phone_numbers[1]?.number || '',
        additional_phones: formData.contact_info.phone_numbers.slice(2).map(p => p.number).filter(Boolean),
        email: formData.contact_info.email,
        warden_name: formData.contact_info.warden_name
      },
      common_amenities: [
        ...formData.washroom_amenities,
        ...formData.utilities,
        ...formData.cleaning,
        ...formData.building_amenities
      ],
      nearby_distances: {
        institutes: formData.nearby_distances.institutes
          .filter(inst => inst.name.trim() !== '')
          .map(inst => ({
            name: inst.name,
            distance_km: inst.unit === 'm' ? inst.distance / 1000 : inst.distance
          })),
        landmarks: formData.nearby_distances.landmarks
          .filter(land => land.name.trim() !== '')
          .map(land => ({
            name: land.name,
            distance_km: land.unit === 'm' ? land.distance / 1000 : land.distance
          }))
      }
    };

    const data = new FormData();
    data.append('data', JSON.stringify(transformedData));
    photos.forEach((p) => data.append('photos[]', p));

    // Append menu cards
    formData.meal_plans.forEach((meal, index) => {
      if (meal.menu_file) {
        data.append(`menu_card_${index}`, meal.menu_file);
      }
    });

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/hostels`, {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const responseData = await response.json();

      if (!response.ok) {
        setErrorDetails({
          status: response.status,
          statusText: response.statusText,
          message: responseData.message || 'Failed to create hostel',
          errors: responseData.errors || null
        });
        throw new Error(responseData.message || 'Failed to create hostel');
      }

      setLoading(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  const toggleAmenity = (category: keyof Pick<FormData, 'in_room_amenities' | 'washroom_amenities' | 'utilities' | 'cleaning' | 'building_amenities' | 'recreation'>, key: string) => {
    setFormData(prev => {
      const currentList = prev[category];
      const newList = currentList.includes(key) ? currentList.filter(i => i !== key) : [...currentList, key];
      return { ...prev, [category]: newList };
    });
  };

  const addCustomRule = () => {
    if (customRuleInput.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: { ...prev.rules, custom_rules: [...prev.rules.custom_rules, customRuleInput.trim()] }
      }));
      setCustomRuleInput('');
    }
  };

  const removeCustomRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: { ...prev.rules, custom_rules: prev.rules.custom_rules.filter((_, i) => i !== index) }
    }));
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"
        >
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h2 className="mb-2 font-display text-2xl text-ink">Hostel Created Successfully!</h2>
          <p className="mb-6 text-ink-600">Your hostel has been submitted for admin review and will be published after approval.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-gold-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-gold-800"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 p-4 pb-32 md:p-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-ink-600 transition-colors hover:text-ink"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
          <h1 className="font-display text-3xl text-ink md:text-4xl">Add New Hostel</h1>
          <p className="mt-2 text-ink-600">
            Step {step} of 5 - {['Basic Info', 'Address & Rent', 'Rooms & Meals', 'Nearby & Rules', 'Amenities & Photos'][step - 1]}
          </p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${s <= step ? 'bg-gold-700' : 'bg-cream-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {errorDetails && (
                  <button
                    type="button"
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="mt-2 text-sm underline hover:text-red-800"
                  >
                    {showErrorDetails ? 'Hide' : 'Show'} Error Details
                  </button>
                )}
              </div>
            </div>
            {showErrorDetails && errorDetails && (
              <div className="rounded-xl bg-gray-900 p-4 font-mono text-xs text-gray-100 overflow-auto max-h-96">
                <div className="space-y-2">
                  <div className="text-blue-400 font-bold">🔴 Backend Error Details</div>
                  {errorDetails.status && (
                    <div className="text-yellow-300">
                      Status: <span className="text-white">{errorDetails.status} {errorDetails.statusText}</span>
                    </div>
                  )}
                  {errorDetails.message && (
                    <div className="text-orange-300">
                      Message: <span className="text-white break-words">{errorDetails.message}</span>
                    </div>
                  )}
                  {errorDetails.errors && (
                    <div className="text-red-300">
                      <div className="font-bold">Validation Errors:</div>
                      <pre className="mt-2 text-white whitespace-pre-wrap">{JSON.stringify(errorDetails.errors, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-lg md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step1BasicInfo
                  formData={formData}
                  setFormData={setFormData}
                  addPhoneNumber={addPhoneNumber}
                  removePhoneNumber={removePhoneNumber}
                  updatePhoneNumber={updatePhoneNumber}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step2AddressRent
                  formData={formData}
                  setFormData={setFormData}
                  handleLiveLocation={handleLiveLocation}
                  customInputs={customInputs}
                  setCustomInputs={setCustomInputs}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step3RoomsMeals
                  formData={formData}
                  setFormData={setFormData}
                  handleMenuCardUpload={handleMenuCardUpload}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step4NearbyRules
                  formData={formData}
                  setFormData={setFormData}
                  customRuleInput={customRuleInput}
                  setCustomRuleInput={setCustomRuleInput}
                  addCustomRule={addCustomRule}
                  removeCustomRule={removeCustomRule}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Step5AmenitiesPhotos
                  formData={formData}
                  setFormData={setFormData}
                  toggleAmenity={toggleAmenity}
                  photos={photos}
                  previews={previews}
                  handleFilesSelected={handleFilesSelected}
                  removePhoto={removePhoto}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-cream-400 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep(prev => prev - 1); setError(null); window.scrollTo(0, 0); }}
                className="flex items-center gap-2 rounded-full bg-cream-400 px-6 py-3 font-semibold text-ink transition-colors hover:bg-cream-500"
              >
                <ChevronLeft size={18} /> Previous
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-auto flex items-center gap-2 rounded-full bg-gold-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Submitting...
                </>
              ) : step < 5 ? (
                <>
                  Next <ChevronRight size={18} />
                </>
              ) : (
                <>
                  <Save size={18} /> Submit Hostel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
