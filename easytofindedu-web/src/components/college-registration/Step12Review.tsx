import { useState } from 'react';
import { Edit2, CheckCircle } from 'lucide-react';

interface StepProps {
  formData: any;
  loading: boolean;
  onNext: (data: any) => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

function Section({ title, stepNumber, onEdit, children }: any) {
  return (
    <div className="border border-night-700 p-5 bg-night-900/40 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl text-white">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit && stepNumber && onEdit(stepNumber)}
          className="flex items-center gap-1 text-[#D9C08E] text-sm hover:underline"
        >
          <Edit2 size={14} /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="border-t border-night-800 py-2 grid grid-cols-3 gap-3">
      <div className="overline">{label}</div>
      <div className="col-span-2 text-sm text-white/80">{value || '—'}</div>
    </div>
  );
}

export default function Step12Review({ formData, loading, onNext, onBack, onEdit }: StepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s1 = formData.step1 || {};
  const s2 = formData.step2 || {};
  const s3 = formData.step3 || {};
  const s4 = formData.step4 || {};
  const s5 = formData.step5 || {};
  const s6 = formData.step6 || {};
  const s7 = formData.step7 || {};
  const s8 = formData.step8 || {};
  const s9 = formData.step9 || {};
  const s10 = formData.step10 || {};
  const s11 = formData.step11 || {};

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please confirm that the information is accurate.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onNext({});
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-night-800 border border-night-700 p-8 rounded-lg shadow-2xl">
      <h2 className="font-display text-3xl text-white mb-2">Review & Submit</h2>
      <p className="text-white/70 mb-8">Please review all information before submitting for verification.</p>

      <Section title="College Basic Information" step={onEdit} arg={1}>
        <Row label="College Name" value={s1.collegeName} />
        <Row label="Short Name" value={s1.shortName} />
        <Row label="Institution Type" value={s1.institutionType} />
        <Row label="Ownership" value={s1.ownershipType} />
        <Row label="Established" value={s1.establishedYear} />
        <Row label="About" value={s1.about} />
        <Row label="Website" value={s1.website} />
      </Section>

      <Section title="Location & Campus" step={onEdit} arg={2}>
        <Row label="Full Address" value={s2.fullAddress} />
        <Row label="City" value={s2.city} />
        <Row label="District" value={s2.district} />
        <Row label="State" value={s2.state} />
        <Row label="PIN Code" value={s2.pincode} />
      </Section>

      <Section title="Affiliation & Recognition" step={onEdit} arg={3}>
        <Row label="Affiliated University" value={s3.affiliatedUniversity} />
        <Row label="UGC / AICTE / NAAC / NBA" value={
          [
            s3.ugcRecognized && 'UGC',
            s3.aicteApproved && 'AICTE',
            s3.naacAccredited && 'NAAC',
            s3.nbaAccredited && 'NBA',
          ].filter(Boolean).join(', ') || '—'
        } />
        <Row label="NAAC Grade" value={s3.accreditationGrade} />
        <Row label="NIRF Rank" value={s3.nirfRank} />
      </Section>

      <Section title="Courses" step={onEdit} arg={4}>
        <Row label="Courses Added" value={`${(s4.courses || []).length} course(s)`} />
      </Section>

      <Section title="Admission & Fees" step={onEdit} arg={5}>
        <Row label="Admission Process" value={s5.admissionProcess} />
        <Row label="Entrance Exams" value={s5.entranceExams} />
      </Section>

      <Section title="Facilities" step={onEdit} arg={6}>
        <Row label="Selected Facilities" value={
          [
            s6.library && 'Library',
            s6.laboratories && 'Laboratories',
            s6.sportsFacilities && 'Sports',
            s6.cafeteria && 'Cafeteria',
            s6.auditorium && 'Auditorium',
            s6.medicalFacilities && 'Medical',
            s6.wifi && 'Wi-Fi',
            s6.transportation && 'Transportation',
            s6.clubsActivities && 'Clubs',
          ].filter(Boolean).join(', ') || '—'
        } />
      </Section>

      <Section title="Hostel" step={onEdit} arg={7}>
        <Row label="Available" value={s7.isAvailable ? 'Yes' : 'No'} />
        {s7.isAvailable && (
          <>
            <Row label="Boys / Girls" value={[s7.boysHostel && 'Boys', s7.girlsHostel && 'Girls'].filter(Boolean).join(', ')} />
            <Row label="Capacity" value={s7.totalCapacity} />
            <Row label="Monthly Fee" value={s7.hostelFees} />
          </>
        )}
      </Section>

      <Section title="Placements" step={onEdit} arg={8}>
        <Row label="Average Package" value={s8.averagePackage ? `${s8.averagePackage} LPA` : ''} />
        <Row label="Highest Package" value={s8.highestPackage ? `${s8.highestPackage} LPA` : ''} />
        <Row label="Placement Rate" value={s8.placementRate ? `${s8.placementRate}%` : ''} />
        <Row label="Top Recruiters" value={s8.topRecruiters} />
      </Section>

      <Section title="Scholarships" step={onEdit} arg={9}>
        <Row label="Scholarships Added" value={`${(s9.scholarships || []).length} scholarship(s)`} />
      </Section>

      <Section title="Gallery" step={onEdit} arg={10}>
        <Row label="Images" value={`${(s10.galleryFiles || []).length} image(s)`} />
      </Section>

      <Section title="Documents" step={onEdit} arg={11}>
        <Row label="Documents" value={`${(s11.documents || []).length} document(s)`} />
      </Section>

      {error && (
        <div className="border border-red-400/40 bg-red-400/5 text-red-300 p-3 mb-4">{error}</div>
      )}

      <div className="border-t border-night-700 pt-6">
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5" />
          <span className="text-white/80 text-sm">
            I confirm that the information provided is accurate and complete to the best of my knowledge. I understand that
            submitting false information may result in rejection or suspension of my application.
          </span>
        </label>

        <div className="flex gap-4">
          <button type="button" onClick={onBack} disabled={submitting} className="px-6 py-3 border border-night-700 text-white hover:bg-night-700 font-semibold">Previous</button>
          <button type="button" onClick={handleSubmit} disabled={!agreed || submitting || loading}
            className="flex-1 px-6 py-3 bg-gold-500 text-night-900 hover:bg-gold-400 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? 'Submitting…' : (
              <>
                <CheckCircle size={18} />
                Submit College for Verification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}