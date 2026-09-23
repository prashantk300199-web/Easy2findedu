import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { submitAnswers as apiSubmitAnswers } from '../services/career.service';
import { Action, Spinner } from '../components/primitives';
import { Magnetic } from '../components/motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WizardData {
  // Step 1: Basic
  educationLevel: string;
  state: string;
  language: string;
  // Step 2: Academic
  schoolName: string;
  board: string;
  passingYear: string;
  percentage: string;
  stream: string;
  subjects: string[];
  // UG
  collegeName: string;
  branch: string;
  currentYear: string;
  cgpa: string;
  backlogs: string;
  projects: string;
  internships: string;
  certifications: string;
  // Step 3: Interests
  interests: string[];
  // Step 4: Skills
  skills: string[];
  customSkills: string[];
  // Step 5: Work Preferences
  workStyle: string;
  workEnvironment: string;
  priorities: string[];
  // Step 6: Practical Constraints
  budget: string;
  preferredCities: string[];
  relocation: string;
  hostelNeeded: string;
  scholarshipLoan: string;
}

const DEFAULT_DATA: WizardData = {
  educationLevel: '',
  state: '',
  language: 'English',
  schoolName: '',
  board: '',
  passingYear: '',
  percentage: '',
  stream: '',
  subjects: [],
  collegeName: '',
  branch: '',
  currentYear: '',
  cgpa: '',
  backlogs: '',
  projects: '',
  internships: '',
  certifications: '',
  interests: [],
  skills: [],
  customSkills: [],
  workStyle: '',
  workEnvironment: '',
  priorities: [],
  budget: '',
  preferredCities: [],
  relocation: '',
  hostelNeeded: '',
  scholarshipLoan: '',
};

const STORAGE_KEY = 'cg_wizard_draft';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

const STREAMS_12 = [
  { value: 'PCM', label: 'PCM (Physics, Chemistry, Mathematics)' },
  { value: 'PCB', label: 'PCB (Physics, Chemistry, Biology)' },
  { value: 'PCMB', label: 'PCMB (Physics, Chemistry, Maths, Biology)' },
  { value: 'Commerce', label: 'Commerce (Accounts, Economics, Business)' },
  { value: 'Arts', label: 'Arts / Humanities' },
  { value: 'Vocational', label: 'Vocational' },
];

const SUBJECTS_12: Record<string, string[]> = {
  PCM: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'English'],
  PCB: ['Physics', 'Chemistry', 'Biology', 'English'],
  PCMB: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
  Commerce: ['Accountancy', 'Economics', 'Business Studies', 'Mathematics', 'English'],
  Arts: ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English'],
  Vocational: ['Hospitality', 'Retail', 'IT/ITES', 'Automotive', 'Textile'],
};

const INTERESTS = [
  'Technology & Programming', 'Science & Research', 'Mathematics & Statistics',
  'Healthcare & Medicine', 'Business & Finance', 'Law & Justice',
  'Design & Creative Arts', 'Teaching & Education', 'Public Service & Government',
  'Sports & Fitness', 'Communication & Media', 'Environment & Sustainability',
  'Engineering & Construction', 'Hospitality & Tourism', 'Agriculture',
];

const SKILLS = [
  'Programming & Coding', 'Data Analysis', 'Research', 'Mathematics',
  'Communication', 'Leadership', 'Creative Writing', 'Public Speaking',
  'Team Management', 'Problem Solving', 'Critical Thinking', 'Design',
  'Sales & Negotiation', 'Project Management', 'Foreign Languages',
];

const WORK_STYLES = ['Independent work', 'Team collaboration', 'Both are fine'];
const WORK_ENVIRONMENTS = ['Office', 'Remote / Work from home', 'Hybrid', 'Field / On-site', 'Lab / Studio', 'Outdoors'];
const BUDGET_OPTIONS = ['Under ₹1 Lakh', '₹1 Lakh – ₹5 Lakh', '₹5 Lakh – ₹10 Lakh', '₹10 Lakh – ₹20 Lakh', 'Above ₹20 Lakh'];
const PRIORITIES = ['High Income', 'Job Stability', 'Creativity', 'Work-Life Balance', 'Career Growth', 'Research Opportunities', 'Entrepreneurship'];
const RELOCATION_OPTIONS = ['Yes, willing to relocate', 'No, prefer to stay close to home', 'Maybe, depends on the opportunity'];
const HOSTEL_OPTIONS = ['Yes, I will need accommodation', 'No, I have my own arrangement', 'Maybe, depending on the city'];
const SCHOLARSHIP_OPTIONS = ['Scholarship only', 'Education loan', 'Both scholarship and loan', 'Neither, I can manage independently'];

// ─── Utilities ───────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

function buildAnswersPayload(data: WizardData): Record<string, unknown> {
  const qualificationMap: Record<string, string> = {
    'Class 10': 'class_10th',
    'Class 12': 'class_12th',
    'Diploma': 'diploma',
    'Bachelor\'s Degree': 'bachelor',
    'Master\'s Degree': 'master',
  };

  const financialMap: Record<string, string> = {
    'Under ₹1 Lakh': 'low',
    '₹1 Lakh – ₹5 Lakh': 'lower_middle',
    '₹5 Lakh – ₹10 Lakh': 'middle',
    '₹10 Lakh – ₹20 Lakh': 'upper_middle',
    'Above ₹20 Lakh': 'high',
  };

  const streamMap: Record<string, string> = {
    PCM: 'pcm', PCB: 'pcb', PCMB: 'pcmb',
    Commerce: 'commerce', Arts: 'arts', Vocational: 'vocational',
  };

  return {
    qualification: qualificationMap[data.educationLevel] || slugify(data.educationLevel),
    stream: streamMap[data.stream] || slugify(data.stream),
    academicDetails: {
      schoolName: data.schoolName,
      board: data.board,
      passingYear: data.passingYear,
      percentage: data.percentage,
    },
    interests: data.interests,
    skills: [...data.skills, ...data.customSkills],
    workStyle: data.workStyle,
    workEnvironment: data.workEnvironment,
    priorities: data.priorities,
    budget: data.budget,
    preferredCities: data.preferredCities,
    relocation: data.relocation,
    hostelNeeded: data.hostelNeeded,
    scholarshipLoan: data.scholarshipLoan,
    financialCapacity: financialMap[data.budget] || '',
  };
}

// ─── Step Components ─────────────────────────────────────────────────────────

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mb-8">
        <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h2 className="font-display text-d3 text-cream-100 mb-4">Find Your Right Career Path</h2>
      <p className="text-cream-100/60 max-w-lg text-base leading-relaxed mb-10">
        Answer a few questions about your academics, interests, and preferences. We'll show you careers that actually match who you are — not generic suggestions.
      </p>
      <Magnetic>
        <button onClick={onStart} className="cursor-pointer">
          <Action>Get Started</Action>
        </button>
      </Magnetic>
      <p className="mt-4 text-cream-100/40 text-sm">Takes about 3–5 minutes</p>
      <p className="mt-8 text-cream-100/25 text-sm">Not sure where to start?</p>
      <a
        href="/career/i-dont-know"
        className="mt-2 inline-block text-cream-100/40 text-sm hover:text-gold-500/60 transition-colors underline underline-offset-4"
      >
        Answer 4 quick questions instead →
      </a>
    </div>
  );
}

function BasicStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-cream-100/60 mb-2">Current Education Level *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Class 10', 'Class 12', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ ...data, educationLevel: level })}
              className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                data.educationLevel === level
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/30 hover:text-cream-100/80'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-cream-100/60 mb-2">State / Union Territory</label>
          <select
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-cream-100/60 mb-2">Preferred Language</label>
          <div className="flex gap-3">
            {['English', 'Hindi', 'Bilingual'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onChange({ ...data, language: lang })}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-all ${
                  data.language === lang
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/30'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademicStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  const is10 = data.educationLevel === 'Class 10';
  const is12 = data.educationLevel === 'Class 12';
  const isUG = data.educationLevel === "Bachelor's Degree" || data.educationLevel === 'Diploma';
  const subjects = is12 ? SUBJECTS_12[data.stream] || [] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-cream-100/60 mb-2">{is10 ? 'School Name' : isUG ? 'College Name' : 'School / College Name'}</label>
          <input
            type="text"
            value={isUG ? data.collegeName : data.schoolName}
            onChange={(e) => onChange({ ...data, [isUG ? 'collegeName' : 'schoolName']: e.target.value })}
            placeholder={is10 ? 'e.g. Delhi Public School' : isUG ? 'e.g. Delhi University' : 'School name'}
            className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
          />
        </div>
        <div>
          <label className="block text-sm text-cream-100/60 mb-2">Board / University</label>
          <select
            value={data.board}
            onChange={(e) => onChange({ ...data, board: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Select</option>
            {is10 || is12 ? (
              ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'].map((b) => <option key={b} value={b}>{b}</option>)
            ) : (
              ['State University', 'Central University', 'Deemed University', 'Private University', 'Autonomous College', 'Affiliated College'].map((b) => <option key={b} value={b}>{b}</option>)
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm text-cream-100/60 mb-2">Passing / Expected Year</label>
          <select
            value={data.passingYear}
            onChange={(e) => onChange({ ...data, passingYear: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none"
          >
            <option value="">Select year</option>
            {Array.from({ length: 8 }, (_, i) => 2026 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {(is10 || is12) && (
          <div>
            <label className="block text-sm text-cream-100/60 mb-2">Percentage / CGPA (or expected)</label>
            <input
              type="text"
              value={data.percentage}
              onChange={(e) => onChange({ ...data, percentage: e.target.value })}
              placeholder="e.g. 85% or 8.5 CGPA"
              className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
            />
          </div>
        )}
        {is12 && (
          <div className="md:col-span-2">
            <label className="block text-sm text-cream-100/60 mb-2">Stream *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STREAMS_12.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onChange({ ...data, stream: s.value, subjects: [] })}
                  className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                    data.stream === s.value
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/30'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {is12 && subjects.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm text-cream-100/60 mb-2">Subjects you are studying (select all)</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    const current = data.subjects.includes(subj)
                      ? data.subjects.filter((s) => s !== subj)
                      : [...data.subjects, subj];
                    onChange({ ...data, subjects: current });
                  }}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    data.subjects.includes(subj)
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/30'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        )}
        {isUG && (
          <>
            <div>
              <label className="block text-sm text-cream-100/60 mb-2">Branch / Specialization</label>
              <input
                type="text"
                value={data.branch}
                onChange={(e) => onChange({ ...data, branch: e.target.value })}
                placeholder="e.g. Computer Science, B.Com, B.A. History"
                className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
              />
            </div>
            <div>
              <label className="block text-sm text-cream-100/60 mb-2">Current Year</label>
              <select
                value={data.currentYear}
                onChange={(e) => onChange({ ...data, currentYear: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none"
              >
                <option value="">Select</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Completed'].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-cream-100/60 mb-2">CGPA / Percentage</label>
              <input
                type="text"
                value={data.cgpa}
                onChange={(e) => onChange({ ...data, cgpa: e.target.value })}
                placeholder="e.g. 8.2 or 78%"
                className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
              />
            </div>
            <div>
              <label className="block text-sm text-cream-100/60 mb-2">Backlogs (if any)</label>
              <select
                value={data.backlogs}
                onChange={(e) => onChange({ ...data, backlogs: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none"
              >
                <option value="">None</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-cream-100/60 mb-2">Projects / Internships / Certifications (optional)</label>
              <textarea
                value={data.projects}
                onChange={(e) => onChange({ ...data, projects: e.target.value })}
                placeholder="Briefly describe any projects, internships, or certifications..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20 resize-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InterestsStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  return (
    <div>
      <p className="text-cream-100/60 text-sm mb-6">Select all the areas that genuinely interest you. These don't need to be your "best" subjects — just what you actually enjoy.</p>
      <div className="flex flex-wrap gap-3">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => {
              const current = data.interests.includes(interest)
                ? data.interests.filter((i) => i !== interest)
                : [...data.interests, interest];
              onChange({ ...data, interests: current });
            }}
            className={`px-5 py-3 rounded-full border text-sm transition-all ${
              data.interests.includes(interest)
                ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30 hover:text-cream-100'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      {data.interests.length === 0 && (
        <p className="mt-4 text-sm text-red-400/70">Please select at least one interest.</p>
      )}
    </div>
  );
}

function SkillsStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  const [custom, setCustom] = useState('');

  const addCustom = () => {
    if (!custom.trim()) return;
    if (data.customSkills.includes(custom.trim())) return;
    onChange({ ...data, customSkills: [...data.customSkills, custom.trim()] });
    setCustom('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-cream-100/60 text-sm mb-4">Select the skills you already have or are developing.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => {
                const current = data.skills.includes(skill)
                  ? data.skills.filter((s) => s !== skill)
                  : [...data.skills, skill];
                onChange({ ...data, skills: current });
              }}
              className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                data.skills.includes(skill)
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-cream-100/60 mb-2">Add custom skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="e.g. Video Editing, Financial Modeling"
            className="flex-1 px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
          />
          <button type="button" onClick={addCustom} className="px-5 py-3 rounded-lg border border-gold-500/50 text-gold-500 text-sm hover:bg-gold-500/10 transition-colors">
            Add
          </button>
        </div>
        {data.customSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.customSkills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 text-sm">
                {s}
                <button
                  type="button"
                  onClick={() => onChange({ ...data, customSkills: data.customSkills.filter((cs) => cs !== s) })}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {(data.skills.length + data.customSkills.length) === 0 && (
        <p className="text-sm text-red-400/70">Please select at least one skill.</p>
      )}
    </div>
  );
}

function WorkPreferencesStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  const togglePriority = (p: string) => {
    const current = data.priorities.includes(p)
      ? data.priorities.filter((x) => x !== p)
      : [...data.priorities, p];
    onChange({ ...data, priorities: current });
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm text-cream-100/60 mb-3">Preferred way of working</label>
        <div className="flex flex-wrap gap-3">
          {WORK_STYLES.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onChange({ ...data, workStyle: w })}
              className={`px-5 py-3 rounded-full border text-sm transition-all ${
                data.workStyle === w
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-cream-100/60 mb-3">Ideal work environment</label>
        <div className="flex flex-wrap gap-3">
          {WORK_ENVIRONMENTS.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => onChange({ ...data, workEnvironment: env })}
              className={`px-5 py-3 rounded-full border text-sm transition-all ${
                data.workEnvironment === env
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-cream-100/60 mb-3">What's most important to you in a career? (select up to 4)</label>
        <div className="flex flex-wrap gap-3">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                if (!data.priorities.includes(p) && data.priorities.length >= 4) return;
                togglePriority(p);
              }}
              className={`px-5 py-3 rounded-full border text-sm transition-all ${
                data.priorities.includes(p)
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : data.priorities.length >= 4
                  ? 'border-cream-100/5 text-cream-100/20 cursor-not-allowed'
                  : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {data.priorities.length > 0 && (
          <p className="mt-2 text-xs text-cream-100/40">{data.priorities.length}/4 selected</p>
        )}
      </div>
    </div>
  );
}

function PracticalConstraintsStep({ data, onChange }: { data: WizardData; onChange: (d: WizardData) => void }) {
  const [cityInput, setCityInput] = useState('');

  const addCity = () => {
    if (!cityInput.trim() || data.preferredCities.includes(cityInput.trim())) return;
    onChange({ ...data, preferredCities: [...data.preferredCities, cityInput.trim()] });
    setCityInput('');
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm text-cream-100/60 mb-3">Education budget per year</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onChange({ ...data, budget: b })}
              className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                data.budget === b
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-cream-100/60 mb-2">Preferred cities (optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
            placeholder="e.g. Bangalore, Delhi, Hyderabad"
            className="flex-1 px-4 py-3 rounded-lg bg-night-800 border border-cream-100/10 text-cream-100 text-sm focus:border-gold-500 focus:outline-none placeholder:text-cream-100/20"
          />
          <button type="button" onClick={addCity} className="px-5 py-3 rounded-lg border border-gold-500/50 text-gold-500 text-sm hover:bg-gold-500/10 transition-colors">
            Add
          </button>
        </div>
        {data.preferredCities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.preferredCities.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-night-800 border border-cream-100/20 text-cream-100/80 text-sm">
                {c}
                <button type="button" onClick={() => onChange({ ...data, preferredCities: data.preferredCities.filter((x) => x !== c) })} className="hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm text-cream-100/60 mb-3">Relocation</label>
          <div className="space-y-2">
            {RELOCATION_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ ...data, relocation: r })}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                  data.relocation === r
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-cream-100/60 mb-3">Accommodation</label>
          <div className="space-y-2">
            {HOSTEL_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChange({ ...data, hostelNeeded: h })}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                  data.hostelNeeded === h
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-cream-100/60 mb-3">Scholarship / Loan</label>
          <div className="space-y-2">
            {SCHOLARSHIP_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...data, scholarshipLoan: s })}
                className={`w-full px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                  data.scholarshipLoan === s
                    ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                    : 'border-cream-100/10 text-cream-100/70 hover:border-cream-100/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: WizardData }) {
  const formatList = (arr: string[]) => arr.length > 0 ? arr.join(', ') : '—';
  return (
    <div className="space-y-6">
      <p className="text-cream-100/60 text-sm">Review your answers before submitting.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ['Education Level', data.educationLevel],
          ['State', data.state || '—'],
          ['Language', data.language],
          ['Stream', data.stream || '—'],
          ['Board', data.board || '—'],
          ['Passing Year', data.passingYear || '—'],
          ['Percentage', data.percentage || data.cgpa || '—'],
          ['Branch', data.branch || '—'],
        ].filter(([, v]) => v).map(([label, value]) => (
          <div key={String(label)} className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
            <p className="text-xs text-cream-100/40 mb-1">{label}</p>
            <p className="text-sm text-cream-100">{value}</p>
          </div>
        ))}
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Interests</p>
          <p className="text-sm text-cream-100">{formatList(data.interests)}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Skills</p>
          <p className="text-sm text-cream-100">{formatList([...data.skills, ...data.customSkills])}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Work Style</p>
          <p className="text-sm text-cream-100">{data.workStyle || '—'}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Work Environment</p>
          <p className="text-sm text-cream-100">{data.workEnvironment || '—'}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Budget</p>
          <p className="text-sm text-cream-100">{data.budget || '—'}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Relocation</p>
          <p className="text-sm text-cream-100">{data.relocation || '—'}</p>
        </div>
        <div className="bg-night-800 rounded-lg px-4 py-3 border border-cream-100/5">
          <p className="text-xs text-cream-100/40 mb-1">Hostel Needed</p>
          <p className="text-sm text-cream-100">{data.hostelNeeded || '—'}</p>
        </div>
      </div>

      {/* Not sure shortcut */}
      <div className="bg-night-800/50 rounded-xl p-5 border border-cream-100/5">
        <p className="text-sm text-cream-100/60 mb-3">
          Still not confident about your choices?
        </p>
        <a
          href="/career/i-dont-know"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-night-900/60 border border-gold-500/30 text-gold-500/80 text-sm hover:bg-gold-500/10 hover:border-gold-500/50 transition-all"
        >
          Answer 4 quick questions instead →
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'basic', label: 'Basic Info' },
  { id: 'academic', label: 'Academic' },
  { id: 'interests', label: 'Interests' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work Preferences' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'review', label: 'Review' },
];

export function CareerGuidancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? 'basic' : 'welcome';
  });
  const [data, setData] = useState<WizardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return { ...DEFAULT_DATA, ...JSON.parse(saved) }; } catch { /* ignore */ }
    }
    return DEFAULT_DATA;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Persist draft
  useEffect(() => {
    if (step !== 'welcome') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, step]);

  const currentIndex = STEPS.findIndex((s) => s.id === step);

  const goNext = useCallback(() => {
    setDirection(1);
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  }, [step]);

  const goBack = useCallback(() => {
    setDirection(-1);
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  }, [step]);

  const canProceed = () => {
    switch (step) {
      case 'basic': return data.educationLevel !== '';
      case 'academic': return data.educationLevel !== 'Class 12' || data.stream !== '';
      case 'interests': return data.interests.length > 0;
      case 'skills': return data.skills.length + data.customSkills.length > 0;
      case 'work': return data.workStyle !== '' && data.workEnvironment !== '';
      case 'constraints': return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const answers = buildAnswersPayload(data);
      await apiSubmitAnswers(answers);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/career/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="bg-night-900 min-h-screen">
      {/* Header */}
      {step !== 'welcome' && (
        <div className="sticky top-[76px] z-30 bg-night-900/95 backdrop-blur-sm border-b border-cream-100/5">
          <div className="max-w-page mx-auto px-6 md:px-12 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-cream-100/40 font-mono">
                Step {currentIndex} of {STEPS.length - 1}
              </span>
              <span className="text-xs text-cream-100/40">
                {STEPS[currentIndex]?.label}
              </span>
            </div>
            {/* Progress pills */}
            <div className="flex gap-1.5">
              {STEPS.filter((s) => s.id !== 'welcome').map((s, i) => {
                const idx = STEPS.findIndex((x) => x.id === s.id);
                const active = idx === currentIndex;
                const done = idx < currentIndex;
                return (
                  <div
                    key={s.id}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      active ? 'bg-gold-500 flex-none w-8' : done ? 'bg-gold-500/50' : 'bg-cream-100/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-page mx-auto px-6 md:px-12 py-10 md:py-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 'welcome' && <WelcomeStep onStart={goNext} />}

            {step === 'basic' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">Basic Information</h2>
                <p className="text-cream-100/50 text-sm mb-8">Let's start with your background.</p>
                <BasicStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'academic' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">Academic Details</h2>
                <p className="text-cream-100/50 text-sm mb-8">
                  {data.educationLevel === "Class 10" ? "Tell us about your Class 10 results." :
                   data.educationLevel === "Class 12" ? "Tell us about your Class 12 results." :
                   "Tell us about your college education."}
                </p>
                <AcademicStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'interests' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">What interests you?</h2>
                <p className="text-cream-100/50 text-sm mb-8">Select everything that genuinely excites you — not just what you're good at.</p>
                <InterestsStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'skills' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">What can you do?</h2>
                <p className="text-cream-100/50 text-sm mb-8">Select skills you have or are developing. Be honest — this isn't a test.</p>
                <SkillsStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'work' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">Work Preferences</h2>
                <p className="text-cream-100/50 text-sm mb-8">How you want to work matters as much as what you want to do.</p>
                <WorkPreferencesStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'constraints' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">Practical Realities</h2>
                <p className="text-cream-100/50 text-sm mb-8">Being realistic upfront leads to better recommendations.</p>
                <PracticalConstraintsStep data={data} onChange={setData} />
              </div>
            )}

            {step === 'review' && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-2">Review & Submit</h2>
                <p className="text-cream-100/50 text-sm mb-8">Everything look right? Submit to see your personalized career recommendations.</p>
                <ReviewStep data={data} />
                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step !== 'welcome' && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-cream-100/5">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-3 text-sm text-cream-100/50 hover:text-cream-100 transition-colors"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              {/* Skip shortcut */}
              {step !== 'review' && (
                <button
                  type="button"
                  onClick={() => navigate('/career-explorer')}
                  className="px-4 py-2 text-sm text-cream-100/30 hover:text-cream-100/50 transition-colors"
                >
                  Skip for now
                </button>
              )}

              {step === 'review' ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <span className="px-8 py-3 rounded-lg bg-gold-500/20 text-gold-500 text-sm flex items-center gap-2">
                      <Spinner size="sm" /> Submitting...
                    </span>
                  ) : (
                    <Action>Start Career Exploration</Action>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed()}
                  className={`px-8 py-3 rounded-lg bg-gold-500 text-night-900 text-sm font-medium transition-all ${
                    canProceed() ? 'hover:bg-gold-500/90 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
