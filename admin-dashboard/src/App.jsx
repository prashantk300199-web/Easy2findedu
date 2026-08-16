import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://easytofindedu.onrender.com/api/v1';

const ADMIN_CREDENTIALS = {
  username: 'admin@easytofindedu.com',
  password: 'Admin@2024!Secure',
};

async function apiCall(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'API call failed');
  }
  return res.json();
}

function Spinner() {
  return (
    <div className="p-16 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent animate-spin" />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-50 text-green-700 border border-green-200',
    pending: 'bg-gold-100 text-gold-700 border border-gold-300',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
  };
  return (
    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-medium ${map[status] || 'bg-cream-200 text-ink-500'}`}>
      {status}
    </span>
  );
}

// Login
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      setError('Invalid admin credentials');
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall('/admin/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ email: username, password }),
      });
      const token = data.data?.token || data.token;
      if (token) {
        localStorage.setItem('admin_token', token);
        onLogin(token);
      } else {
        setError('Authentication failed — no token received');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #C9A96A22 0%, transparent 60%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream-50 w-full max-w-md p-10 shadow-liftLg relative"
      >
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-night-800 border border-gold-500/40 mx-auto mb-5 flex items-center justify-center">
            <span className="font-display text-gold-400 text-lg">ET</span>
          </div>
          <h1 className="font-display text-3xl text-night-800 mb-1">Admin Portal</h1>
          <p className="text-xs uppercase tracking-overline text-gold-600">EasyToFindEdu Dashboard</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-overline text-gold-700 mb-2">Email</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-cream-400 bg-white text-night-800 px-4 py-3 text-sm focus:outline-none focus:border-gold-500"
              required autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-overline text-gold-700 mb-2">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-cream-400 bg-white text-night-800 px-4 py-3 text-sm focus:outline-none focus:border-gold-500"
              required autoComplete="off"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-night-800 hover:bg-gold-600 text-cream-100 py-4 text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating…' : 'Login to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Sidebar
function Sidebar({ view, setView, onLogout, stats }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', badge: null },
    { id: 'approvals', label: 'Pending Approvals', badge: stats?.pendingHostels || 0 },
    { id: 'hostels', label: 'All Hostels', badge: stats?.totalHostels || 0 },
    { id: 'inquiries', label: 'Inquiries', badge: null },
    { id: 'owners', label: 'Owners', badge: stats?.totalOwners || 0 },
    { id: 'students', label: 'Students', badge: stats?.totalStudents || 0 },
    { id: 'analytics', label: 'Analytics', badge: null },
  ];

  return (
    <aside className="w-64 bg-night-800 text-cream-100 flex flex-col min-h-screen shrink-0">
      <div className="px-6 py-8 border-b border-gold-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-gold-500/40 flex items-center justify-center">
            <span className="font-display text-gold-400 text-sm">ET</span>
          </div>
          <div>
            <p className="font-display text-cream-100 text-base leading-tight">Admin Panel</p>
            <p className="text-[10px] uppercase tracking-overline text-gold-500/70">EasyToFindEdu</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
              view === item.id
                ? 'bg-gold-500/15 text-gold-400 border-l-2 border-gold-500'
                : 'text-cream-300 hover:text-cream-100 hover:bg-cream-100/5 border-l-2 border-transparent'
            }`}
          >
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="bg-gold-500 text-night-900 text-[10px] px-2 py-0.5 font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-6 border-t border-gold-500/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-sm text-ink-300 hover:text-red-400 transition-colors"
        >
          Sign Out
        </button>
        <p className="text-[10px] text-ink-400 mt-3 px-4">Admin Panel v2.0</p>
      </div>
    </aside>
  );
}

function StatsCard({ label, value, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-cream-50 border border-cream-300 p-6">
      <p className="text-[10px] uppercase tracking-overline text-gold-700 mb-3">{label}</p>
      <p className="font-display text-4xl text-night-800">{value ?? '—'}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div className="mb-10 border-b border-cream-300 pb-6">
      <h1 className="font-display text-4xl text-night-800">{title}</h1>
      {sub && <p className="text-sm text-ink-500 mt-2">{sub}</p>}
    </div>
  );
}

// Dashboard
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [recentHostels, setRecentHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiCall('/admin/hostels/dashboard', token),
      apiCall('/admin/hostels?limit=5&sort=-createdAt', token),
    ])
      .then(([s, h]) => {
        setStats(s.data || s);
        setRecentHostels(h.data?.hostels || h.hostels || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 max-w-6xl">
      <PageHeader title="Dashboard Overview" sub="Real-time platform statistics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatsCard label="Total Hostels" value={stats?.totalHostels} />
        <StatsCard label="Pending Approval" value={stats?.pendingHostels} />
        <StatsCard label="Approved" value={stats?.approvedHostels} />
        <StatsCard label="Total Views" value={stats?.totalViews} />
      </div>
      <div className="grid grid-cols-3 gap-5 mb-10">
        <StatsCard label="Hostel Owners" value={stats?.totalOwners} />
        <StatsCard label="Students" value={stats?.totalStudents} />
        <StatsCard label="Total Leads" value={stats?.totalLeads} />
      </div>

      <div className="bg-cream-50 border border-cream-300 p-6">
        <h2 className="font-display text-2xl text-night-800 mb-6">Recently Added Hostels</h2>
        <div className="space-y-3">
          {recentHostels.length === 0
            ? <p className="text-ink-400 text-sm py-6 text-center">No recent hostels</p>
            : recentHostels.map((h) => (
              <div key={h._id} className="flex items-center justify-between py-4 border-b border-cream-300 last:border-0">
                <div>
                  <p className="font-medium text-night-800">{h.masked_name || h.name}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{h.address?.city} · {h.hostel_type} · {h.owner?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-ink-400">{h.views_count || 0} views</span>
                  <StatusBadge status={h.status} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Approvals
function Approvals({ token }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/admin/hostels?status=pending', token);
      setHostels(data.data?.hostels || data.hostels || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const act = async (id, status) => {
    if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this hostel?`)) return;
    try {
      await apiCall(`/admin/hostels/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-10 max-w-5xl">
      <PageHeader title="Pending Approvals" sub={`${hostels.length} hostels awaiting review`} />
      {hostels.length === 0 ? (
        <div className="border border-green-200 bg-green-50 p-12 text-center">
          <p className="font-display text-2xl text-green-700 mb-2">All caught up</p>
          <p className="text-sm text-green-600">No pending approvals at the moment</p>
        </div>
      ) : (
        <div className="space-y-5">
          {hostels.map((h, i) => (
            <motion.div key={h._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-cream-50 border border-cream-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-night-800 mb-1">{h.masked_name || h.name}</h3>
                  <p className="text-sm text-ink-500">{h.hostel_type} · {h.address?.area}, {h.address?.city}</p>
                  <div className="flex gap-5 text-xs text-ink-400 mt-2">
                    <span>{h.total_hostel_beds || 0} beds</span>
                    <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                    <span>{h.views_count || 0} views</span>
                  </div>
                </div>
              </div>
              <div className="bg-cream-200 p-4 mb-4">
                <p className="text-[10px] uppercase tracking-overline text-gold-700 mb-2">Owner</p>
                <p className="font-medium text-night-800">{h.owner?.name}</p>
                <p className="text-sm text-ink-500">{h.owner?.email}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => act(h._id, 'approved')}
                  className="flex-1 bg-night-800 hover:bg-green-700 text-cream-100 py-3 text-xs uppercase tracking-widest transition-colors">
                  Approve & Publish
                </button>
                <button onClick={() => act(h._id, 'rejected')}
                  className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 py-3 text-xs uppercase tracking-widest transition-colors">
                  Reject
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
function AllHostels({ token }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const path = filter === 'all' ? '/admin/hostels' : `/admin/hostels?status=${filter}`;
    apiCall(path, token)
      .then((d) => setHostels(d.data?.hostels || d.hostels || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, token]);

  const toggleStatus = async (id, current) => {
    const next = current === 'approved' ? 'rejected' : 'approved';
    try {
      await apiCall(`/admin/hostels/${id}/status`, token, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      setHostels(hostels.map((h) => h._id === id ? { ...h, status: next } : h));
    } catch (err) { alert('Failed: ' + err.message); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-10 max-w-6xl">
      <PageHeader title="All Hostels" sub="Manage and monitor all listings" />

      <div className="flex gap-2 mb-6">
        {['all', 'approved', 'pending', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 text-xs uppercase tracking-widest transition-colors ${
              filter === f ? 'bg-night-800 text-cream-100' : 'border border-cream-400 text-ink-500 hover:border-gold-500 hover:text-night-800'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-cream-50 border border-cream-300 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-night-800 text-cream-100">
              {['Hostel', 'Owner', 'Location', 'Stats', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-5 py-4 text-left text-[10px] uppercase tracking-overline font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300">
            {hostels.map((h) => (
              <tr key={h._id} className="hover:bg-cream-100 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-night-800">{h.masked_name || h.name}</p>
                  <p className="text-xs text-ink-400">{h.hostel_type}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-night-800">{h.owner?.name}</p>
                  <p className="text-xs text-ink-400">{h.owner?.email}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-night-800">{h.address?.city}</p>
                  <p className="text-xs text-ink-400">{h.address?.area}</p>
                </td>
                <td className="px-5 py-4 text-xs text-ink-400">
                  <p>{h.views_count || 0} views</p>
                  <p>{h.leads_count || 0} leads</p>
                </td>
                <td className="px-5 py-4"><StatusBadge status={h.status} /></td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleStatus(h._id, h.status)}
                    className="text-xs text-gold-700 hover:text-night-800 underline underline-offset-2 transition-colors">
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inquiries
function Inquiries({ token }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/hostels/inquiries/all', token)
      .then((d) => setInquiries(d.data?.inquiries || d.inquiries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 max-w-4xl">
      <PageHeader title="Inquiries" sub={`${inquiries.length} total inquiries`} />
      <div className="space-y-3">
        {inquiries.length === 0
          ? <p className="text-ink-400 text-sm py-8 text-center">No inquiries yet</p>
          : inquiries.map((inq) => (
            <div key={inq._id} className="bg-cream-50 border border-cream-300 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-night-800">{inq.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-ink-400">{inq.user?.email}</p>
                </div>
                <span className="text-xs text-ink-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-ink-700 mt-2">{inq.message}</p>
              <p className="text-xs text-gold-600 mt-2">Hostel: {inq.hostel?.name || 'N/A'}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function UserList({ token, role, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall(`/admin/users?role=${role}`, token)
      .then((d) => setUsers(d.data?.users || d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 max-w-4xl">
      <PageHeader title={title} sub={`${users.length} registered`} />
      <div className="bg-cream-50 border border-cream-300 divide-y divide-cream-300">
        {users.map((u) => (
          <div key={u._id} className="flex justify-between items-center px-6 py-4 hover:bg-cream-100 transition-colors">
            <div>
              <p className="font-medium text-night-800">{u.name}</p>
              <p className="text-xs text-ink-400 mt-0.5">{u.email} · {u.phone || 'No phone'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-400">{new Date(u.createdAt).toLocaleDateString()}</p>
              {u.is_verified && <p className="text-[10px] text-green-600 mt-0.5">Verified</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiCall('/admin/hostels/dashboard', token)
      .then((d) => setStats(d.data || d))
      .catch(console.error);
  }, [token]);

  return (
    <div className="p-10 max-w-5xl">
      <PageHeader title="Analytics & Insights" sub="Platform performance metrics" />
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-cream-50 border border-cream-300 p-6">
          <h3 className="font-display text-xl text-night-800 mb-6">Platform Growth</h3>
          <div className="space-y-5 divide-y divide-cream-300">
            {[['Total Views', stats?.totalViews], ['Total Leads', stats?.totalLeads],
              ['Conversion Rate', stats?.totalViews ? `${((stats.totalLeads / stats.totalViews) * 100).toFixed(2)}%` : '0%']
            ].map(([label, val]) => (
              <div key={label} className="pt-5 first:pt-0">
                <p className="text-[10px] uppercase tracking-overline text-gold-700">{label}</p>
                <p className="font-display text-3xl text-night-800 mt-1">{val ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-cream-50 border border-cream-300 p-6">
          <h3 className="font-display text-xl text-night-800 mb-6">User Activity</h3>
          <div className="space-y-5 divide-y divide-cream-300">
            {[['Active Owners', stats?.totalOwners], ['Students', stats?.totalStudents],
              ['Pending Hostels', stats?.pendingHostels]
            ].map(([label, val]) => (
              <div key={label} className="pt-5 first:pt-0">
                <p className="text-[10px] uppercase tracking-overline text-gold-700">{label}</p>
                <p className="font-display text-3xl text-night-800 mt-1">{val ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (token) {
      apiCall('/admin/hostels/dashboard', token)
        .then((d) => setStats(d.data || d))
        .catch(console.error);
    }
  }, [token]);

  const handleLogout = () => {
    if (confirm('Sign out?')) {
      localStorage.removeItem('admin_token');
      setToken(null);
    }
  };

  if (!token) return <Login onLogin={setToken} />;

  return (
    <div className="flex min-h-screen bg-cream-200">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} stats={stats} />
      <main className="flex-1 overflow-auto bg-cream-100">
        {view === 'dashboard' && <Dashboard token={token} />}
        {view === 'approvals' && <Approvals token={token} />}
        {view === 'hostels' && <AllHostels token={token} />}
        {view === 'inquiries' && <Inquiries token={token} />}
        {view === 'owners' && <UserList token={token} role="owner" title="Hostel Owners" />}
        {view === 'students' && <UserList token={token} role="student" title="Students" />}
        {view === 'analytics' && <Analytics token={token} />}
      </main>
    </div>
  );
}

export default App;
