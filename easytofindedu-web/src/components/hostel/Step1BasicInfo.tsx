import { Building2, UserCheck, PlusCircle, Trash2, Phone } from 'lucide-react';
import type { FormData, PhoneNumber } from '../../lib/hostelFormTypes';

interface Step1Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  addPhoneNumber: () => void;
  removePhoneNumber: (index: number) => void;
  updatePhoneNumber: (index: number, field: 'number' | 'label', value: string) => void;
}

export function Step1BasicInfo({ formData, setFormData, addPhoneNumber, removePhoneNumber, updatePhoneNumber }: Step1Props) {
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <Building2 /> Basic Information
      </h2>

      {/* Hostel Name */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-600">Hostel Display Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Sunrise Girls Hostel"
          className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
          required
        />
      </div>

      {/* Hostel Type */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-600">Hostel Type *</label>
        <select
          value={formData.hostel_type}
          onChange={(e) => setFormData(prev => ({ ...prev, hostel_type: e.target.value }))}
          className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
          required
        >
          <option value="women">Women's Hostel</option>
          <option value="men">Men's Hostel</option>
          <option value="co_living">Co-Living</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-600">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your hostel — facilities, environment, nearby landmarks..."
          rows={4}
          className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
          required
        />
      </div>

      {/* Notice Period & Total Beds */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Notice Period (Days) *</label>
          <input
            type="number"
            value={formData.notice_period_days}
            onChange={(e) => setFormData(prev => ({ ...prev, notice_period_days: parseInt(e.target.value) || 0 }))}
            min="0"
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Total Hostel Beds</label>
          <input
            type="number"
            value={formData.total_hostel_beds}
            disabled
            className="w-full rounded-xl border border-cream-400 bg-gray-100 px-4 py-3 text-ink-400 cursor-not-allowed"
            title="Auto-calculated from room configuration"
          />
          <p className="mt-1 text-xs text-ink-600">Auto-calculated from rooms</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Contact Information</h3>
          <button
            type="button"
            onClick={addPhoneNumber}
            className="flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-gold-800"
          >
            <PlusCircle size={16} /> Add Phone Number
          </button>
        </div>

        {/* Phone Numbers */}
        <div className="space-y-3">
          {formData.contact_info.phone_numbers.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex-1 grid gap-2 md:grid-cols-2">
                <input
                  type="text"
                  value={phone.label}
                  onChange={(e) => updatePhoneNumber(idx, 'label', e.target.value)}
                  placeholder="Label (e.g., Primary)"
                  className="rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                />
                <input
                  type="tel"
                  value={phone.number}
                  onChange={(e) => updatePhoneNumber(idx, 'number', e.target.value)}
                  placeholder="Phone number"
                  className="rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                  required={idx === 0}
                />
              </div>
              {formData.contact_info.phone_numbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhoneNumber(idx)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove phone number"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Email *</label>
          <input
            type="email"
            value={formData.contact_info.email}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, email: e.target.value } }))}
            placeholder="hostel@example.com"
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            required
          />
        </div>

        {/* Warden Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Name</label>
          <input
            type="text"
            value={formData.contact_info.warden_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_info: { ...prev.contact_info, warden_name: e.target.value } }))}
            placeholder="Warden name"
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
          />
        </div>
      </div>

      {/* Warden Details Section */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <UserCheck size={20} /> Warden Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Name</label>
            <input
              type="text"
              value={formData.warden.name}
              onChange={(e) => setFormData(prev => ({ ...prev, warden: { ...prev.warden, name: e.target.value } }))}
              placeholder="Full name"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Contact</label>
            <input
              type="tel"
              value={formData.warden.contact_number}
              onChange={(e) => setFormData(prev => ({ ...prev, warden: { ...prev.warden, contact_number: e.target.value } }))}
              placeholder="Contact number"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Email</label>
            <input
              type="email"
              value={formData.warden.email}
              onChange={(e) => setFormData(prev => ({ ...prev, warden: { ...prev.warden, email: e.target.value } }))}
              placeholder="Email address"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Gender</label>
            <select
              value={formData.warden.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, warden: { ...prev.warden, gender: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Warden Age</label>
            <input
              type="text"
              value={formData.warden.age}
              onChange={(e) => setFormData(prev => ({ ...prev, warden: { ...prev.warden, age: e.target.value } }))}
              placeholder="Age"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
        </div>
      </div>

      {/* Building Details */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <h3 className="font-semibold text-ink">Building Details</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Building Age (Years)</label>
            <input
              type="number"
              value={formData.building_details.building_age_years}
              onChange={(e) => setFormData(prev => ({ ...prev, building_details: { ...prev.building_details, building_age_years: parseInt(e.target.value) || 0 } }))}
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Number of Floors</label>
            <input
              type="number"
              value={formData.building_details.number_of_floors}
              onChange={(e) => setFormData(prev => ({ ...prev, building_details: { ...prev.building_details, number_of_floors: parseInt(e.target.value) || 1 } }))}
              min="1"
              placeholder="1"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Flooring Type</label>
            <select
              value={formData.building_details.flooring_type}
              onChange={(e) => setFormData(prev => ({ ...prev, building_details: { ...prev.building_details, flooring_type: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            >
              <option value="tiles">Tiles</option>
              <option value="marble">Marble</option>
              <option value="granite">Granite</option>
              <option value="mosaic">Mosaic</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
