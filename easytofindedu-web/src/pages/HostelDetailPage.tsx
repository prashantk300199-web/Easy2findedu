import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchHostel, fetchHostels } from '../lib/api';
import { useAsync } from '../lib/useAsync';
import {
  bedsAvailable, hostelPlace, hostelTypeLabel, humanise, imageUrl, inr, rentFrom,
} from '../lib/format';
import { ErrorNote, Section, Spinner, Tag } from '../components/primitives';
import { LineReveal, Reveal } from '../components/motion';
import { Figure } from '../components/Figure';
import type { Hostel } from '../lib/types';
import { ReviewSystem, CompactReviewDisplay } from '../components/ReviewSystem';
import { FAQSection, DEFAULT_HOSTEL_FAQS } from '../components/FAQSection';
import { WishlistButton } from '../components/WishlistButton';
import { SimilarHostelsCarousel } from '../components/SimilarHostelsCarousel';
import { WardenUnlock } from '../components/WardenUnlock';
import { ScheduleVisit } from '../components/ScheduleVisit';
import { useAuth } from '../contexts/AuthContext';

/* ─── lookup maps ─────────────────────────────────────────── */
const LEGAL_LABELS: Record<string, string> = {
  hostel_registration: 'Hostel Registration',
  form_3: 'Form 3',
  food_license: 'Food License',
  character_certificate: 'Character Certificate',
  trade_license: 'Trade License',
  fire_noc: 'Fire NOC',
};
const SECURITY_LABELS: Record<string, string> = {
  full_time_warden: 'Full-time Warden',
  cctv: 'CCTV Surveillance',
  security_guard_24x7: '24x7 Security Guard',
  biometric_entry: 'Biometric Entry',
  visitor_register: 'Visitor Register',
  first_aid_kit: 'First Aid Kit',
};
const MEAL_FREQ: Record<string, string> = {
  '1_time': 'Once a day', '2_times': 'Twice a day',
  '3_times': '3 times a day', '4_times': '4 times a day',
};
const SERVICE_TYPE: Record<string, string> = {
  tiffin_service: 'Tiffin Service', mess_service: 'Mess Service', canteen: 'Canteen',
};
const MEAL_TYPE: Record<string, string> = {
  veg: 'Veg Catering', non_veg: 'Non-Veg Available', both: 'Veg & Non-Veg',
};
const DEPOSIT_LABEL: Record<string, string> = {
  one_month_fee: 'One Month Rent', two_month_fee: 'Two Month Rent', fixed_amount: 'Fixed Amount',
};
const GUEST_LABEL: Record<string, string> = {
  family_only: 'Family Members Only', no_guests: 'No Guests Allowed',
  allowed: 'Guests Allowed', prior_permission: 'Prior Permission Required',
};

const travelMin = (km: number) => Math.max(1, Math.round(km * 10));

/* ─── tab nav ─────────────────────────────────────────────── */
const TABS = [
  { id: 'rooms', label: 'Rooms' }, { id: 'amenities', label: 'Amenities' },
  { id: 'food', label: 'Food' }, { id: 'distance', label: 'Distance' },
  { id: 'building', label: 'Building' }, { id: 'compliance', label: 'Compliance' },
  { id: 'rules', label: 'Rules' }, { id: 'contact', label: 'Contact' },
];
function TabNav() {
  return (
    <nav className="sticky top-[76px] z-20 -mx-6 overflow-x-auto bg-cream/90 backdrop-blur-xl md:-mx-12">
      <div className="flex min-w-max gap-0 border-b border-cream-300 px-6 md:px-12">
        {TABS.map((tab) => (
          <a key={tab.id} href={`#${tab.id}`}
            className="shrink-0 border-b-2 border-transparent px-5 py-4 text-[11px] uppercase tracking-wide2 text-ink-500 transition-colors duration-300 hover:border-gold-500 hover:text-night-800">
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ─── section wrapper ─────────────────────────────────────── */
function Sec({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 border-t border-cream-300 pt-12 pb-12">
      <h2 className="overline text-gold-700">{title}</h2>
      <div className="mt-7">{children}</div>
    </div>
  );
}

/* ─── rooms ───────────────────────────────────────────────── */
function RoomsSection({ hostel }: { hostel: Hostel }) {
  const rooms = (hostel.rooms ?? []).filter((r) => r.room_type);
  if (!rooms.length) return null;
  return (
    <Sec id="rooms" title="Room Configurations">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, i) => (
          <Reveal key={i} delay={i * 70}>
            <div className="border border-cream-300 bg-cream-50 p-6 shadow-lift">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-[19px] text-night-800">
                  {humanise(room.room_type ?? '')}
                  {room.ac && <span className="ml-2 text-xs text-gold-700"> AC</span>}
                </h3>
                {room.is_available === false && (
                  <span className="shrink-0 bg-cream-300 px-2.5 py-1 text-[9px] uppercase tracking-wide2 text-ink-500">Full</span>
                )}
              </div>
              <p className="mt-2 font-display text-2xl text-gold-700">
                {room.monthly_rent ? inr.format(room.monthly_rent) : 'On request'}
                <span className="font-sans text-xs text-ink-400"> /month per bed</span>
              </p>
              <div className="mt-5 space-y-2 border-t border-cream-300 pt-4 text-xs text-ink-500">
                {room.total_beds ? <p>Capacity: {room.total_beds} beds</p> : null}
                {(room.available_beds_count ?? 0) > 0
                  ? <p className="text-gold-700">{room.available_beds_count} bed{(room.available_beds_count ?? 0) > 1 ? 's' : ''} available</p>
                  : <p className="text-wine">No beds available</p>
                }
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      {(hostel.rent?.security_deposit_type || hostel.rent?.registration_fee) && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 border-t border-cream-300 pt-8">
          {hostel.rent?.security_deposit_type && (
            <div>
              <p className="overline">Security Deposit</p>
              <p className="mt-2 font-display text-xl text-night-800">
                {DEPOSIT_LABEL[hostel.rent.security_deposit_type] ?? humanise(hostel.rent.security_deposit_type)}
              </p>
              <p className="mt-1 text-xs text-ink-400">Refundable on tenure completion</p>
            </div>
          )}
          {hostel.rent?.registration_fee ? (
            <div>
              <p className="overline">Registration Fee</p>
              <p className="mt-2 font-display text-xl text-night-800">{inr.format(hostel.rent.registration_fee)}</p>
              <p className="mt-1 text-xs text-ink-400">One-time, non-refundable</p>
            </div>
          ) : null}
        </div>
      )}
    </Sec>
  );
}

/* ─── amenities ───────────────────────────────────────────── */

const AMENITY_GROUPS: Record<string, string[]> = {
  'Room Amenities': [
    'bed', 'mattress', 'wardrobe', 'study_table', 'study_chair', 'bookshelf',
    'fan', 'ac', 'air_cooler', 'room_heater', 'curtains', 'attached_bathroom',
    'balcony', 'tv', 'shoe_rack', 'mirror',
  ],
  'Common Facilities': [
    'wifi', 'geyser', 'ro_water', 'water_cooler', 'electricity_backup',
    'inverter_backup', 'refrigerator', 'induction', 'tiffin_service',
    'washing_machine', 'paid_laundry_service', 'drying_area',
    'daily_room_cleaning', 'parking', 'terrace_access', 'newspaper_magazine',
  ],
  'Security': [
    'full_time_warden', 'cctv', 'security_guard_24x7', 'biometric_entry',
    'visitor_register', 'first_aid_kit',
  ],
};

function AmenitiesSection({ hostel }: { hostel: Hostel }) {
  const inRoom = new Set(hostel.in_room_amenities ?? []);
  const common = new Set(hostel.common_amenities ?? []);
  const security = hostel.security ?? {};

  const isPresent = (group: string, key: string): boolean => {
    if (group === 'Security') return Boolean((security as Record<string, boolean>)[key]);
    if (group === 'Room Amenities') return inRoom.has(key);
    return common.has(key);
  };

  return (
    <Sec id="amenities" title="All Amenities">
      <div className="space-y-10">
        {Object.entries(AMENITY_GROUPS).map(([group, keys]) => (
          <div key={group}>
            <p className="mb-4 text-[11px] uppercase tracking-wide2 text-night-800">{group}</p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map((key) => {
                const present = isPresent(group, key);
                return (
                  <li
                    key={key}
                    className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors duration-300 ${
                      present
                        ? 'border-green-200 bg-green-50 text-green-900'
                        : 'border-cream-300 bg-cream-50 text-ink-400'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                        present ? 'bg-green-500 text-white' : 'bg-cream-300 text-ink-400'
                      }`}
                    >
                      {present ? '✓' : '✗'}
                    </span>
                    <span className={present ? 'font-medium' : 'line-through decoration-ink-300/50'}>
                      {humanise(key)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Sec>
  );
}

/* ─── food ────────────────────────────────────────────────── */
function FoodSection({ hostel }: { hostel: Hostel }) {
  const plans = hostel.meal_plans ?? [];
  if (!plans.length) return null;
  return (
    <Sec id="food" title="Food & Refreshments">
      {plans.map((plan, i) => (
        <div key={i} className="grid gap-5 sm:grid-cols-3">
          <div className="bg-cream-50 border border-cream-300 p-6">
            <p className="overline">Meal Type</p>
            <p className="mt-3 font-display text-xl text-night-800">
              {MEAL_TYPE[plan.meal_type ?? ''] ?? humanise(plan.meal_type ?? 'Meals')}
            </p>
          </div>
          <div className="bg-cream-50 border border-cream-300 p-6">
            <p className="overline">Frequency</p>
            <p className="mt-3 font-display text-xl text-night-800">
              {MEAL_FREQ[plan.frequency ?? ''] ?? humanise(plan.frequency ?? '')}
            </p>
          </div>
          <div className="bg-cream-50 border border-cream-300 p-6">
            <p className="overline">Service</p>
            <p className="mt-3 font-display text-xl text-night-800">
              {SERVICE_TYPE[plan.service_type ?? ''] ?? humanise(plan.service_type ?? '')}
            </p>
          </div>
        </div>
      ))}
    </Sec>
  );
}

/* ─── distance ────────────────────────────────────────────── */
function DistanceSection({ hostel }: { hostel: Hostel }) {
  const institutes = hostel.nearby_distances?.institutes ?? [];
  const landmarks = hostel.nearby_distances?.landmarks ?? [];
  if (!institutes.length && !landmarks.length) return null;

  function Row({ name, km }: { name?: string; km?: number }) {
    return (
      <li className="flex items-baseline justify-between gap-4 border-b border-cream-300 py-4 last:border-0">
        <span className="text-sm text-night-800">{name}</span>
        {km != null && (
          <span className="shrink-0 text-[11px] text-ink-400 tabular-nums">
            {km} km · {travelMin(km)} min
          </span>
        )}
      </li>
    );
  }

  return (
    <Sec id="distance" title="Distance from Landmarks">
      <div className="grid gap-10 sm:grid-cols-2">
        {institutes.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide2 text-night-800 mb-2">Nearby Institutes</p>
            <ul>{institutes.map((n, i) => <Row key={i} name={n.name} km={n.distance_km} />)}</ul>
          </div>
        )}
        {landmarks.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide2 text-night-800 mb-2">City Landmarks</p>
            <ul>{landmarks.map((n, i) => <Row key={i} name={n.name} km={n.distance_km} />)}</ul>
          </div>
        )}
      </div>
    </Sec>
  );
}

/* ─── building ────────────────────────────────────────────── */
function BuildingSection({ hostel }: { hostel: Hostel }) {
  const b = hostel.building_details;
  const w = hostel.washroom_details;
  const rows: { label: string; value: string | null }[] = [
    { label: 'Built Year', value: b?.building_age_years != null ? String(b.building_age_years) : null },
    { label: 'Flooring', value: b?.flooring_type ? humanise(b.flooring_type) : null },
    { label: 'Total Floors', value: b?.number_of_floors ? `${b.number_of_floors} Floor(s)` : null },
    { label: 'Notice Period', value: hostel.notice_period_days ? `${hostel.notice_period_days} Days` : null },
    { label: 'Total Beds', value: hostel.total_hostel_beds ? String(hostel.total_hostel_beds) : null },
    { label: 'Total Washrooms', value: w?.total_washrooms ? String(w.total_washrooms) : null },
    { label: 'Washroom Ratio', value: w?.washroom_to_student_ratio ?? null },
  ].filter(r => r.value !== null);
  if (!rows.length) return null;
  return (
    <Sec id="building" title="Building & Infrastructure">
      <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(r => (
          <div key={r.label} className="border-b border-cream-300 py-5">
            <dt className="text-[10px] uppercase tracking-wide2 text-ink-400">{r.label}</dt>
            <dd className="mt-2 font-display text-xl text-night-800">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Sec>
  );
}

/* ─── compliance ──────────────────────────────────────────── */
function ComplianceSection({ hostel }: { hostel: Hostel }) {
  const legal = hostel.legal_docs;
  if (!legal) return null;
  const entries = Object.entries(legal).filter(([key]) => LEGAL_LABELS[key]);
  if (!entries.length) return null;
  return (
    <Sec id="compliance" title="Compliance & Verification">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, verified]) => (
          <div key={key}
            className={`flex items-center gap-4 border p-5 ${verified ? 'border-gold-500/50 bg-gold-100' : 'border-cream-300 bg-cream-50'}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center text-[13px] font-bold ${verified ? 'bg-gold-500 text-night-800' : 'bg-cream-300 text-ink-400'}`}>
              {verified ? '✓' : '–'}
            </span>
            <div>
              <p className={`text-[10px] uppercase tracking-wide2 ${verified ? 'text-gold-700' : 'text-ink-400'}`}>
                {verified ? 'Verified' : 'Pending'}
              </p>
              <p className="mt-0.5 text-sm text-night-800">{LEGAL_LABELS[key]}</p>
            </div>
          </div>
        ))}
        {/* Hostel Welfare Association Member Badge */}
        <div className="flex items-center gap-4 border p-5 border-gold-500/50 bg-gold-100">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[13px] font-bold bg-gold-500 text-night-800">
            ✓
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wide2 text-gold-700">
              Verified
            </p>
            <p className="mt-0.5 text-sm text-night-800">Member of Hostel Welfare Association</p>
          </div>
        </div>
      </div>
    </Sec>
  );
}

/* ─── rules ───────────────────────────────────────────────── */
function RulesSection({ hostel }: { hostel: Hostel }) {
  const r = hostel.rules;
  if (!r) return null;
  const rows = [
    { label: 'Gate Close Time', value: r.gate_close_time ?? null },
    { label: 'Late Entry', value: r.late_entry_allowed != null ? (r.late_entry_allowed ? 'Allowed' : 'Not Allowed') : null },
    { label: 'Smoking', value: r.smoking_allowed != null ? (r.smoking_allowed ? 'Allowed' : 'Not Allowed') : null },
    { label: 'Alcohol', value: r.alcohol_allowed != null ? (r.alcohol_allowed ? 'Allowed' : 'Not Allowed') : null },
    { label: 'Guest Policy', value: GUEST_LABEL[r.guest_policy ?? ''] ?? (r.guest_policy ? humanise(r.guest_policy) : null) },
    { label: 'Pets', value: r.pets_allowed != null ? (r.pets_allowed ? 'Allowed' : 'Not Allowed') : null },
  ].filter(row => row.value);
  const custom = r.custom_rules ?? [];
  if (!rows.length && !custom.length) return null;
  return (
    <Sec id="rules" title="Rules & Policies">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(row => (
          <div key={row.label} className="border-b border-cream-300 py-5">
            <p className="text-[10px] uppercase tracking-wide2 text-ink-400">{row.label}</p>
            <p className="mt-2 text-sm text-night-800">{row.value}</p>
          </div>
        ))}
      </div>
      {custom.length > 0 && (
        <div className="mt-8 border-t border-cream-300 pt-6">
          <p className="text-[10px] uppercase tracking-wide2 text-ink-400 mb-4">Additional Rules</p>
          <ul className="space-y-3">
            {custom.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-night-800">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sec>
  );
}

/* ─── contact / management ────────────────────────────────── */
function ContactSection({ hostel }: { hostel: Hostel }) {
  const warden = hostel.warden;
  const security = hostel.security;
  const securityItems = Object.entries(security ?? {}).filter(([k, on]) => on && SECURITY_LABELS[k]);
  return (
    <Sec id="contact" title="Management Details">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Warden box - hidden, use WardenUnlock component instead */}
        {warden && (warden.name || warden.contact_number) && (
          <div className="bg-night-900 p-8 text-cream-100">
            <WardenUnlock hostelId={hostel._id} warden={warden} />
          </div>
        )}
        {/* Security features */}
        {securityItems.length > 0 && (
          <div className="bg-cream-50 border border-cream-300 p-8">
            <p className="overline">Safety Measures</p>
            <ul className="mt-5 space-y-3">
              {securityItems.map(([key]) => (
                <li key={key} className="flex items-center gap-3 text-sm text-night-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-gold-500 text-[11px] font-bold text-night-800">✓</span>
                  {SECURITY_LABELS[key]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Address */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 border-t border-cream-300 pt-8">
        {hostel.address?.line1 && (
          <div>
            <p className="overline">Address</p>
            <p className="mt-3 text-sm text-night-800 leading-relaxed">
              {hostel.address.line1}
              {hostel.address.area ? `, ${hostel.address.area}` : ''}
              {hostel.address.city ? `, ${hostel.address.city}` : ''}
              {hostel.address.pincode ? ` – ${hostel.address.pincode}` : ''}
            </p>
          </div>
        )}
        <div>
          <p className="overline">Location Privacy</p>
          <p className="mt-3 text-sm text-ink-500 leading-relaxed">
            Exact coordinates are withheld for resident safety. Full address is shared after direct enquiry to the warden.
          </p>
        </div>
      </div>
    </Sec>
  );
}

/* ─── similar hostel card (sidebar) ──────────────────────── */
function SimilarCard({ hostel }: { hostel: Hostel }) {
  const rent = rentFrom(hostel);
  return (
    <Link to={`/hostels/${hostel.slug}`}
      className="group flex gap-4 border-b border-cream-300 py-5 last:border-0">
      <div className="h-20 w-24 shrink-0 overflow-hidden">
        <Figure src={imageUrl(hostel.photos?.[0])} alt={hostel.name} name={hostel.name} ratio="aspect-[4/3]" />
      </div>
      <div>
        <h4 className="font-display text-base text-night-800 group-hover:text-gold-700 transition-colors duration-300 leading-snug">
          {hostel.name}
        </h4>
        <p className="mt-1 text-xs text-ink-500">{hostelPlace(hostel)}</p>
        {rent && <p className="mt-2 font-display text-sm text-gold-700">{inr.format(rent)}/mo</p>}
      </div>
    </Link>
  );
}

/* ─── page ────────────────────────────────────────────────── */
export function HostelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useAsync((signal) => fetchHostel(slug!, signal), [slug]);
  const similar = useAsync((signal) => fetchHostels(20, signal), []);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);

  if (loading) return <Section className="py-32"><Spinner label="Loading hostel" /></Section>;
  if (error) return <Section className="py-24"><ErrorNote message={error} /></Section>;
  if (!data) return null;

  const hostel = data;
  const photos = (hostel.photos ?? []).map(imageUrl).filter((u): u is string => Boolean(u));
  const rent = rentFrom(hostel);
  const available = bedsAvailable(hostel);

  const nearbyHostels = (similar.data?.items ?? [])
    .filter(h => h.slug !== hostel.slug && h.address?.area === hostel.address?.area)
    .slice(0, 5);

  return (
    <>
      <Section className="pt-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
          <Link to="/" className="hover:text-gold-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/hostels" className="hover:text-gold-700 transition-colors">Hostels</Link>
          {hostel.address?.area && <><span>/</span><span>{hostel.address.area}</span></>}
          {hostel.address?.city && <><span>/</span><span>{hostel.address.city}</span></>}
        </nav>

        {/* Header */}
        <header className="mt-8 border-t border-night-800 pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Tag>{hostelTypeLabel(hostel.hostel_type)}</Tag>
            <span className="text-[10px] uppercase tracking-wide2 text-gold-700 border border-gold-500/40 px-3 py-1.5">
              ✓ Verified Residency
            </span>
            <WishlistButton itemId={hostel._id} itemType="hostel" />
            {(hostel as any).offer && (
              <span className="bg-red-500 text-white text-[10px] uppercase tracking-wide px-3 py-1.5 font-bold">
                {(hostel as any).offer}
              </span>
            )}
          </div>

          <LineReveal as="h1" className="mt-6 font-display text-d2 text-night-800" lines={[<>{hostel.name}</>]} />
          <p className="mt-3 text-sm text-ink-500">{hostelPlace(hostel)}</p>

          {/* Review stars near hostel name */}
          <div className="mt-3">
            <CompactReviewDisplay rating={(hostel as any).averageRating ?? 4.2} reviewCount={(hostel as any).totalReviews ?? 0} />
          </div>

          {/* Quick stats */}
          <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t border-cream-300 pt-8 md:grid-cols-4">
            {rent && (
              <div>
                <dd className="font-display text-3xl text-gold-700">{inr.format(rent)}</dd>
                <dt className="overline mt-2">Starting / month</dt>
              </div>
            )}
            {hostel.total_hostel_beds ? (
              <div>
                <dd className="font-display text-3xl text-night-800">{hostel.total_hostel_beds}</dd>
                <dt className="overline mt-2">Total capacity</dt>
              </div>
            ) : null}
            {hostel.washroom_details?.total_washrooms ? (
              <div>
                <dd className="font-display text-3xl text-night-800">{hostel.washroom_details.total_washrooms}</dd>
                <dt className="overline mt-2">
                  Washrooms {hostel.washroom_details.washroom_to_student_ratio ? `(${hostel.washroom_details.washroom_to_student_ratio})` : ''}
                </dt>
              </div>
            ) : null}
            {hostel.building_details?.number_of_floors ? (
              <div>
                <dd className="font-display text-3xl text-night-800">{hostel.building_details.number_of_floors}</dd>
                <dt className="overline mt-2">Storeys</dt>
              </div>
            ) : null}
          </dl>
        </header>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="mt-12">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <Figure src={photos[0]} alt={hostel.name} name={hostel.name} ratio="aspect-[16/11]" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                {photos.slice(1, 3).map((src, i) => (
                  <Figure key={src} src={src} alt={`${hostel.name} photo ${i + 2}`} name={hostel.name} ratio="aspect-[4/3]" />
                ))}
              </div>
            </div>
            {photos.length > 3 && (
              <div>
                {!showAllPhotos ? (
                  <button onClick={() => setShowAllPhotos(true)}
                    className="mt-4 text-[11px] uppercase tracking-wide2 text-gold-700 hover:text-night-800 transition-colors duration-300">
                    View all {photos.length} photos ↓
                  </button>
                ) : (
                  <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {photos.slice(3).map((src, i) => (
                      <Figure key={src} src={src} alt={`${hostel.name} photo ${i + 4}`} name={hostel.name} ratio="aspect-[4/3]" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Tab bar */}
      <Section as="div" className="mt-10">
        <TabNav />
      </Section>

      {/* Main content + sticky sidebar */}
      <Section className="py-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_340px]">
          {/* Left column — all detail sections */}
          <div>
            {hostel.description && (
              <Reveal>
                <div className="border-t border-cream-300 pt-12 pb-10">
                  <h2 className="overline text-gold-700">Profile Overview</h2>
                  <p className="mt-6 whitespace-pre-line font-display text-xl leading-relaxed text-ink-700">
                    {hostel.description}
                  </p>
                </div>
              </Reveal>
            )}
            <RoomsSection hostel={hostel} />
            <AmenitiesSection hostel={hostel} />
            <FoodSection hostel={hostel} />
            <DistanceSection hostel={hostel} />
            <BuildingSection hostel={hostel} />
            <ComplianceSection hostel={hostel} />
            <RulesSection hostel={hostel} />
            <ContactSection hostel={hostel} />

            {/* FAQs */}
            <div id="faqs" className="scroll-mt-28 border-t border-cream-300 pt-12 pb-12">
              <FAQSection faqs={DEFAULT_HOSTEL_FAQS} />
            </div>

            {/* Similar Hostels Carousel */}
            {similar.data?.items && (
              <SimilarHostelsCarousel
                hostels={similar.data.items}
                currentHostelId={hostel._id}
              />
            )}

            {/* Reviews */}
            <div id="reviews" className="scroll-mt-28 border-t border-cream-300 pt-12 pb-12">
              <ReviewSystem
                hostelId={hostel._id}
                reviews={reviews}
                averageRating={(hostel as any).averageRating ?? 4.2}
                totalReviews={(hostel as any).totalReviews ?? 0}
                onReviewSubmit={async (rating, comment) => {
                  const token = getToken();
                  const res = await fetch(`https://easytofindedu.onrender.com/api/v1/hostels/${hostel._id}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    credentials: 'include',
                    body: JSON.stringify({ rating, comment }),
                  });
                  if (!res.ok) throw new Error('Failed');
                  const data = await res.json();
                  setReviews((prev) => [data.review ?? { _id: Date.now().toString(), user: { name: 'You' }, rating, comment, createdAt: new Date().toISOString() }, ...prev]);
                }}
              />
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Availability + call CTA */}
              <div className="bg-night-900 p-8 text-cream-100">
                {rent && (
                  <>
                    <p className="overline-light">Starting from</p>
                    <p className="mt-3 font-display text-4xl text-gold-400">{inr.format(rent)}</p>
                    <p className="mt-1 text-sm text-cream-100/50">per month per bed</p>
                  </>
                )}
                <div className="mt-6 border-t border-gold-500/20 pt-5 space-y-2">
                  {available > 0
                    ? <p className="text-gold-400 text-sm">✓ {available} bed{available > 1 ? 's' : ''} available</p>
                    : <p className="text-cream-100/50 text-sm">Currently full — check back soon</p>
                  }
                  {hostel.total_hostel_beds && (
                    <p className="text-xs text-cream-100/40">Total capacity: {hostel.total_hostel_beds} beds</p>
                  )}
                </div>
                {hostel.warden && (hostel.warden.name || hostel.warden.contact_number) && (
                  <WardenUnlock hostelId={hostel._id} warden={hostel.warden} />
                )}
                <div className="mt-6 pt-6 border-t border-gold-500/20">
                  <ScheduleVisit propertyId={hostel._id} propertyType="hostel" propertyName={hostel.name} />
                </div>
              </div>

              {/* Similar hostels in same area */}
              {nearbyHostels.length > 0 && (
                <div className="border border-cream-300 bg-cream-50 p-6">
                  <p className="overline">Similar in {hostel.address?.area}</p>
                  <div className="mt-5">
                    {nearbyHostels.map(h => <SimilarCard key={h._id} hostel={h} />)}
                  </div>
                  <Link to="/hostels" className="mt-6 block text-[11px] uppercase tracking-wide2 text-gold-700 hover:text-night-800 transition-colors">
                    View all hostels →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
