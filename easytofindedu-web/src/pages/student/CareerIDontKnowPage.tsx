import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iDontKnow, type CareerSuggestion } from '../../services/career.service';
import { Spinner } from '../../components/primitives';

const STRESS_OPTIONS = [
  { value: 'solve_logically', label: 'I try to solve it logically', icon: '🧩' },
  { value: 'talk_to_people', label: 'I talk to someone about it', icon: '💬' },
  { value: 'create_something', label: 'I channel it into something creative', icon: '🎨' },
  { value: 'need_time_alone', label: 'I need time alone to process', icon: '🌙' },
];

const DECISION_OPTIONS = [
  { value: 'facts_data', label: 'I look at all the facts and data', icon: '📊' },
  { value: 'gut_feeling', label: 'I go with my gut feeling', icon: '❤️' },
  { value: 'people_opinions', label: 'I ask what others think', icon: '👥' },
  { value: 'balanced', label: 'I balance all approaches', icon: '⚖️' },
];

const SOCIAL_OPTIONS = [
  { value: 'team', label: 'I prefer working in teams', icon: '🤝' },
  { value: 'independent', label: 'I prefer working independently', icon: '🧑‍💻' },
  { value: 'varied', label: 'I like a mix of both', icon: '🔀' },
];

const CREATIVITY_OPTIONS = [
  { value: 'very_creative', label: 'Very creative — I love designing and building new things', icon: '💡' },
  { value: 'somewhat_creative', label: 'Somewhat creative — I like variety in my work', icon: '🎯' },
  { value: 'prefer_structured', label: 'I prefer structured, clear processes', icon: '📋' },
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Economics', 'Accounts / Finance', 'History', 'Political Science',
  'Geography', 'Psychology', 'English Literature', 'Art & Design',
  'Business Studies', 'Physical Education',
];

const ACTIVITY_OPTIONS = [
  'Reading and researching', 'Coding and programming', 'Helping and caring for others',
  'Building and fixing things', 'Music, art, or creative work', 'Talking and debating',
  'Leading and organizing people', 'Analyzing numbers and data',
  'Working outdoors', 'Teaching and explaining',
];

export default function CareerIDontKnowPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    stressResponse: '',
    decisionStyle: '',
    socialPreference: '',
    creativityLevel: '',
    favoriteSubjects: [] as string[],
    favoriteActivities: [] as string[],
  });
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const STEPS_QUESTIONNAIRE = [
    { key: 'stressResponse', title: 'When you feel stressed or confused, what do you naturally do?', options: STRESS_OPTIONS },
    { key: 'decisionStyle', title: 'How do you prefer to make important decisions?', options: DECISION_OPTIONS },
    { key: 'socialPreference', title: 'How do you prefer to work?', options: SOCIAL_OPTIONS },
    { key: 'creativityLevel', title: 'How would you describe your creative side?', options: CREATIVITY_OPTIONS },
  ];

  const toggleArray = (key: 'favoriteSubjects' | 'favoriteActivities', value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleNext = async () => {
    if (step < STEPS_QUESTIONNAIRE.length + 1) {
      setStep(step + 1);
    } else {
      // Submit
      setLoading(true);
      setError('');
      try {
        const res = await iDontKnow(answers);
        setSuggestions(res.suggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = () => {
    const qStep = step - 1;
    if (qStep < STEPS_QUESTIONNAIRE.length) {
      const key = STEPS_QUESTIONNAIRE[qStep].key as keyof typeof answers;
      return !!answers[key];
    }
    if (qStep === STEPS_QUESTIONNAIRE.length) return true; // subjects — optional
    return true;
  };

  const progress = Math.round(((step + 1) / (STEPS_QUESTIONNAIRE.length + 2)) * 100);

  return (
    <div className="min-h-screen bg-night-900">
      {/* Header */}
      <div className="bg-night-900 border-b border-cream-100/5 py-6">
        <div className="max-w-page mx-auto px-6 md:px-12 flex items-center justify-between">
          <div>
            <p className="text-gold-500/70 text-xs font-mono tracking-widest mb-1">CAREER DISCOVERY</p>
            <h1 className="font-display text-d4 text-cream-100">Not Sure What To Do?</h1>
          </div>
          <Link to="/career-guidance" className="text-cream-100/40 hover:text-cream-100/70 text-sm transition-colors">
            Take full questionnaire →
          </Link>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10 md:py-16">

        {suggestions.length > 0 ? (
          /* Results */
          <div>
            <div className="mb-10">
              <h2 className="font-display text-d3 text-cream-100 mb-2">Career Areas Worth Exploring</h2>
              <p className="text-cream-100/50 text-sm">
                Based on how you think and work — here are areas that may suit you naturally.
              </p>
            </div>

            <div className="space-y-6">
              {suggestions.map((s, i) => (
                <div key={s.areaId} className="bg-night-800 rounded-2xl p-8 border border-cream-100/5">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-gold-500 font-semibold text-lg">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-cream-100 mb-2">{s.label}</h3>
                      <p className="text-cream-100/50 text-sm leading-relaxed mb-4">{s.reason}</p>

                      {/* Experiments */}
                      {s.experiments && s.experiments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gold-500/70 font-medium mb-2">Try this:</p>
                          <div className="space-y-2">
                            {s.experiments.map((exp) => (
                              <div key={exp.title} className="flex items-start gap-3 bg-night-900/50 rounded-lg px-4 py-3">
                                <span className="text-gold-500 mt-0.5 flex-shrink-0">→</span>
                                <div>
                                  <p className="text-sm text-cream-100/80 font-medium">{exp.title}</p>
                                  <p className="text-xs text-cream-100/30 mt-0.5">{exp.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          to={`/career/explore-area/${s.areaId}`}
                          className="px-6 py-2.5 rounded-xl bg-gold-500 text-night-900 text-sm font-medium hover:bg-gold-600 transition-colors"
                        >
                          Explore This Area →
                        </Link>
                        <Link
                          to="/career-guidance"
                          className="px-6 py-2.5 rounded-xl border border-cream-100/10 text-cream-100/60 text-sm hover:bg-cream-100/5 transition-colors"
                        >
                          Get Full Recommendations
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-cream-100/30 text-sm mb-4">
                Want more personalized recommendations?
              </p>
              <Link
                to="/career-guidance"
                className="inline-block px-8 py-3 rounded-xl border border-gold-500/30 text-gold-500 text-sm hover:bg-gold-500/10 transition-colors"
              >
                Take the Full Questionnaire →
              </Link>
            </div>
          </div>
        ) : (
          /* Questionnaire */
          <div className="max-w-xl mx-auto">
            {/* Progress */}
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-cream-100/30">Quick discovery</span>
                <span className="text-xs text-cream-100/30">{progress}%</span>
              </div>
              <div className="h-1 bg-night-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {step === 0 && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-3">Let's find your starting point</h2>
                <p className="text-cream-100/50 text-base mb-8 leading-relaxed">
                  Answer 4 quick questions — no wrong answers. This isn't a personality test. It's just a way to spot patterns in how you naturally work and think.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3.5 rounded-xl bg-gold-500 text-night-900 text-sm font-semibold hover:bg-gold-600 transition-colors cursor-pointer"
                >
                  Let's start →
                </button>
              </div>
            )}

            {step > 0 && step <= STEPS_QUESTIONNAIRE.length && (
              <div>
                <p className="text-cream-100/40 text-sm mb-3 font-mono">{step}/{STEPS_QUESTIONNAIRE.length}</p>
                <h2 className="font-display text-d3 text-cream-100 mb-8">
                  {STEPS_QUESTIONNAIRE[step - 1].title}
                </h2>
                <div className="space-y-3">
                  {STEPS_QUESTIONNAIRE[step - 1].options.map((opt) => {
                    const key = STEPS_QUESTIONNAIRE[step - 1].key as keyof typeof answers;
                    const selected = answers[key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setAnswers((prev) => ({ ...prev, [key]: opt.value }))}
                        className={`w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-gold-500 bg-gold-500/10'
                            : 'border-cream-100/10 hover:border-cream-100/20'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                        <span className={`text-sm flex-1 ${selected ? 'text-gold-500' : 'text-cream-100/70'}`}>
                          {opt.label}
                        </span>
                        {selected && (
                          <span className="text-gold-500 text-lg">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === STEPS_QUESTIONNAIRE.length + 1 && (
              <div>
                <h2 className="font-display text-d3 text-cream-100 mb-8">
                  Which subjects do you enjoy most?
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SUBJECT_OPTIONS.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => toggleArray('favoriteSubjects', subj)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        answers.favoriteSubjects.includes(subj)
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/20'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
                <h2 className="font-display text-d3 text-cream-100 mb-8 mt-10">
                  What do you like doing outside of class?
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ACTIVITY_OPTIONS.map((act) => (
                    <button
                      key={act}
                      onClick={() => toggleArray('favoriteActivities', act)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        answers.favoriteActivities.includes(act)
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-cream-100/10 text-cream-100/60 hover:border-cream-100/20'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
                <p className="text-cream-100/30 text-xs mb-6">Select all that apply — or skip by clicking Continue.</p>
              </div>
            )}

            {/* Navigation */}
            {step > 0 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-cream-100/5">
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-cream-100/40 hover:text-cream-100/60 text-sm transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className={`px-8 py-3 rounded-xl text-sm font-medium transition-all ${
                    canProceed()
                      ? 'bg-gold-500 text-night-900 hover:bg-gold-600 cursor-pointer'
                      : 'bg-night-800 text-night-600/40 cursor-not-allowed'
                  }`}
                >
                  {loading ? <Spinner size="sm" /> : step === STEPS_QUESTIONNAIRE.length + 1 ? 'Find My Careers →' : 'Continue →'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
