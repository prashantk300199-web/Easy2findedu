import { Bed, Utensils, PlusCircle, Trash2, Upload, X } from 'lucide-react';
import { FormData, ROOM_TYPES, Room, MealPlan } from '../../lib/hostelFormTypes';

interface Step3Props {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  handleMenuCardUpload: (index: number, file: File | null) => void;
}

export function Step3RoomsMeals({ formData, setFormData, handleMenuCardUpload }: Step3Props) {
  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
        <Bed /> Rooms & Meals
      </h2>

      {/* Rooms Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-ink">Room Configuration</h3>
        {formData.rooms.map((room, idx) => (
          <div key={idx} className="space-y-4 rounded-xl border-2 border-cream-400 bg-cream-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink">Room Type {idx + 1}</h4>
              {formData.rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== idx) }))}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Room Type *</label>
                <select
                  value={room.room_type}
                  onChange={(e) => {
                    const newRooms = [...formData.rooms];
                    newRooms[idx].room_type = e.target.value;
                    setFormData(prev => ({ ...prev, rooms: newRooms }));
                  }}
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                >
                  {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Total Beds *</label>
                <input
                  type="number"
                  value={room.total_beds}
                  onChange={(e) => {
                    const newRooms = [...formData.rooms];
                    const beds = parseInt(e.target.value) || 1;
                    newRooms[idx].total_beds = beds;
                    newRooms[idx].available_beds_count = beds;
                    setFormData(prev => ({ ...prev, rooms: newRooms }));
                  }}
                  min="1"
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Monthly Rent (₹) *</label>
                <input
                  type="number"
                  value={room.monthly_rent}
                  onChange={(e) => {
                    const newRooms = [...formData.rooms];
                    newRooms[idx].monthly_rent = parseInt(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, rooms: newRooms }));
                  }}
                  min="0"
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={room.ac}
                onChange={(e) => {
                  const newRooms = [...formData.rooms];
                  newRooms[idx].ac = e.target.checked;
                  setFormData(prev => ({ ...prev, rooms: newRooms }));
                }}
                className="h-5 w-5 rounded border-cream-400 text-gold-700 focus:ring-gold-700"
              />
              <label className="text-sm font-semibold text-ink-600">AC Available</label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFormData(prev => ({
            ...prev,
            rooms: [...prev.rooms, {
              room_type: 'single_sharing_wall',
              total_beds: 1,
              monthly_rent: 0,
              is_available: true,
              available_beds_count: 1,
              ac: false
            }]
          }))}
          className="flex items-center gap-2 rounded-xl bg-gold-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-800"
        >
          <PlusCircle size={18} /> Add Another Room Type
        </button>
      </div>

      {/* Meal Plans Section */}
      <div className="space-y-4 border-t border-cream-400 pt-6">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Utensils size={20} /> Meal Plans
        </h3>
        {formData.meal_plans.map((meal, idx) => (
          <div key={idx} className="space-y-4 rounded-xl border-2 border-cream-400 bg-cream-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink">Meal Plan {idx + 1}</h4>
              {formData.meal_plans.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, meal_plans: prev.meal_plans.filter((_, i) => i !== idx) }))}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Frequency *</label>
                <select
                  value={meal.frequency}
                  onChange={(e) => {
                    const newMeals = [...formData.meal_plans];
                    newMeals[idx].frequency = e.target.value;
                    setFormData(prev => ({ ...prev, meal_plans: newMeals }));
                  }}
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                >
                  <option value="2_times">2 Times</option>
                  <option value="3_times">3 Times</option>
                  <option value="4_times">4 Times</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Meal Type *</label>
                <select
                  value={meal.meal_type}
                  onChange={(e) => {
                    const newMeals = [...formData.meal_plans];
                    newMeals[idx].meal_type = e.target.value;
                    setFormData(prev => ({ ...prev, meal_plans: newMeals }));
                  }}
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                >
                  <option value="veg">Pure Veg</option>
                  <option value="non_veg">Non-Veg</option>
                  <option value="both">Both (Veg + Non-Veg)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Service Type *</label>
                <select
                  value={meal.service_type}
                  onChange={(e) => {
                    const newMeals = [...formData.meal_plans];
                    newMeals[idx].service_type = e.target.value;
                    setFormData(prev => ({ ...prev, meal_plans: newMeals }));
                  }}
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                >
                  <option value="in_house_kitchen">In-House Kitchen</option>
                  <option value="third_party_vendor">Third Party Vendor</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-600">Monthly Cost (₹)</label>
                <input
                  type="number"
                  value={meal.monthly_cost || ''}
                  onChange={(e) => {
                    const newMeals = [...formData.meal_plans];
                    newMeals[idx].monthly_cost = parseInt(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, meal_plans: newMeals }));
                  }}
                  min="0"
                  placeholder="Optional"
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-ink focus:border-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-700/20"
                />
              </div>
            </div>

            {/* Menu Card Upload */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-600">
                <Upload size={16} className="inline mr-1" />
                Menu Card (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMenuCardUpload(idx, file);
                  }}
                  className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-gold-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gold-800 focus:border-gold-700 focus:outline-none"
                />
                {meal.menu_file && (
                  <button
                    type="button"
                    onClick={() => handleMenuCardUpload(idx, null)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Remove menu card"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {meal.menu_file && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  ✓ {meal.menu_file.name}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFormData(prev => ({
            ...prev,
            meal_plans: [...prev.meal_plans, {
              frequency: '3_times',
              meal_type: 'veg',
              service_type: 'in_house_kitchen',
              monthly_cost: 0
            }]
          }))}
          className="flex items-center gap-2 rounded-xl bg-gold-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-800"
        >
          <PlusCircle size={18} /> Add Another Meal Plan
        </button>
      </div>
    </div>
  );
}
