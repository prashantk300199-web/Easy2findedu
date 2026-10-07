import { motion } from 'framer-motion';
import type { PetListing, PetListingKind } from '../../services/aiPet.service';

interface Props {
  listing: PetListing;
  kind: PetListingKind;
}

const KIND_LABEL: Record<PetListingKind, string> = {
  hostel: 'Hostel',
  institute: 'Institute',
  college: 'College',
  course: 'Course',
};

function listingKindFromUrl(url: string): PetListingKind {
  if (url.startsWith('/hostels')) return 'hostel';
  if (url.startsWith('/institutes')) return 'institute';
  if (url.startsWith('/colleges')) return 'college';
  return 'course';
}

const formatRupees = (n?: number) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `₹${n}`;
};

const FacilityPill = ({ ok, label }: { ok: boolean | undefined; label: string }) =>
  ok ? (
    <span className="inline-flex items-center gap-1 border border-gold-500/40 bg-cream-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-700">
      <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
      </svg>
      {label}
    </span>
  ) : null;

export function AIPetCard({ listing, kind }: Props) {
  const resolvedKind: PetListingKind = kind || listingKindFromUrl(listing.detailUrl || '');
  const subtitle =
    listing.area || listing.city || listing.fullAddress || listing.stream || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="my-1.5 overflow-hidden border border-cream-300 bg-cream-100 shadow-lift"
    >
      <div className="flex items-center justify-between gap-2 border-b border-cream-300 bg-cream-50 px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide2 text-gold-700">
          {KIND_LABEL[resolvedKind]}
        </span>
        {typeof listing.rating === 'number' && listing.rating > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-700">
            <svg className="h-3 w-3 text-gold-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 1l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 14.8 4.8 17.3l1-5.9L1.5 7.2l5.9-.9L10 1z" />
            </svg>
            {listing.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="px-4 py-3">
        <h4 className="font-display text-[17px] leading-tight text-night-900 line-clamp-2">
          {listing.name || listing.courseName || 'Listing'}
        </h4>

        {subtitle && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-500">
            <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 2a6 6 0 016 6c0 4.4-6 10-6 10S4 12.4 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="truncate">{subtitle}</span>
          </p>
        )}

        {/* Price / fees line — kind-specific */}
        {resolvedKind === 'hostel' && listing.monthlyRent && listing.monthlyRent > 0 && (
          <p className="mt-2 text-[12px] text-night-800">
            <span className="font-display text-[15px] font-semibold text-gold-700">
              {formatRupees(listing.monthlyRent)}/mo
            </span>
            {listing.hostelType && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-500">
                {listing.hostelType === 'co_ed' ? 'Co-ed' : listing.hostelType}
              </span>
            )}
          </p>
        )}

        {resolvedKind === 'college' && listing.feeStructure && (
          <p className="mt-2 text-[12px] text-night-800">
            <span className="font-display text-[15px] font-semibold text-gold-700">
              {listing.feeStructure.tuitionMin
                ? formatRupees(listing.feeStructure.tuitionMin)
                : '—'}
              {listing.feeStructure.tuitionMax &&
              listing.feeStructure.tuitionMax !== listing.feeStructure.tuitionMin
                ? ` – ${formatRupees(listing.feeStructure.tuitionMax)}`
                : ''}
              /yr
            </span>
            {listing.collegeType && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-500">
                {listing.collegeType}
              </span>
            )}
          </p>
        )}

        {resolvedKind === 'institute' && listing.establishedYear && (
          <p className="mt-2 text-[12px] text-night-800">
            <span className="font-display text-[15px] font-semibold text-gold-700">
              Est. {listing.establishedYear}
            </span>
            {listing.courses?.length ? (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-500">
                {listing.courses.slice(0, 2).join(' · ')}
              </span>
            ) : null}
          </p>
        )}

        {resolvedKind === 'course' && (
          <p className="mt-2 text-[12px] text-night-800">
            <span className="font-display text-[15px] font-semibold text-gold-700">
              {listing.degreeType || 'Course'}
            </span>
            {listing.duration && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-500">
                {listing.duration.value} {listing.duration.unit}
              </span>
            )}
          </p>
        )}

        {/* Facility pills — only for hostels */}
        {resolvedKind === 'hostel' && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <FacilityPill ok={listing.hasWiFi} label="Wi-Fi" />
            <FacilityPill ok={listing.hasFood} label="Food" />
            <FacilityPill ok={listing.hasAC} label="AC" />
            <FacilityPill ok={listing.security?.cctv} label="CCTV" />
            <FacilityPill ok={listing.security?.guard} label="Guard" />
            <FacilityPill ok={listing.security?.biometric} label="Biometric" />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-cream-300">
          <a
            href={listing.detailUrl}
            className="flex flex-1 items-center justify-between gap-2 px-1 py-2 text-[11px] uppercase tracking-wide2 text-night-800 transition-colors duration-300 hover:text-gold-700"
          >
            View listing
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default AIPetCard;