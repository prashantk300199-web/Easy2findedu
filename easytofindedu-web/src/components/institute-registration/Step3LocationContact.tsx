import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

interface Step3Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

export default function Step3LocationContact({ data, onNext, onBack, onSaveDraft, loading }: Step3Props) {
  const [formData, setFormData] = useState({
    phone: data?.phone || '',
    email: data?.email || '',
    address: data?.address || '',
    area: data?.area || '',
    landmark: data?.landmark || '',
    city: data?.city || '',
    district: data?.district || '',
    state: data?.state || 'Bihar',
    pinCode: data?.pinCode || '',
    latitude: data?.latitude || '',
    longitude: data?.longitude || ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePinCode = (pinCode: string) => {
    const pinCodeRegex = /^\d{6}$/;
    return pinCodeRegex.test(pinCode);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Complete address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!validatePinCode(formData.pinCode)) {
      newErrors.pinCode = 'Enter a valid 6-digit PIN code';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Google Maps location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          if (errors.location) {
            setErrors((prev: any) => ({ ...prev, location: '' }));
          }
        },
        (error) => {
          setErrors((prev: any) => ({
            ...prev,
            location: 'Unable to get location. Please enter manually.'
          }));
        }
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        location: 'Geolocation is not supported by your browser'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        contact: {
          phone: formData.phone,
          email: formData.email
        },
        location: {
          address: formData.address,
          area: formData.area,
          landmark: formData.landmark,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pinCode: formData.pinCode,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        }
      });
    }
  };

  const handleSave = () => {
    onSaveDraft({
      contact: {
        phone: formData.phone,
        email: formData.email
      },
      location: {
        address: formData.address,
        area: formData.area,
        landmark: formData.landmark,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pinCode: formData.pinCode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      }
    });
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-cream-100 mb-2">Location & Contact</h2>
      <p className="text-cream-100/60 mb-8">Provide your institute's contact information and location</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div className="border-b border-night-700 pb-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <Phone size={20} className="text-gold-400" />
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Official Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Official Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@institute.com"
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-b border-night-700 pb-8">
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-gold-400" />
            Address Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cream-100 mb-2">
                Complete Address <span className="text-red-400">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Building number, street name, etc."
                className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                  errors.address ? 'border-red-500' : 'border-night-700'
                }`}
              />
              {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  Area / Locality
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="E.g., Boring Road"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Near famous location"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="E.g., Patna"
                  className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                    errors.city ? 'border-red-500' : 'border-night-700'
                  }`}
                />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="E.g., Patna"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                    errors.state ? 'border-red-500' : 'border-night-700'
                  }`}
                >
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  PIN Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  className={`w-full px-4 py-3 bg-night-900 border rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                    errors.pinCode ? 'border-red-500' : 'border-night-700'
                  }`}
                />
                {errors.pinCode && <p className="text-red-400 text-sm mt-1">{errors.pinCode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Location */}
        <div>
          <h3 className="text-xl font-semibold text-cream-100 mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-gold-400" />
            Google Maps Location <span className="text-red-400">*</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="E.g., 25.5941"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cream-100 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="E.g., 85.1376"
                  className="w-full px-4 py-3 bg-night-900 border border-night-700 rounded-lg text-cream-100 placeholder:text-cream-100/40 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2 font-semibold transition-all shadow-lg"
            >
              <MapPin size={18} />
              Get Current Location
            </button>

            {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}

            <p className="text-sm text-cream-100/50">
              Click the button above to automatically detect your location, or enter coordinates manually.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 border border-night-700 text-cream-100 rounded-lg hover:bg-night-700 disabled:opacity-50 transition-all font-semibold"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gold-500 text-night-900 rounded-lg hover:bg-gold-400 disabled:opacity-50 transition-all font-bold shadow-goldGlow"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
