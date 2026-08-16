import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const BASE = 'https://easytofindedu.onrender.com/api/v1';

async function adminGet(path: string, token: string | null) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function adminPatch(path: string, token: string | null, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function adminDelete(path: string, token: string | null) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

interface Hostel {
  _id: string;
  name: string;
  masked_name: string;
  hostel_type: string;
  status: string;
  is_open: boolean;
  owner: { _id: string; name: string; email: string; phone?: string };
  createdAt: string;
  updatedAt: string;
  address: { city: string; area: string; line1?: string; state?: string; pincode?: string };
  views_count?: number;
  leads_count?: number;
  total_hostel_beds?: number;
  rooms?: Array<{ room_type: string; total_beds: number; monthly_rent: number }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  is_verified?: boolean;
}

// Sidebar
function AdminSidebar({ view, setView }: { view: string; setView: (v: string) => void }) {
  return (
    <aside className="w-64 bg-night-800 text-cream-100 p-6 min-h-screen flex flex-col">
      <h1 className="font-display text-2xl mb-8 text-gold-400">Admin Panel</h1>
      <nav className="space-y-2 flex-1">
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'approvals', icon: '✅', label: 'Approvals' },
          { id: 'hostels', icon: '🏠', label: 'All Hostels' },
          { id: 'owners', icon: '🏢', label: 'Owners' },
          { id: 'students', icon: '👥', label: 'Students' },
          { id: 'analytics', icon: '📈', label: 'Analytics' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              view === item.id ? 'bg-gold-500 text-night-800' : 'hover:bg-night-700'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-night-700">
        <p className="text-xs text-cream-400">Admin Panel v1.0</p>
      </div>
    </aside>
  );
}

// Dashboard Overview
function DashboardOverview({ getToken }: { getToken: () => string | null }) {
  const [stats, setStats] = useState<any>(null);
  const [recentHostels, setRecentHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminGet('/admin/stats', getToken()).catch(() => ({})),
      adminGet('/admin/hostels?limit=5&sort=-createdAt', getToken()).catch(() => ({ hostels: [] }))
    ])
      .then(([statsData, hostelsData]) => {
        setStats(statsData);
        setRecentHostels(hostelsData.hostels || []);
      })
      .finally(() => setLoading(false));
  }, [getToken]);

  if (loading) return <div className="p-8"><p>Loading...</p></div>;

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="font-display text-3xl text-night-800 mb-2">Dashboard Overview</h1>
      <p className="text-sm text-ink-500 mb-8">Real-time platform statistics</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-night-800 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Total Hostels</p>
          <p className="font-display text-4xl text-night-800">{stats?.totalHostels || 0}</p>
          <p className="text-xs text-green-600 mt-2">↑ {stats?.activeHostels || 0} active</p>
        </div>
        <div className="bg-gold-100 border-2 border-gold-500 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Pending</p>
          <p className="font-display text-4xl text-gold-700">{stats?.pendingHostels || 0}</p>
          <p className="text-xs text-wine mt-2">Needs approval</p>
        </div>
        <div className="bg-green-50 border-2 border-green-500 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Approved</p>
          <p className="font-display text-4xl text-green-700">{stats?.approvedHostels || 0}</p>
          <p className="text-xs text-ink-400 mt-2">Live on site</p>
        </div>
        <div className="bg-white border-2 border-night-800 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Total Views</p>
          <p className="font-display text-4xl text-night-800">{stats?.totalViews || 0}</p>
          <p className="text-xs text-ink-400 mt-2">All hostels</p>
        </div>
      </div>

      {/* Users & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-cream-300 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Hostel Owners</p>
          <p className="font-display text-3xl text-night-800">{stats?.totalOwners || 0}</p>
        </div>
        <div className="bg-white border border-cream-300 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Students</p>
          <p className="font-display text-3xl text-night-800">{stats?.totalStudents || 0}</p>
        </div>
        <div className="bg-white border border-cream-300 p-6">
          <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Total Leads</p>
          <p className="font-display text-3xl text-night-800">{stats?.totalLeads || 0}</p>
        </div>
      </div>

      {/* Recent Hostels */}
      <div className="bg-white border border-cream-300 p-6">
        <h2 className="font-display text-xl text-night-800 mb-4">Recently Added Hostels</h2>
        <div className="space-y-3">
          {recentHostels.length === 0 ? (
            <p className="text-ink-400 text-sm">No recent hostels</p>
          ) : (
            recentHostels.map((h) => (
              <div key={h._id} className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <p className="font-medium text-night-800">{h.masked_name || h.name}</p>
                  <p className="text-xs text-ink-400">{h.address?.city} • {h.hostel_type} • by {h.owner?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-400">{h.views_count || 0} views</span>
                  <span className={`px-3 py-1 text-xs ${
                    h.status === 'approved' ? 'bg-green-100 text-green-700' :
                    h.status === 'pending' ? 'bg-gold-100 text-gold-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Pending Approvals
function PendingApprovals({ getToken }: { getToken: () => string | null }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGet('/admin/hostels?status=pending', getToken());
      setHostels(data.hostels || []);
    } catch (e) {
      setError('Failed to load pending hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    if (!confirm('Approve this hostel? It will be visible to all users.')) return;
    try {
      await adminPatch(`/admin/hostels/${id}/status`, getToken(), { status: 'approved' });
      alert('Hostel approved!');
      load();
    } catch (e) {
      alert('Failed to approve hostel');
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject this hostel? Owner will be notified.')) return;
    try {
      await adminPatch(`/admin/hostels/${id}/status`, getToken(), { status: 'rejected' });
      alert('Hostel rejected');
      load();
    } catch (e) {
      alert('Failed to reject hostel');
    }
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="mb-8 font-display text-3xl text-night-800">Pending Approvals</h1>

      {error && <div className="mb-4 border-l-4 border-wine bg-red-50 px-5 py-3 text-sm text-wine">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : hostels.length === 0 ? (
        <div className="bg-green-50 border border-green-300 p-8 text-center">
          <p className="text-green-700">✓ All caught up! No pending approvals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hostels.map((h) => (
            <motion.div
              key={h._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-gold-400 bg-white p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="font-display text-2xl text-night-800 mb-1">{h.masked_name || h.name}</p>
                  <p className="text-sm text-ink-500 mb-2">
                    {h.hostel_type} hostel in {h.address?.area}, {h.address?.city}, {h.address?.state}
                  </p>
                  <div className="flex gap-4 text-xs text-ink-400">
                    <span>📍 {h.address?.pincode || 'N/A'}</span>
                    <span>🛏️ {h.total_hostel_beds || 0} beds</span>
                    <span>📅 Added {new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-cream-100 p-4 mb-4">
                <p className="text-xs uppercase tracking-wide text-ink-400 mb-2">Owner Details</p>
                <p className="text-sm text-night-800">{h.owner?.name}</p>
                <p className="text-xs text-ink-500">{h.owner?.email} • {h.owner?.phone || 'No phone'}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approve(h._id)}
                  className="bg-green-600 px-6 py-3 text-xs uppercase tracking-wide text-white hover:bg-green-700 transition-colors"
                >
                  ✓ Approve & Publish
                </button>
                <button
                  onClick={() => reject(h._id)}
                  className="bg-wine px-6 py-3 text-xs uppercase tracking-wide text-white hover:bg-red-700 transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// All Hostels
function AllHostels({ getToken }: { getToken: () => string | null }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    const path = filter === 'all' ? '/admin/hostels' : `/admin/hostels?status=${filter}`;
    adminGet(path, getToken())
      .then(data => setHostels(data.hostels || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, getToken]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    try {
      await adminPatch(`/admin/hostels/${id}/status`, getToken(), { status: newStatus });
      alert(`Status changed to ${newStatus}`);
      setHostels(hostels.map(h => h._id === id ? { ...h, status: newStatus } : h));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="mb-6 font-display text-3xl text-night-800">All Hostels</h1>

      <div className="mb-6 flex gap-3">
        {(['all', 'approved', 'pending', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs uppercase transition-colors ${
              filter === f ? 'bg-night-800 text-cream-100' : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border border-cream-300">
          <table className="w-full">
            <thead className="bg-cream-100 border-b border-cream-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Hostel</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Owner</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Location</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Stats</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Status</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-ink-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((h) => (
                <tr key={h._id} className="border-b border-cream-200 hover:bg-cream-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-night-800">{h.masked_name || h.name}</p>
                    <p className="text-xs text-ink-400">{h.hostel_type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-night-800">{h.owner?.name}</p>
                    <p className="text-xs text-ink-400">{h.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-night-800">{h.address?.city}</p>
                    <p className="text-xs text-ink-400">{h.address?.area}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-ink-400">👁️ {h.views_count || 0} views</p>
                    <p className="text-xs text-ink-400">📧 {h.leads_count || 0} leads</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs ${
                      h.status === 'approved' ? 'bg-green-100 text-green-700' :
                      h.status === 'pending' ? 'bg-gold-100 text-gold-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {h.status}
                    </span>
                    {!h.is_open && <p className="text-xs text-wine mt-1">Closed</p>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(h._id, h.status)}
                      className="text-xs text-night-800 hover:underline"
                    >
                      Change Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Owners Management
function OwnersManagement({ getToken }: { getToken: () => string | null }) {
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet('/admin/users?role=owner', getToken())
      .then(data => setOwners(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="mb-6 font-display text-3xl text-night-800">Hostel Owners</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border border-cream-300 p-6">
          <p className="text-sm text-ink-500 mb-4">Total: {owners.length} owners</p>
          <div className="space-y-3">
            {owners.map((o) => (
              <div key={o._id} className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <p className="font-medium text-night-800">{o.name}</p>
                  <p className="text-xs text-ink-400">{o.email} • {o.phone || 'No phone'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400">Joined {new Date(o.createdAt).toLocaleDateString()}</p>
                  {o.is_verified && <span className="text-xs text-green-600">✓ Verified</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Students Management
function StudentsManagement({ getToken }: { getToken: () => string | null }) {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet('/admin/users?role=student', getToken())
      .then(data => setStudents(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="mb-6 font-display text-3xl text-night-800">Students</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border border-cream-300 p-6">
          <p className="text-sm text-ink-500 mb-4">Total: {students.length} students</p>
          <div className="space-y-3">
            {students.map((s) => (
              <div key={s._id} className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <p className="font-medium text-night-800">{s.name}</p>
                  <p className="text-xs text-ink-400">{s.email} • {s.phone || 'No phone'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400">Joined {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics
function Analytics({ getToken }: { getToken: () => string | null }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminGet('/admin/stats', getToken())
      .then(setStats)
      .catch(() => {});
  }, [getToken]);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="mb-6 font-display text-3xl text-night-800">Analytics & Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-cream-300 p-6">
          <h3 className="font-display text-lg mb-4">Platform Growth</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-ink-400">Total Platform Views</p>
              <p className="text-2xl font-display text-night-800">{stats?.totalViews || 0}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Total Contact Leads</p>
              <p className="text-2xl font-display text-night-800">{stats?.totalLeads || 0}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Conversion Rate</p>
              <p className="text-2xl font-display text-night-800">
                {stats?.totalViews ? ((stats.totalLeads / stats.totalViews) * 100).toFixed(2) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-cream-300 p-6">
          <h3 className="font-display text-lg mb-4">User Activity</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-ink-400">Active Owners</p>
              <p className="text-2xl font-display text-night-800">{stats?.totalOwners || 0}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Registered Students</p>
              <p className="text-2xl font-display text-night-800">{stats?.totalStudents || 0}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Recent Signups (7 days)</p>
              <p className="text-2xl font-display text-night-800">{stats?.recentSignups || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-cream-100 border border-cream-300 p-6">
        <p className="text-sm text-ink-500">💡 Tip: Integrate Google Analytics for detailed traffic insights</p>
      </div>
    </div>
  );
}

// Main Component
export function AdminDashboard() {
  const { user, loading, getToken } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    if (!loading && (!user || (user.role as string) !== 'admin')) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <div className="flex h-screen items-center justify-center"><p>Loading…</p></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-cream-100">
      <AdminSidebar view={view} setView={setView} />
      <main className="flex-1">
        {view === 'dashboard' && <DashboardOverview getToken={getToken} />}
        {view === 'approvals' && <PendingApprovals getToken={getToken} />}
        {view === 'hostels' && <AllHostels getToken={getToken} />}
        {view === 'owners' && <OwnersManagement getToken={getToken} />}
        {view === 'students' && <StudentsManagement getToken={getToken} />}
        {view === 'analytics' && <Analytics getToken={getToken} />}
      </main>
    </div>
  );
}
