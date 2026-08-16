import type { CloudinaryImage, Hostel, Institute } from './types';

export function imageUrl(img?: CloudinaryImage | string | null): string | null {
  if (!img) return null;
  const raw = typeof img === 'string' ? img : img.url;
  if (!raw) return null;
  // Several college records carry a dummyimage.com placeholder rather than a real asset.
  if (raw.includes('dummyimage.com') || raw.includes('placeholder')) return null;
  return raw.trim() || null;
}

export function cityName(institute: Institute): string | null {
  const city = institute.location?.city;
  if (city && typeof city === 'object') return city.name;
  return institute.location?.cityName ?? null;
}

export function areaName(institute: Institute): string | null {
  const area = institute.location?.area;
  if (area && typeof area === 'object') return area.name;
  return institute.location?.areaName ?? null;
}

export function placeLine(institute: Institute): string {
  return [areaName(institute), cityName(institute)].filter(Boolean).join(', ');
}

const FACILITY_LABELS: Record<string, string> = {
  smartClass: 'Smart classrooms',
  wifiCampus: 'Campus Wi-Fi',
  biometricAttendance: 'Biometric attendance',
  cctv: 'CCTV monitored',
  library: 'Library',
  hostel: 'Hostel',
  canteen: 'Canteen',
  parking: 'Parking',
  acClassroom: 'Air-conditioned rooms',
  generatorBackup: 'Power backup',
  doubtFaculty: 'Doubt-clearing faculty',
  recordedLecture: 'Recorded lectures',
  testSeries: 'Test series',
  mockTest: 'Mock tests',
  parentMonitoring: 'Parent monitoring',
  firstAidKit: 'First aid',
  studentSupport: 'Student support',
  careerCounseling: 'Career counselling',
  digitalBoard: 'Digital boards',
  appAccess: 'App access',
};

export function facilityList(institute: Institute): string[] {
  const f = institute.facilities;
  if (!f) return [];
  return Object.entries(f)
    .filter(([key, on]) => on && FACILITY_LABELS[key])
    .map(([key]) => FACILITY_LABELS[key]);
}

export function initials(name: string): string {
  return name
    .replace(/[^a-zA-Z ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Cheapest advertised monthly rent across a hostel's room types. */
export function rentFrom(hostel: Hostel): number | null {
  const rents = (hostel.rooms ?? [])
    .map((r) => r.monthly_rent)
    .filter((r): r is number => typeof r === 'number' && r > 0);
  return rents.length ? Math.min(...rents) : null;
}

export function bedsAvailable(hostel: Hostel): number {
  return (hostel.rooms ?? []).reduce((sum, r) => sum + (r.available_beds_count ?? 0), 0);
}

export function hostelPlace(hostel: Hostel): string {
  return [hostel.address?.area, hostel.address?.city].filter(Boolean).join(', ');
}

/** snake_case amenity keys -> readable labels. */
export function humanise(token: string): string {
  return token
    .replace(/_/g, ' ')
    .replace(/\b24x7\b/gi, '24×7')
    .replace(/\bwifi\b/gi, 'Wi-Fi')
    .replace(/\bac\b/gi, 'AC')
    .replace(/\btv\b/gi, 'TV')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function hostelTypeLabel(type?: string): string {
  if (!type) return 'Hostel';
  if (type === 'girls') return "Women's";
  if (type === 'boys') return "Men's";
  if (type === 'co-ed' || type === 'coed') return 'Co-ed';
  return humanise(type);
}

import { COLLEGE_REAL_PHOTOS, IMG } from './images';
import type { College } from './types';

/**
 * Returns the best available photo for a college:
 *   1. Real building photo fetched from the college's own website (5 colleges)
 *   2. Real logo if it's not a dummyimage.com placeholder
 *   3. Category Unsplash fallback by collegeType
 */
export function getCollegeImage(college: College): string {
  // 1. Real building photo from the college's own site
  if (COLLEGE_REAL_PHOTOS[college._id]) {
    return COLLEGE_REAL_PHOTOS[college._id];
  }

  // 2. Real logo (skip dummyimage.com placeholders)
  const logo = imageUrl(college.logo);
  if (logo) return logo;

  // 3. Category Unsplash fallback
  const type = (college.collegeType ?? '').toLowerCase();

  if (/nursing|medical|paramedical|health|anm/.test(type)) {
    const digit = parseInt(college._id.slice(-1), 16) % 3;
    return [IMG.college.nursing1, IMG.college.nursing2, IMG.college.nursing3][digit];
  }

  if (/it|business|computer|software|tech|bca|bba/.test(type)) {
    const digit = parseInt(college._id.slice(-1), 16) % 2;
    return [IMG.college.it1, IMG.college.it2][digit];
  }

  const digit = parseInt(college._id.slice(-1), 16) % 3;
  return [IMG.college.general1, IMG.college.general2, IMG.college.general3][digit];
}
