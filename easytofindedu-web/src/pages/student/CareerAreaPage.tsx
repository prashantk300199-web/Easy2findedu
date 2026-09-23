import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNodes, type CareerNode } from '../../services/career.service';
import { fetchHostels } from '../../lib/api';
import { CareerNodeCard } from '../../components/career/CareerNodeCard';
import { Spinner } from '../../components/primitives';

const AREA_META: Record<string, { title: string; description: string; color: string }> = {
  technology: {
    title: 'Technology & Software',
    description: 'From AI and data science to cybersecurity and cloud computing — technology careers are among the fastest-growing and highest-paying in India and globally.',
    color: '#3B82F6',
  },
  engineering: {
    title: 'Engineering',
    description: 'Civil, mechanical, electrical, and computer engineering — build the infrastructure and systems that power the modern world.',
    color: '#8B5CF6',
  },
  healthcare: {
    title: 'Healthcare',
    description: 'Doctors, nurses, pharmacists, physiotherapists, and the wide range of professions dedicated to human health and wellbeing.',
    color: '#EF4444',
  },
  commerce_finance: {
    title: 'Commerce & Finance',
    description: 'Chartered Accountancy, banking, investment analysis, actuarial science, and the management of money and markets.',
    color: '#10B981',
  },
  law: {
    title: 'Law & Legal Services',
    description: 'Corporate law, litigation, intellectual property, and the many ways law shapes business and society.',
    color: '#92400E',
  },
  creative: {
    title: 'Creative Arts & Design',
    description: 'Graphic design, film, animation, fashion, photography, music, and every form of creative and artistic expression.',
    color: '#EC4899',
  },
  business: {
    title: 'Business & Management',
    description: 'MBA, entrepreneurship, digital marketing, consulting, and leadership in organizations of every size.',
    color: '#F59E0B',
  },
  research: {
    title: 'Research & Academia',
    description: 'PhD programs, university teaching, and scientific research — careers dedicated to advancing human knowledge.',
    color: '#6366F1',
  },
  public_service: {
    title: 'Public Service & Government',
    description: 'UPSC civil services, state service commissions, defence forces, police, and every government career that serves the nation.',
    color: '#0EA5E9',
  },
};

export default function CareerAreaPage() {
  const { area } = useParams<{ area: string }>();
  const meta = AREA_META[area || ''] || { title: 'Career Area', description: '', color: '#C9A96A' };

  const [nodes, setNodes] = useState<CareerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('careers');
  const [hostels, setHostels] = useState<{ items: { _id: string; name: string; slug: string; hostel_type?: string; rooms?: { monthly_rent?: number }[] }[] } | null>(null);

  const fetchData = useCallback(async () => {
    if (!area) return;
    setLoading(true);
    setError('');
    try {
      // Search by area keyword tags
      const res = await getNodes({ query: area, limit: 12 });
      setNodes(res.nodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load careers');
    } finally {
      setLoading(false);
    }
  }, [area]);

  const fetchRelatedHostels = useCallback(async () => {
    try {
      const data = await fetchHostels(6);
      setHostels(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (activeTab === 'accommodation') fetchRelatedHostels();
  }, [activeTab, fetchRelatedHostels]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Area header */}
      <div className="bg-night-900 py-14 md:py-20">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <p className="text-sm font-mono tracking-widest mb-3" style={{ color: meta.color + 'B0' }}>CAREER AREA</p>
          <h1 className="font-display text-d2 text-cream-100 mb-4">{meta.title}</h1>
          <p className="text-cream-100/50 text-base max-w-2xl leading-relaxed">{meta.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-cream-200 bg-cream sticky top-[76px] z-10">
        <div className="max-w-page mx-auto px-6 md:px-12">
          <div className="flex gap-0">
            {['careers', 'institutes', 'exams', 'accommodation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm capitalize border-b-2 transition-all ${
                  activeTab === tab ? 'border-night-800 text-night-800 font-medium' : 'border-transparent text-night-600/50 hover:text-night-800/70'
                }`}
              >
                {tab === 'careers' ? 'Career Paths' : tab === 'institutes' ? 'Top Institutes' : tab === 'exams' ? 'Entrance Exams' : 'Nearby Accommodation'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-12 py-10">

        {activeTab === 'careers' && (
          loading ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500/70 text-sm mb-4">{error}</p>
              <button onClick={fetchData} className="text-sm text-night-700/60 hover:text-night-700 underline">Try again</button>
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-night-700/50 text-sm mb-2">No career paths found in this area yet.</p>
              <Link to="/career-explorer" className="text-sm text-night-700/60 hover:text-night-800 underline">Browse all careers →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {nodes.map((node) => (
                <CareerNodeCard key={node._id} node={node} />
              ))}
            </div>
          )
        )}

        {activeTab === 'institutes' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-night-100/60 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-night-600/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-night-700/60 text-sm mb-2">Browse top institutes offering programs in {meta.title}.</p>
            <Link to="/institutes" className="inline-block mt-3 px-6 py-2.5 rounded-lg bg-night-800 text-cream-100 text-sm hover:bg-night-900 transition-colors">
              Browse Institutes →
            </Link>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-night-100/60 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-night-600/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-night-700/60 text-sm mb-2">Find entrance exams relevant to {meta.title} careers.</p>
            <p className="text-night-600/40 text-xs">Coming soon — entrance exam directory is being built.</p>
          </div>
        )}

        {activeTab === 'accommodation' && (
          !hostels ? (
            <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
          ) : hostels.items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-night-700/60 text-sm">No accommodation found near {meta.title} institutes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hostels.items.slice(0, 6).map((hostel) => (
                <Link
                  key={hostel._id}
                  to={`/hostels/${hostel.slug}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-night-100 border border-night-200/40 hover:bg-night-200/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-night-200/40 flex items-center justify-center text-night-600/40 text-xs font-display">
                    {hostel.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-night-800 text-sm truncate">{hostel.name}</p>
                    <p className="text-xs text-night-600/50">{hostel.hostel_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {hostel.rooms?.[0]?.monthly_rent && (
                      <p className="text-sm font-medium text-night-800">₹{hostel.rooms[0].monthly_rent.toLocaleString()}/mo</p>
                    )}
                  </div>
                </Link>
              ))}
              <div className="text-center pt-2">
                <Link to="/hostels" className="text-sm text-night-700/60 hover:text-night-800 transition-colors">
                  Browse all accommodation →
                </Link>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
