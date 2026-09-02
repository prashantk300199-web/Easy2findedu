import { MapPin, Navigation } from 'lucide-react';
import { FormData, CITIES, AREAS_PATNA, SUBAREAS_PATNA } from '../../lib/hostelFormTypes';

interface Step2Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  handleLiveLocation: () => void;
  customInputs: {
    area: boolean;
    subarea: boolean;
    city: boolean;
    state: boolean;
  };
  setCustomInputs: (inputs: any) => void;
}

export function Step2AddressRent({ formData, setFormData, handleLiveLocation, customInputs, setCustomInputs }: Step2Props) {
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <MapPin /> Address & Rent
      </h2>

      {/* Address Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Address Line 1 *</label>
          <input
            type="text"
            value={formData.address.line1}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
            placeholder="Building, Street"
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Address Line 2</label>
          <input
            type="text"
            value={formData.address.line2}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
            placeholder="Landmark"
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
          />
        </div>

        {/* City with custom input option */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink-600">
            <span>City *</span>
            <button
              type="button"
              onClick={() => setCustomInputs((prev: any) => ({ ...prev, city: !prev.city }))}
              className="text-xs text-gold-700 hover:text-gold-800 underline"
            >
              {customInputs.city ? 'Use Dropdown' : 'Custom Input'}
            </button>
          </label>
          {customInputs.city ? (
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
              placeholder="Enter city"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            />
          ) : (
            <select
              value={formData.address.city}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Area with custom input option */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink-600">
            <span>Area *</span>
            <button
              type="button"
              onClick={() => setCustomInputs((prev: any) => ({ ...prev, area: !prev.area }))}
              className="text-xs text-gold-700 hover:text-gold-800 underline"
            >
              {customInputs.area ? 'Use Dropdown' : 'Custom Input'}
            </button>
          </label>
          {customInputs.area ? (
            <input
              type="text"
              value={formData.address.area}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, area: e.target.value } }))}
              placeholder="Enter area"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            />
          ) : (
            <select
              value={formData.address.area}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, area: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            >
              <option value="">Select Area</option>
              {AREAS_PATNA.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
        </div>

        {/* Subarea with custom input option */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink-600">
            <span>Subarea</span>
            <button
              type="button"
              onClick={() => setCustomInputs((prev: any) => ({ ...prev, subarea: !prev.subarea }))}
              className="text-xs text-gold-700 hover:text-gold-800 underline"
            >
              {customInputs.subarea ? 'Use Dropdown' : 'Custom Input'}
            </button>
          </label>
          {customInputs.subarea ? (
            <input
              type="text"
              value={formData.address.subarea}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, subarea: e.target.value } }))}
              placeholder="Enter subarea"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          ) : (
            <select
              value={formData.address.subarea}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, subarea: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            >
              <option value="">Select Subarea</option>
              {SUBAREAS_PATNA.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {/* State with custom input option */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink-600">
            <span>State *</span>
            <button
              type="button"
              onClick={() => setCustomInputs((prev: any) => ({ ...prev, state: !prev.state }))}
              className="text-xs text-gold-700 hover:text-gold-800 underline"
            >
              {customInputs.state ? 'Use Dropdown' : 'Custom Input'}
            </button>
          </label>
          {customInputs.state ? (
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
              placeholder="Enter state"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            />
          ) : (
            <select
              value={formData.address.state}
              onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              required
            >
              <option value="Bihar">Bihar</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink-600">Pincode *</label>
          <input
            type="text"
            value={formData.address.pincode}
            onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
            placeholder="800001"
            maxLength={6}
            className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            required
          />
        </div>
      </div>

      {/* Location Coordinates */}
      <div className="border-t border-cream-400 pt-6">
        <label className="mb-2 block text-sm font-semibold text-ink-600">Location Coordinates</label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleLiveLocation}
            className="flex items-center gap-2 rounded-xl bg-gold-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-800"
          >
            <Navigation size={18} /> Use Current Location (GPS)
          </button>
          <div className="rounded-xl bg-cream-50 p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-ink-600">Latitude:</span>
                <span className="font-mono text-ink">{formData.location.coordinates[1].toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink-600">Longitude:</span>
                <span className="font-mono text-ink">{formData.location.coordinates[0].toFixed(6)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-ink-600">
            💡 Tip: Click "Use Current Location" for accurate GPS coordinates, or manually set them if needed.
          </p>
        </div>
      </div>

      {/* Rent Details */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <h3 className="font-semibold text-ink">Rent Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Security Deposit Type *</label>
            <select
              value={formData.rent.security_deposit_type}
              onChange={(e) => setFormData(prev => ({ ...prev, rent: { ...prev.rent, security_deposit_type: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            >
              <option value="one_month_fee">One Month Fee</option>
              <option value="two_month_fee">Two Month Fee</option>
              <option value="three_month_fee">Three Month Fee</option>
              <option value="15_day_fee">15 Day Fee</option>
              <option value="no_deposit">No Deposit</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Registration Fee (₹)</label>
            <input
              type="number"
              value={formData.rent.registration_fee}
              onChange={(e) => setFormData(prev => ({ ...prev, rent: { ...prev.rent, registration_fee: parseInt(e.target.value) || 0 } }))}
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
