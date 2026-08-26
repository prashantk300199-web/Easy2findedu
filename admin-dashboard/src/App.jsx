import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'https://api.easytofindedu.com/api/v1';

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

/* ─── Utilities ────────────────────────────────────────────── */

function Spinner() {
  return (
    <div className="flex items-center justify-center p-20">
      <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-gold-50 text-gold-700 border border-gold-300',
    rejected: 'bg-wine/10 text-wine border border-wine/20',
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-overline font-medium ${styles[status] || 'bg-cream-200 text-ink-500'}`}>
      {status}
    </span>
  );
}

/* ─── Login Screen ─────────────────────────────────────────── */

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
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream-50 w-full max-w-md border border-cream-300 p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-block w-16 h-16 border-2 border-gold-500 mb-6 flex items-center justify-center">
            <span className="font-display text-gold-600 text-xl">EA</span>
          </div>
          <h1 className="font-display text-[32px] text-night-800 mb-2">Admin Portal</h1>
          <p className="text-[11px] uppercase tracking-overline text-gold-600">EasyToFindEdu</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 border-l-2 border-wine bg-cream-200 px-5 py-3 text-sm text-wine"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none"
              placeholder="admin@easytofindedu.com"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-overline text-gold-600 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-cream-300 bg-transparent py-3 text-[15px] text-night-800 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-night-800 py-4 text-[12px] uppercase tracking-wide2 text-cream-100 transition-colors duration-300 hover:bg-gold-600 disabled:opacity-60 mt-8"
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────── */

function Sidebar({ view, setView, onLogout, stats }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', count: null },
    { id: 'approvals', label: 'Pending Approvals', count: stats?.pendingHostels || 0 },
    { id: 'hostels', label: 'All Hostels', count: stats?.totalHostels || 0 },
    { id: 'inquiries', label: 'Inquiries', count: null },
    { id: 'owners', label: 'Owners', count: stats?.totalOwners || 0 },
    { id: 'students', label: 'Students', count: stats?.totalStudents || 0 },
    { id: 'analytics', label: 'Analytics', count: null },
  ];

  return (
    <aside className="w-72 bg-night-800 text-cream-100 flex flex-col min-h-screen border-r border-gold-500/20">
      {/* Header */}
      <div className="p-8 border-b border-gold-500/20">
        <div className="w-12 h-12 border-2 border-gold-500 mb-4 flex items-center justify-center">
          <span className="font-display text-gold-400 text-lg">EA</span>
        </div>
        <h1 className="font-display text-[20px] text-cream-100 mb-1">Admin Panel</h1>
        <p className="text-[10px] uppercase tracking-overline text-gold-400">EasyToFindEdu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-5 py-3.5 text-[13px] transition-all duration-300 flex items-center justify-between group ${
              view === item.id
                ? 'bg-gold-500 text-night-900 font-medium'
                : 'text-cream-100/70 hover:bg-cream-100/5 hover:text-cream-100'
            }`}
          >
            <span>{item.label}</span>
            {item.count !== null && item.count > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                view === item.id
                  ? 'bg-night-800 text-gold-400'
                  : 'bg-gold-500/20 text-gold-400'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gold-500/20">
        <button
          onClick={onLogout}
          className="w-full text-left px-5 py-3.5 text-[13px] text-cream-100/70 hover:bg-wine/20 hover:text-wine/80 transition-all"
        >
          Sign Out
        </button>
        <p className="text-[10px] text-ink-400 mt-4 px-5">Admin Panel v2.0</p>
      </div>
    </aside>
  );
}

/* ─── Dashboard View ───────────────────────────────────────── */

function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/hostels/dashboard', token)
      .then((d) => setStats(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  const cards = [
    { label: 'Total Hostels', value: stats?.totalHostels || 0, sub: 'Active listings' },
    { label: 'Pending Approvals', value: stats?.pendingHostels || 0, sub: 'Awaiting review' },
    { label: 'Total Owners', value: stats?.totalOwners || 0, sub: 'Registered owners' },
    { label: 'Students', value: stats?.totalStudents || 0, sub: 'Active students' },
  ];

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Dashboard Overview</h2>
        <p className="text-sm text-ink-500">Platform statistics and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-cream-50 border border-cream-300 p-6"
          >
            <p className="text-[11px] uppercase tracking-overline text-gold-600 mb-3">
              {card.label}
            </p>
            <p className="font-display text-[40px] text-night-800 mb-1">{card.value}</p>
            <p className="text-xs text-ink-400">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cream-50 border border-cream-300 p-8">
          <h3 className="font-display text-[24px] text-night-800 mb-6">Platform Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-cream-300">
              <div>
                <p className="text-[11px] uppercase tracking-overline text-ink-400">Total Views</p>
                <p className="font-display text-[28px] text-night-800">{stats?.totalViews || 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-cream-300">
              <div>
                <p className="text-[11px] uppercase tracking-overline text-ink-400">Total Leads</p>
                <p className="font-display text-[28px] text-night-800">{stats?.totalLeads || 0}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-overline text-ink-400">Conversion Rate</p>
                <p className="font-display text-[28px] text-night-800">
                  {stats?.totalViews ? ((stats.totalLeads / stats.totalViews) * 100).toFixed(2) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cream-50 border border-cream-300 p-8">
          <h3 className="font-display text-[24px] text-night-800 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-4 p-4 border border-cream-300 hover:border-gold-500 transition-colors">
              <div className="w-10 h-10 bg-gold-500 flex items-center justify-center text-night-900 text-xl">+</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-night-800">Add New Hostel</p>
                <p className="text-xs text-ink-400">Manually add a hostel listing</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 border border-cream-300 hover:border-gold-500 transition-colors">
              <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-white text-xl">📊</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-night-800">Generate Report</p>
                <p className="text-xs text-ink-400">Export analytics data</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Approvals View ───────────────────────────────────────── */

function Approvals({ token }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/hostels/pending', token)
      .then((d) => setHostels(d.data?.hostels || d.hostels || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const approve = async (id) => {
    try {
      await apiCall(`/admin/hostels/${id}/approve`, token, { method: 'PATCH' });
      setHostels((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const reject = async (id) => {
    try {
      await apiCall(`/admin/hostels/${id}/reject`, token, { method: 'PATCH' });
      setHostels((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Pending Approvals</h2>
        <p className="text-sm text-ink-500">{hostels.length} hostels awaiting review</p>
      </div>

      {hostels.length === 0 ? (
        <div className="bg-cream-50 border border-cream-300 p-20 text-center">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h3 className="font-display text-[24px] text-night-800 mb-2">All Caught Up!</h3>
          <p className="text-sm text-ink-500">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {hostels.map((h) => (
            <motion.div
              key={h._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cream-50 border border-cream-300 p-8"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Hostel Image */}
                {h.photos && h.photos[0] && (
                  <div className="w-full lg:w-64 h-48 border border-cream-300 overflow-hidden flex-shrink-0">
                    <img src={h.photos[0]} alt={h.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-display text-[24px] text-night-800 mb-1">
                        {h.masked_name || h.name}
                      </h3>
                      <p className="text-sm text-ink-500">
                        {h.hostel_type} · {h.address?.city}, {h.address?.state}
                      </p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border-l-2 border-gold-500 pl-3">
                      <p className="text-[10px] uppercase tracking-overline text-ink-400 mb-1">Owner</p>
                      <p className="text-sm text-night-800">{h.owner?.name || 'N/A'}</p>
                    </div>
                    <div className="border-l-2 border-gold-500 pl-3">
                      <p className="text-[10px] uppercase tracking-overline text-ink-400 mb-1">Contact</p>
                      <p className="text-sm text-night-800">{h.owner?.phone || 'N/A'}</p>
                    </div>
                    <div className="border-l-2 border-gold-500 pl-3">
                      <p className="text-[10px] uppercase tracking-overline text-ink-400 mb-1">Submitted</p>
                      <p className="text-sm text-night-800">
                        {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="border-l-2 border-gold-500 pl-3">
                      <p className="text-[10px] uppercase tracking-overline text-ink-400 mb-1">Type</p>
                      <p className="text-sm text-night-800 capitalize">{h.hostel_type}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approve(h._id)}
                      className="px-8 py-3 bg-emerald-600 text-white text-[12px] uppercase tracking-wide2 hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(h._id)}
                      className="px-8 py-3 bg-wine text-white text-[12px] uppercase tracking-wide2 hover:bg-wine/90 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── All Hostels View ─────────────────────────────────────── */

function AllHostels({ token }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/hostels', token)
      .then((d) => setHostels(d.data?.hostels || d.hostels || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">All Hostels</h2>
        <p className="text-sm text-ink-500">{hostels.length} hostels in the system</p>
      </div>

      <div className="bg-cream-50 border border-cream-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-300">
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Name</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Location</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Type</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Status</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Verified</th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((h) => (
              <tr key={h._id} className="border-b border-cream-300 hover:bg-cream-100">
                <td className="p-4 text-sm text-night-800">{h.masked_name || h.name}</td>
                <td className="p-4 text-sm text-ink-500">{h.address?.city}, {h.address?.state}</td>
                <td className="p-4 text-sm text-ink-500 capitalize">{h.hostel_type}</td>
                <td className="p-4"><StatusBadge status={h.status} /></td>
                <td className="p-4 text-sm text-ink-500">
                  {h.verification_status === 'verified' ? '✓ Yes' : '✗ No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Inquiries View ───────────────────────────────────────── */

function Inquiries({ token }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/inquiries', token)
      .then((d) => setInquiries(d.data?.inquiries || d.inquiries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Inquiries</h2>
        <p className="text-sm text-ink-500">{inquiries.length} total inquiries</p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div key={inq._id} className="bg-cream-50 border border-cream-300 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-medium text-night-800 mb-1">{inq.name}</p>
                <p className="text-sm text-ink-500">{inq.email} · {inq.phone}</p>
              </div>
              <p className="text-xs text-ink-400">
                {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <p className="text-sm text-ink-500">
              {inq.address || 'No message'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Owners/Students Views (Similar Structure) ────────────── */

function Owners({ token }) {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/users/owners', token)
      .then((d) => setOwners(d.data?.owners || d.owners || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Hostel Owners</h2>
        <p className="text-sm text-ink-500">{owners.length} registered owners</p>
      </div>

      <div className="bg-cream-50 border border-cream-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-300">
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Name</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Email</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Phone</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o._id} className="border-b border-cream-300 hover:bg-cream-100">
                <td className="p-4 text-sm text-night-800">{o.name}</td>
                <td className="p-4 text-sm text-ink-500">{o.email}</td>
                <td className="p-4 text-sm text-ink-500">{o.phone || 'N/A'}</td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Students({ token }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/users/students', token)
      .then((d) => setStudents(d.data?.students || d.students || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Students</h2>
        <p className="text-sm text-ink-500">{students.length} registered students</p>
      </div>

      <div className="bg-cream-50 border border-cream-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-300">
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Name</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Email</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Phone</th>
              <th className="text-left p-4 text-[10px] uppercase tracking-overline text-ink-400">Gender</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-cream-300 hover:bg-cream-100">
                <td className="p-4 text-sm text-night-800">{s.name}</td>
                <td className="p-4 text-sm text-ink-500">{s.email}</td>
                <td className="p-4 text-sm text-ink-500">{s.phone || 'N/A'}</td>
                <td className="p-4 text-sm text-ink-500 capitalize">{s.gender || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Analytics({ token }) {
  return (
    <div className="p-10 bg-cream min-h-screen">
      <div className="mb-10">
        <h2 className="font-display text-[36px] text-night-800 mb-2">Analytics</h2>
        <p className="text-sm text-ink-500">Platform insights and metrics</p>
      </div>
      <div className="bg-cream-50 border border-cream-300 p-20 text-center">
        <p className="text-ink-400">Analytics feature coming soon</p>
      </div>
    </div>
  );
}

/* ─── Main App ─────────────────────────────────────────────── */

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (token) {
      apiCall('/admin/hostels/dashboard', token)
        .then((d) => setStats(d.data || d))
        .catch(() => {});
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  if (!token) return <Login onLogin={setToken} />;

  return (
    <div className="flex bg-cream min-h-screen">
      <Sidebar view={view} setView={setView} onLogout={logout} stats={stats} />
      <main className="flex-1">
        {view === 'dashboard' && <Dashboard token={token} />}
        {view === 'approvals' && <Approvals token={token} />}
        {view === 'hostels' && <AllHostels token={token} />}
        {view === 'inquiries' && <Inquiries token={token} />}
        {view === 'owners' && <Owners token={token} />}
        {view === 'students' && <Students token={token} />}
        {view === 'analytics' && <Analytics token={token} />}
      </main>
    </div>
  );
}
