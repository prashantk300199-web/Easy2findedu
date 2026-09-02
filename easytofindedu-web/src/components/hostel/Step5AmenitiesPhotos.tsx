import { Camera, Gavel, Upload, Trash2 } from 'lucide-react';
import type { FormData } from '../../lib/hostelFormTypes';
import { AMENITIES } from '../../lib/hostelFormTypes';

interface Step5Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  toggleAmenity: (category: keyof Pick<FormData, 'in_room_amenities' | 'washroom_amenities' | 'utilities' | 'cleaning' | 'building_amenities' | 'recreation'>, key: string) => void;
  photos: File[];
  previews: string[];
  handleFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
}

export function Step5AmenitiesPhotos({ formData, setFormData, toggleAmenity, photos, previews, handleFilesSelected, removePhoto }: Step5Props) {
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <Camera /> Amenities & Photos
      </h2>

      {/* Amenities */}
      <div className="space-y-6">
        {/* In-Room Amenities */}
        <div>
          <h3 className="mb-4 font-semibold text-ink">🛏️ In-Room Amenities</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.room.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('in_room_amenities', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.in_room_amenities.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Washroom Amenities */}
        <div className="border-t border-cream-400 pt-6">
          <h3 className="mb-4 font-semibold text-ink">🚿 Washroom Amenities</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.washroom.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('washroom_amenities', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.washroom_amenities.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div className="border-t border-cream-400 pt-6">
          <h3 className="mb-4 font-semibold text-ink">⚡ Utilities</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.utilities.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('utilities', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.utilities.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cleaning */}
        <div className="border-t border-cream-400 pt-6">
          <h3 className="mb-4 font-semibold text-ink">🧹 Cleaning Services</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.cleaning.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('cleaning', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.cleaning.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Amenities */}
        <div className="border-t border-cream-400 pt-6">
          <h3 className="mb-4 font-semibold text-ink">🏢 Building Amenities</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.building.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('building_amenities', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.building_amenities.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recreation */}
        <div className="border-t border-cream-400 pt-6">
          <h3 className="mb-4 font-semibold text-ink">🎮 Recreation</h3>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.recreation.map(am => (
              <div
                key={am.key}
                onClick={() => toggleAmenity('recreation', am.key)}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  formData.recreation.includes(am.key)
                    ? 'border-gold-700 bg-gold-50 shadow-sm'
                    : 'border-cream-400 bg-white hover:border-gold-400'
                }`}
              >
                <div className="text-sm font-semibold text-ink">{am.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Washroom & Laundry Details */}
      <div className="grid gap-6 border-t border-cream-400 pt-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold text-ink">🚽 Washroom Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-600">Total Washrooms</label>
              <input
                type="number"
                value={formData.washroom_details.total_washrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, washroom_details: { ...prev.washroom_details, total_washrooms: parseInt(e.target.value) || 0 } }))}
                min="0"
                className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-600">Washroom:Student Ratio</label>
              <input
                type="text"
                value={formData.washroom_details.washroom_to_student_ratio}
                onChange={(e) => setFormData(prev => ({ ...prev, washroom_details: { ...prev.washroom_details, washroom_to_student_ratio: e.target.value } }))}
                placeholder="e.g., 1:4"
                className="w-full rounded-xl border border-cream-400 bg-cream-50 px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: 'indian_toilet', label: 'Indian Toilet' },
              { key: 'western_toilet', label: 'Western Toilet' },
              { key: 'attached_washroom_available', label: 'Attached Washroom' }
            ].map(w => (
              <div key={w.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.washroom_details[w.key as keyof typeof formData.washroom_details] as boolean}
                  onChange={(e) => setFormData(prev => ({ ...prev, washroom_details: { ...prev.washroom_details, [w.key]: e.target.checked } }))}
                  className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
                />
                <label className="text-sm font-semibold text-ink-600">{w.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-ink">🧺 Laundry Facilities</h3>
          {[
            { key: 'washing_machine', label: 'Washing Machine' },
            { key: 'paid_laundry_service', label: 'Paid Laundry Service' },
            { key: 'drying_area', label: 'Drying Area' }
          ].map(l => (
            <div key={l.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.laundry[l.key as keyof typeof formData.laundry]}
                onChange={(e) => setFormData(prev => ({ ...prev, laundry: { ...prev.laundry, [l.key]: e.target.checked } }))}
                className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
              />
              <label className="text-sm font-semibold text-ink-600">{l.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Documents */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Gavel size={20} /> Legal Compliance & Documents
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: 'hostel_registration', label: 'Hostel Registration' },
            { key: 'form_3', label: 'Form 3' },
            { key: 'food_license', label: 'Food License (FSSAI)' },
            { key: 'character_certificate', label: 'Character Certificate' },
            { key: 'trade_license', label: 'Trade License' },
            { key: 'fire_noc', label: 'Fire NOC' },
            { key: 'hostel_association_member', label: 'Hostel Association Member' },
            { key: 'member_of_hostel_wellfare_association', label: 'Hostel Welfare Association Member' }
          ].map(doc => (
            <div key={doc.key} className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3">
              <label className="text-sm font-semibold text-ink-600">{doc.label}</label>
              <input
                type="checkbox"
                checked={formData.legal_docs[doc.key as keyof typeof formData.legal_docs]}
                onChange={(e) => setFormData(prev => ({ ...prev, legal_docs: { ...prev.legal_docs, [doc.key]: e.target.checked } }))}
                className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="border-t border-cream-400 pt-6">
        <h3 className="mb-4 font-semibold text-ink">📸 Hostel Photos (Max 15)</h3>
        <div className="mb-4">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-cream-400 bg-cream-50 px-6 py-12 text-center transition-colors hover:border-gold-400 hover:bg-gold-50">
            <Upload className="h-12 w-12 text-ink-400" />
            <div>
              <span className="font-semibold text-ink">Click to upload photos</span>
              <p className="mt-1 text-sm text-ink-600">PNG, JPG up to 6MB each (after compression)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-sm text-ink-600">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} selected ({15 - photos.length} remaining)
          </p>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            {previews.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="h-24 w-full rounded-xl object-cover border-2 border-cream-400"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                  title="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-1 left-1 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Note */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>📝 Note:</strong> Your hostel will be submitted for admin review after clicking "Submit Hostel".
          Once approved by our team, it will be visible to students on the main website.
        </p>
      </div>
    </div>
  );
}
