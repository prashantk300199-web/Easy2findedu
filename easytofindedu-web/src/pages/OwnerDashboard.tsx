import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://easytofindedu.onrender.com/api/v1';

function authFetch(path: string, token: string | null, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

async function ownerGet(path: string, token: string | null) {
  const res = await authFetch(path, token);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

async function ownerPatch(path: string, token: string | null, body: object) {
  const res = await authFetch(path, token, { method: 'PATCH', body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data;
}

async function ownerDelete(path: string, token: string | null) {
  const res = await authFetch(path, token, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ view, setView }: { view: string; setView: (v: 'hostels' | 'bookings' | 'profile') => void }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const items = [
    { id: 'hostels', label: 'My Hostels' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'profile', label: 'Profile' },
  ] as const;

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-cream-300 bg-cream">
      <div className="border-b border-cream-300 px-7 py-6">
        <Link to="/" className="font-display text-[18px] text-night-800">
          EasyToFind<span className="text-gold-500">Edu</span>
        </Link>
        <p className="mt-1 text-xs text-ink-400">Hostel Owner Dashboard</p>
      </div>
      <nav className="flex-1 px-4 py-6">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`mb-1 flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-300 ${
              view === n.id ? 'bg-night-800 text-cream-100' : 'text-ink-600 hover:bg-cream-200'
            }`}
          >
            {n.label}
          </button>
        ))}

        {/* Add Hostel - Navigate to new page */}
        <button
          onClick={() => navigate('/hostels/add')}
          className="mb-1 flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-gold-700 hover:bg-gold-50 transition-colors duration-300"
        >
          + Add Hostel
        </button>
      </nav>
      <div className="border-t border-cream-300 px-7 py-5">
        <p className="text-sm font-medium text-night-800">{user?.name ?? 'Owner'}</p>
        <button onClick={async () => { await logout(); navigate('/'); }}
          className="mt-2 text-xs text-ink-400 hover:text-wine transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ── My Hostels ─────────────────────────────────────────────────────────────

interface HostelRow { _id: string; name: string; masked_name: string; hostel_type: string; is_open: boolean; status: string; total_hostel_beds: number; }

function MyHostels() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<HostelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const token = getToken();
    ownerGet('/hostels/', token).then(d => { setHostels(Array.isArray(d) ? d : d.hostels ?? []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };
  useEffect(load, []);

  const toggle = async (id: string) => {
    const token = getToken();
    try { await ownerPatch(`/hostels/${id}/toggle`, token, {}); load(); } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed'); }
  };
  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const token = getToken();
    try { await ownerDelete(`/hostels/${id}`, token); load(); } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed'); }
  };

  if (loading) return <div className="py-20 text-center text-sm text-ink-400">Loading hostels…</div>;
  if (error) return <div className="py-10 text-center text-sm text-wine">{error}</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-night-800">My Hostels</h1>
        <button onClick={() => setView('add')}
          className="bg-night-800 px-6 py-3 text-[11px] uppercase tracking-wide2 text-cream-100 transition-colors hover:bg-gold-600">
          + Add Hostel
        </button>
      </div>

      {hostels.length === 0 ? (
        <div className="border border-dashed border-cream-400 py-24 text-center">
          <p className="font-display text-2xl text-ink-600">No hostels listed yet</p>
          <p className="mt-3 text-sm text-ink-400">Add your first hostel to start receiving bookings</p>
          <button onClick={() => setView('add')}
            className="mt-8 inline-block bg-night-800 px-8 py-4 text-[11px] uppercase tracking-wide2 text-cream-100 hover:bg-gold-600">
            Add Hostel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {hostels.map((h) => (
            <motion.div key={h._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between border border-cream-300 bg-cream-50 px-7 py-5">
              <div>
                <p className="font-display text-xl text-night-800">{h.masked_name || h.name}</p>
                <div className="mt-1 flex gap-4 text-xs text-ink-400">
                  <span className="capitalize">{h.hostel_type}</span>
                  <span>{h.total_hostel_beds} beds</span>
                  <span className={h.status === 'approved' ? 'text-green-600' : 'text-gold-600'}>
                    {h.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => toggle(h._id)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-wide2 transition-colors ${
                    h.is_open ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-cream-300 text-ink-500 hover:bg-cream-400'
                  }`}>
                  {h.is_open ? 'Open' : 'Closed'}
                </button>
                <button onClick={() => onEdit(h._id)}
                  className="border border-night-800 px-4 py-2 text-[10px] uppercase tracking-wide2 text-night-800 hover:bg-night-800 hover:text-cream-100 transition-colors">
                  Edit
                </button>
                <button onClick={() => del(h._id, h.masked_name || h.name)}
                  className="px-4 py-2 text-[10px] uppercase tracking-wide2 text-wine hover:bg-cream-200 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bookings ───────────────────────────────────────────────────────────────

interface Booking { _id: string; hostel?: { masked_name?: string }; user?: { name?: string; email?: string }; status: string; createdAt: string; }

function Bookings() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    ownerGet('/bookings/', token).then(d => { setBookings(Array.isArray(d) ? d : d.bookings ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [getToken]);

  if (loading) return <div className="py-20 text-center text-sm text-ink-400">Loading bookings…</div>;

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-night-800">Bookings</h1>
      {bookings.length === 0 ? (
        <div className="border border-dashed border-cream-400 py-24 text-center">
          <p className="font-display text-2xl text-ink-600">No bookings yet</p>
          <p className="mt-3 text-sm text-ink-400">Bookings from students will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="flex items-center justify-between border border-cream-300 bg-cream-50 px-7 py-5">
              <div>
                <p className="font-display text-lg text-night-800">{b.hostel?.masked_name ?? 'Hostel'}</p>
                <p className="mt-1 text-sm text-ink-500">{b.user?.name} · {b.user?.email}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <span className={`px-4 py-2 text-[10px] uppercase tracking-wide2 ${
                b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                b.status === 'pending' ? 'bg-gold-100 text-gold-700' : 'bg-cream-300 text-ink-500'
              }`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────

function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-night-800">Profile</h1>
      <div className="max-w-lg border border-cream-300 bg-cream-50 p-8">
        <div className="space-y-5">
          <div>
            <p className="overline">Name</p>
            <p className="mt-1.5 font-display text-xl text-night-800">{user?.name}</p>
          </div>
          <div className="border-t border-cream-300 pt-5">
            <p className="overline">Email</p>
            <p className="mt-1.5 text-sm text-ink-700">{user?.email}</p>
          </div>
          <div className="border-t border-cream-300 pt-5">
            <p className="overline">Role</p>
            <p className="mt-1.5 text-sm text-ink-700">Hostel Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Hostel form ────────────────────────────────────────────────────────

function Field({ label, name: _name, value, onChange, placeholder, type = 'text' }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-overline text-gold-600">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none" />
    </div>
  );
}

function Select({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-overline text-gold-600">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 focus:border-gold-500 focus:outline-none">
        {children}
      </select>
    </div>
  );
}

function AddHostel({ setView, editHostelId }: { setView: (v: 'hostels' | 'bookings' | 'profile' | 'add') => void; editHostelId?: string }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [f, setF] = useState({
    name: '', hostel_type: 'girls', description: '',
    line1: '', subarea: '', area: '', pincode: '', city: 'Patna', state: 'Bihar',
    security_deposit_type: 'one_month_fee', registration_fee: '1500',
    warden_name: '', warden_phone: '',
    number_of_floors: '2', gate_close_time: '22:00',
    room_type: 'double_sharing_wall', room_beds: '10', room_rent: '5000',
    mess: 'false', mess_frequency: '3_times', mess_type: 'veg', mess_service: 'tiffin_service',
    notice_period_days: '30',
  });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  // Load hostel data in edit mode
  useEffect(() => {
    if (editHostelId) {
      setIsEditMode(true);
      setLoading(true);
      ownerGet(`/hostels/${editHostelId}`, getToken())
        .then((data: any) => {
          setF({
            name: data.name || '',
            hostel_type: data.hostel_type || 'girls',
            description: data.description || '',
            line1: data.address?.line1 || '',
            subarea: data.address?.subarea || '',
            area: data.address?.area || '',
            pincode: data.address?.pincode || '',
            city: data.address?.city || 'Patna',
            state: data.address?.state || 'Bihar',
            security_deposit_type: data.rent?.security_deposit_type || 'one_month_fee',
            registration_fee: String(data.rent?.registration_fee || 1500),
            warden_name: data.warden?.name || '',
            warden_phone: data.warden?.contact_number || '',
            number_of_floors: String(data.building_details?.number_of_floors || 2),
            gate_close_time: data.rules?.gate_close_time || '22:00',
            room_type: data.rooms?.[0]?.room_type || 'double_sharing_wall',
            room_beds: String(data.rooms?.[0]?.total_beds || 10),
            room_rent: String(data.rooms?.[0]?.monthly_rent || 5000),
            mess: data.meal_plans?.length > 0 ? 'true' : 'false',
            mess_frequency: data.meal_plans?.[0]?.frequency || '3_times',
            mess_type: data.meal_plans?.[0]?.meal_type || 'veg',
            mess_service: data.meal_plans?.[0]?.service_type || 'tiffin_service',
            notice_period_days: String(data.notice_period_days || 30),
          });
          setAmenities([...(data.in_room_amenities || []), ...(data.common_amenities || [])]);
        })
        .catch(() => setError('Failed to load hostel data'))
        .finally(() => setLoading(false));
    }
  }, [editHostelId, getToken]);

  const toggleAmenity = (key: string) =>
    setAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const ROOM_AMENITIES = ['bed','mattress','wardrobe','study_table','study_chair','bookshelf','fan','ac','cooler','room_heater','attached_bathroom','balcony','mirror','curtains'];
  const COMMON_AMENITIES = ['wifi','ro_water','water_cooler','24x7_water_supply','electricity_backup','inverter_backup','geyser','refrigerator','induction','tiffin_service','washing_machine','paid_laundry_service','drying_area','daily_room_cleaning','parking','terrace_access','newspaper_magazine'];
  const SECURITY_AMENITIES = ['cctv','security_guard_24x7','biometric_entry','visitor_register','first_aid_kit','full_time_warden'];
  const AMENITY_LABEL: Record<string,string> = {
    bed:'Bed',mattress:'Mattress',wardrobe:'Wardrobe',study_table:'Study Table',study_chair:'Study Chair',bookshelf:'Bookshelf',fan:'Fan',ac:'AC',cooler:'Air Cooler',room_heater:'Room Heater',attached_bathroom:'Attached Bathroom',balcony:'Balcony',mirror:'Mirror',curtains:'Curtains',
    wifi:'Wi-Fi',ro_water:'RO Water',water_cooler:'Water Cooler','24x7_water_supply':'24×7 Water',electricity_backup:'Power Backup',inverter_backup:'Inverter',geyser:'Geyser',refrigerator:'Refrigerator',induction:'Induction',tiffin_service:'Tiffin Service',washing_machine:'Washing Machine',paid_laundry_service:'Paid Laundry',drying_area:'Drying Area',daily_room_cleaning:'Daily Cleaning',parking:'Parking',terrace_access:'Terrace',newspaper_magazine:'Newspaper',
    cctv:'CCTV',security_guard_24x7:'24×7 Guard',biometric_entry:'Biometric Entry',visitor_register:'Visitor Register',first_aid_kit:'First Aid',full_time_warden:'Full-time Warden',
  };

  const CheckGroup = ({ keys, label }: { keys: string[]; label: string }) => (
    <div className="mb-6">
      <p className="mb-3 text-[11px] uppercase tracking-overline text-ink-400">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {keys.map(k => (
          <label key={k} className={`flex cursor-pointer items-center gap-2.5 border px-3 py-2.5 text-sm transition-colors ${amenities.includes(k) ? 'border-gold-500 bg-gold-100 text-night-800' : 'border-cream-300 text-ink-500 hover:border-gold-300'}`}>
            <input type="checkbox" checked={amenities.includes(k)} onChange={() => toggleAmenity(k)} className="hidden" />
            <span className={`h-4 w-4 shrink-0 border ${amenities.includes(k) ? 'border-gold-500 bg-gold-500' : 'border-cream-400'} flex items-center justify-center text-[10px] text-white`}>
              {amenities.includes(k) && '✓'}
            </span>
            {AMENITY_LABEL[k] ?? k}
          </label>
        ))}
      </div>
    </div>
  );

  const submit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    // If saving as draft, skip validation
    if (!saveAsDraft) {
      // Validate current step before proceeding
      if (step === 1) {
        if (!f.name || !f.description) {
          setError('Please fill in all required fields: Hostel Name and Description');
          return;
        }
      }
      if (step === 2) {
        if (!f.line1 || !f.area || !f.pincode) {
          setError('Please fill in all required address fields');
          return;
        }
      }
    }
    if (step === 3) {
      if (!f.room_beds || !f.room_rent) {
        setError('Please fill in room details: number of beds and monthly rent');
        return;
      }
    }

    if (step < 5) { setStep(s => s + 1); setError(''); return; }

    setError(''); setLoading(true);
    const token = getToken();
    try {
      // Log form data to debug
      console.log('Form data before submit:', f);
      console.log('Selected amenities:', amenities);
      console.log('Photos selected:', photos.length);

      const fd = new FormData();
      fd.append('name', f.name);
      fd.append('hostel_type', f.hostel_type);
      fd.append('description', f.description);
      fd.append('address', JSON.stringify({ line1: f.line1, subarea: f.subarea, area: f.area, pincode: f.pincode, city: f.city, state: f.state, country: 'India' }));
      fd.append('location', JSON.stringify({ type: 'Point', coordinates: [85.1376, 25.5941] }));
      fd.append('rent', JSON.stringify({ security_deposit_type: f.security_deposit_type, registration_fee: Number(f.registration_fee) }));
      fd.append('rooms', JSON.stringify([{ room_type: f.room_type, total_beds: Number(f.room_beds), monthly_rent: Number(f.room_rent), is_available: true, available_beds_count: Number(f.room_beds), ac: amenities.includes('ac') }]));
      fd.append('warden', JSON.stringify({ name: f.warden_name, contact_number: f.warden_phone }));
      fd.append('building_details', JSON.stringify({ number_of_floors: Number(f.number_of_floors), flooring_type: 'tiles', building_age_years: 0 }));
      fd.append('rules', JSON.stringify({ gate_close_time: f.gate_close_time, smoking_allowed: false, alcohol_allowed: false, pets_allowed: false, late_entry_allowed: false, guest_policy: 'family_only' }));
      fd.append('security', JSON.stringify({ full_time_warden: amenities.includes('full_time_warden'), cctv: amenities.includes('cctv'), security_guard_24x7: amenities.includes('security_guard_24x7'), biometric_entry: amenities.includes('biometric_entry'), visitor_register: amenities.includes('visitor_register'), first_aid_kit: amenities.includes('first_aid_kit') }));

      fd.append('in_room_amenities', JSON.stringify(amenities.filter(a => ROOM_AMENITIES.includes(a))));
      fd.append('common_amenities', JSON.stringify(amenities.filter(a => COMMON_AMENITIES.includes(a))));
      fd.append('notice_period_days', f.notice_period_days);
      if (f.mess === 'true') {
        fd.append('meal_plans', JSON.stringify([{ frequency: f.mess_frequency, meal_type: f.mess_type, service_type: f.mess_service }]));
      } else {
        fd.append('meal_plans', JSON.stringify([]));
      }
      photos.forEach(p => fd.append('photos', p));

      const endpoint = isEditMode ? `/hostels/${editHostelId}` : '/hostels/';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(`${BASE}${endpoint}`, {
        method,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('Backend error:', json);
        throw new Error(json.message || json.error || `Failed to ${isEditMode ? 'update' : 'create'} hostel`);
      }
      alert(`Hostel ${isEditMode ? 'updated' : 'published'} successfully!`);
      setView('hostels');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); setLoading(false); }
  };

  const saveDraft = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const draftData = {
        formData: f,
        amenities,
        step,
      };

      const response = await fetch(`${BASE}/hostels/draft`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      alert('Draft saved successfully! You can continue later.');
      setView('hostels');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Basic Info', 'Address & Rent', 'Rooms & Rules', 'Amenities', 'Photos & Mess'];

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/dashboard')}
          className="text-sm text-ink-400 hover:text-night-800">← {step > 1 ? 'Back' : 'My Hostels'}</button>
        <h1 className="font-display text-3xl text-night-800">Add Hostel</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 text-[11px] uppercase tracking-wide2 ${i + 1 === step ? 'text-night-800' : i + 1 < step ? 'text-gold-600' : 'text-ink-300'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${i + 1 === step ? 'bg-night-800 text-cream-100' : i + 1 < step ? 'bg-gold-500 text-white' : 'bg-cream-300 text-ink-400'}`}>{i + 1}</span>
            {s}
            {i < STEPS.length - 1 && <span className="ml-2 text-ink-200">→</span>}
          </div>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="max-w-2xl space-y-6">
        {error && <div className="border-l-2 border-wine bg-cream-200 px-5 py-3 text-sm text-wine">{error}</div>}

        {/* Step 1 – Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <Field label="Hostel Display Name" name="name" value={f.name} onChange={set('name')} placeholder="e.g. Sunrise Girls Hostel" />
            <Select label="Hostel Type" value={f.hostel_type} onChange={set('hostel_type')}>
              <option value="girls">Women's Hostel</option><option value="boys">Men's Hostel</option><option value="co-ed">Co-ed Hostel</option>
            </Select>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-overline text-gold-600">Description *</label>
              <textarea value={f.description} onChange={e => set('description')(e.target.value)} rows={4}
                placeholder="Describe your hostel — facilities, environment, nearby landmarks…"
                className="w-full border border-cream-300 bg-transparent p-3 text-[15px] text-night-800 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none resize-none" />
            </div>
            <Field label="Notice Period (days)" name="notice_period_days" value={f.notice_period_days} onChange={set('notice_period_days')} placeholder="30" type="number" />
          </div>
        )}

        {/* Step 2 – Address & Rent */}
        {step === 2 && (
          <div className="space-y-6">
            <Field label="Street / Building" name="line1" value={f.line1} onChange={set('line1')} placeholder="e.g. 12, Kumar Tower" />
            <div className="grid grid-cols-2 gap-6">
              <Field label="Sub-area / Colony" name="subarea" value={f.subarea} onChange={set('subarea')} placeholder="e.g. Nageshwar Colony" />
              <Field label="Area" name="area" value={f.area} onChange={set('area')} placeholder="e.g. Boring Road" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="City" name="city" value={f.city} onChange={set('city')} placeholder="Patna" />
              <Field label="Pincode" name="pincode" value={f.pincode} onChange={set('pincode')} placeholder="800001" />
            </div>
            <Select label="Security Deposit" value={f.security_deposit_type} onChange={set('security_deposit_type')}>
              <option value="one_month_fee">One Month Fee</option><option value="two_month_fee">Two Month Fee</option>
              <option value="15_day_fee">15 Days Fee</option><option value="no_deposit">No Deposit</option>
            </Select>
            <Field label="Registration Fee (₹)" name="registration_fee" value={f.registration_fee} onChange={set('registration_fee')} placeholder="1500" type="number" />
          </div>
        )}

        {/* Step 3 – Rooms & Rules */}
        {step === 3 && (
          <div className="space-y-6">
            <Select label="Primary Room Type" value={f.room_type} onChange={set('room_type')}>
              <option value="single_sharing_wall">Single Sharing (Walled)</option>
              <option value="single_sharing_partition">Single Sharing (Partition)</option>
              <option value="single_sharing_attached_washroom">Single Sharing (Attached WC)</option>
              <option value="double_sharing_wall">Double Sharing (Walled)</option>
              <option value="double_sharing_partition">Double Sharing (Partition)</option>
              <option value="double_sharing_attached_washroom">Double Sharing (Attached WC)</option>
              <option value="triple_sharing_wall">Triple Sharing (Walled)</option>
              <option value="triple_sharing_partition">Triple Sharing (Partition)</option>
              <option value="triple_sharing_attached_washroom">Triple Sharing (Attached WC)</option>
              <option value="quad_sharing_wall">Quad Sharing (Walled)</option>
              <option value="quad_sharing_attached_washroom">Quad Sharing (Attached WC)</option>
            </Select>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Number of Beds" name="room_beds" value={f.room_beds} onChange={set('room_beds')} placeholder="10" type="number" />
              <Field label="Monthly Rent (₹)" name="room_rent" value={f.room_rent} onChange={set('room_rent')} placeholder="5000" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Number of Floors" name="number_of_floors" value={f.number_of_floors} onChange={set('number_of_floors')} placeholder="2" type="number" />
              <Field label="Gate Close Time" name="gate_close_time" value={f.gate_close_time} onChange={set('gate_close_time')} placeholder="22:00" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Warden Name" name="warden_name" value={f.warden_name} onChange={set('warden_name')} placeholder="Full name"  />
              <Field label="Warden Phone" name="warden_phone" value={f.warden_phone} onChange={set('warden_phone')} placeholder="10-digit number"  />
            </div>
          </div>
        )}

        {/* Step 4 – Amenities */}
        {step === 4 && (
          <div>
            <CheckGroup keys={ROOM_AMENITIES} label="Room Amenities" />
            <CheckGroup keys={COMMON_AMENITIES} label="Common Facilities" />
            <CheckGroup keys={SECURITY_AMENITIES} label="Security" />
          </div>
        )}

        {/* Step 5 – Photos & Mess */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-overline text-gold-600">Hostel Photos</label>
              <input type="file" multiple accept="image/*" onChange={e => setPhotos(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-ink-500 file:mr-4 file:border-0 file:bg-night-800 file:px-5 file:py-2.5 file:text-[11px] file:uppercase file:tracking-wide2 file:text-cream-100 hover:file:bg-gold-600" />
              {photos.length > 0 && <p className="text-xs text-gold-700">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>}
            </div>

            <Select label="Mess / Food Available?" value={f.mess} onChange={set('mess')}>
              <option value="false">No Mess</option><option value="true">Yes, Mess Available</option>
            </Select>

            {f.mess === 'true' && (
              <div className="space-y-4 border-l-2 border-gold-300 pl-5">
                <Select label="Meal Frequency" value={f.mess_frequency} onChange={set('mess_frequency')}>
                  <option value="2_times">Twice a Day</option>
                  <option value="3_times">3 Times a Day</option>
                  <option value="4_times">4 Times a Day</option>
                </Select>
                <Select label="Meal Type" value={f.mess_type} onChange={set('mess_type')}>
                  <option value="veg">Veg Only</option>
                  <option value="non_veg">Non-Veg Available</option>
                  <option value="both">Both Veg & Non-Veg</option>
                </Select>
                <Select label="Service Type" value={f.mess_service} onChange={set('mess_service')}>
                  <option value="tiffin_service">Tiffin Service</option>
                  <option value="in_house_kitchen">In-house Kitchen</option>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading}
            className="flex-1 bg-night-800 py-4 text-[12px] uppercase tracking-wide2 text-cream-100 hover:bg-gold-600 disabled:opacity-60 transition-colors">
            {loading ? 'Saving…' : step < 5 ? `Next → ${STEPS[step]}` : 'Publish Hostel'}
          </button>

          {!isEditMode && (
            <button
              type="button"
              onClick={saveDraft}
              disabled={loading}
              className="px-6 py-4 border-2 border-night-800 text-night-800 text-[12px] uppercase tracking-wide2 hover:bg-night-800 hover:text-cream-100 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Saving...' : '💾 Save Draft'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Shell ──────────────────────────────────────────────────────────────────

export function OwnerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'owner')) navigate('/login');
  }, [user, loading, navigate]);

  const [view, setView] = useState<'hostels' | 'bookings' | 'profile'>('hostels');

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-ink-400">Loading…</p></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 p-8">
        {view === 'hostels' && <MyHostels />}
        {view === 'bookings' && <Bookings />}
        {view === 'profile' && <Profile />}
      </main>
    </div>
  );
}
