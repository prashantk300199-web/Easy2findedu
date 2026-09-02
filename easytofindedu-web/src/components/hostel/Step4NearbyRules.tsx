import { Map, Clock, ShieldCheck, Trash2, X, PlusCircle } from 'lucide-react';
import { FormData } from '../../lib/hostelFormTypes';

interface Step4Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  customRuleInput: string;
  setCustomRuleInput: (value: string) => void;
  addCustomRule: () => void;
  removeCustomRule: (index: number) => void;
}

export function Step4NearbyRules({ formData, setFormData, customRuleInput, setCustomRuleInput, addCustomRule, removeCustomRule }: Step4Props) {
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <Map /> Nearby Locations & Rules
      </h2>

      {/* Nearby Distances */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Nearby Institutes & Landmarks</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                nearby_distances: {
                  ...prev.nearby_distances,
                  institutes: [...prev.nearby_distances.institutes, { name: '', distance: 0, unit: 'km' }]
                }
              }))}
              className="text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              + Institute
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                nearby_distances: {
                  ...prev.nearby_distances,
                  landmarks: [...prev.nearby_distances.landmarks, { name: '', distance: 0, unit: 'km' }]
                }
              }))}
              className="text-sm font-semibold text-gold-700 hover:text-gold-800"
            >
              + Landmark
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Institutes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-600">📚 Institutes</h4>
            {formData.nearby_distances.institutes.map((inst, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inst.name}
                  onChange={(e) => {
                    const newInsts = [...formData.nearby_distances.institutes];
                    newInsts[i].name = e.target.value;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, institutes: newInsts } }));
                  }}
                  placeholder="Institute name (e.g., PW)"
                  className="flex-1 rounded-xl border border-cream-400 bg-cream-50 px-4 py-2 text-sm text-ink focus:border-gold-700 focus:outline-none"
                />
                <input
                  type="number"
                  value={inst.distance}
                  onChange={(e) => {
                    const newInsts = [...formData.nearby_distances.institutes];
                    newInsts[i].distance = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, institutes: newInsts } }));
                  }}
                  placeholder="0"
                  className="w-20 rounded-xl border border-cream-400 bg-cream-50 px-3 py-2 text-center text-sm text-ink focus:border-gold-700 focus:outline-none"
                />
                <select
                  value={inst.unit}
                  onChange={(e) => {
                    const newInsts = [...formData.nearby_distances.institutes];
                    newInsts[i].unit = e.target.value;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, institutes: newInsts } }));
                  }}
                  className="w-20 rounded-xl border border-cream-400 bg-cream-50 px-2 py-2 text-sm text-ink focus:border-gold-700 focus:outline-none"
                >
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
                {formData.nearby_distances.institutes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      nearby_distances: {
                        ...prev.nearby_distances,
                        institutes: prev.nearby_distances.institutes.filter((_, idx) => idx !== i)
                      }
                    }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Landmarks */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink-600">📍 Landmarks</h4>
            {formData.nearby_distances.landmarks.map((land, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={land.name}
                  onChange={(e) => {
                    const newLands = [...formData.nearby_distances.landmarks];
                    newLands[i].name = e.target.value;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, landmarks: newLands } }));
                  }}
                  placeholder="Landmark (e.g., Railway Station)"
                  className="flex-1 rounded-xl border border-cream-400 bg-cream-50 px-4 py-2 text-sm text-ink focus:border-gold-700 focus:outline-none"
                />
                <input
                  type="number"
                  value={land.distance}
                  onChange={(e) => {
                    const newLands = [...formData.nearby_distances.landmarks];
                    newLands[i].distance = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, landmarks: newLands } }));
                  }}
                  placeholder="0"
                  className="w-20 rounded-xl border border-cream-400 bg-cream-50 px-3 py-2 text-center text-sm text-ink focus:border-gold-700 focus:outline-none"
                />
                <select
                  value={land.unit}
                  onChange={(e) => {
                    const newLands = [...formData.nearby_distances.landmarks];
                    newLands[i].unit = e.target.value;
                    setFormData(prev => ({ ...prev, nearby_distances: { ...prev.nearby_distances, landmarks: newLands } }));
                  }}
                  className="w-20 rounded-xl border border-cream-400 bg-cream-50 px-2 py-2 text-sm text-ink focus:border-gold-700 focus:outline-none"
                >
                  <option value="km">km</option>
                  <option value="m">m</option>
                </select>
                {formData.nearby_distances.landmarks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      nearby_distances: {
                        ...prev.nearby_distances,
                        landmarks: prev.nearby_distances.landmarks.filter((_, idx) => idx !== i)
                      }
                    }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules & Security */}
      <div className="grid gap-6 border-t border-cream-400 pt-6 md:grid-cols-2">
        {/* Rules */}
        <div className="space-y-4 rounded-xl border-2 border-cream-400 bg-cream-50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            <Clock size={20} /> Hostel Rules
          </h3>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Gate Close Time</label>
            <input
              type="time"
              value={formData.rules.gate_close_time}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: { ...prev.rules, gate_close_time: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Guest Policy</label>
            <select
              value={formData.rules.guest_policy}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: { ...prev.rules, guest_policy: e.target.value } }))}
              className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
            >
              <option value="family_only">Family Only</option>
              <option value="friends_only">Friends Allowed</option>
              <option value="both_allowed">Both Allowed</option>
              <option value="no_one_allowed">No Visitors</option>
            </select>
          </div>
          {[
            { key: 'late_entry_allowed', label: 'Late Entry in Emergency' },
            { key: 'smoking_allowed', label: 'Smoking Allowed' },
            { key: 'alcohol_allowed', label: 'Alcohol Allowed' },
            { key: 'pets_allowed', label: 'Pets Allowed' }
          ].map(rule => (
            <div key={rule.key} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <label className="text-sm font-semibold text-ink-600">{rule.label}</label>
              <input
                type="checkbox"
                checked={formData.rules[rule.key as keyof typeof formData.rules] as boolean}
                onChange={(e) => setFormData(prev => ({ ...prev, rules: { ...prev.rules, [rule.key]: e.target.checked } }))}
                className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
              />
            </div>
          ))}

          {/* Custom Rules */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-600">Custom Rules</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customRuleInput}
                onChange={(e) => setCustomRuleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRule())}
                placeholder="Add custom rule..."
                className="flex-1 rounded-xl border border-cream-400 bg-white px-4 py-2 text-sm text-ink focus:border-gold-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomRule}
                className="rounded-xl bg-gold-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-gold-800"
              >
                <PlusCircle size={16} />
              </button>
            </div>
            {formData.rules.custom_rules.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.rules.custom_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                    <span className="text-sm text-ink">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomRule(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4 rounded-xl border-2 border-cream-400 bg-cream-50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            <ShieldCheck size={20} /> Safety & Security
          </h3>
          {[
            { key: 'cctv', label: 'CCTV Surveillance' },
            { key: 'security_guard_24x7', label: '24x7 Security Guard' },
            { key: 'biometric_entry', label: 'Biometric Entry' },
            { key: 'visitor_register', label: 'Visitor Register' },
            { key: 'fire_extinguisher', label: 'Fire Extinguisher' },
            { key: 'first_aid_kit', label: 'First Aid Kit' },
            { key: 'full_time_warden', label: 'Full-time Warden' },
            { key: 'transport_facilities', label: 'Transport Facilities' }
          ].map(sec => (
            <div key={sec.key} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <label className="text-sm font-semibold text-ink-600">{sec.label}</label>
              <input
                type="checkbox"
                checked={formData.security[sec.key as keyof typeof formData.security]}
                onChange={(e) => setFormData(prev => ({ ...prev, security: { ...prev.security, [sec.key]: e.target.checked } }))}
                className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
