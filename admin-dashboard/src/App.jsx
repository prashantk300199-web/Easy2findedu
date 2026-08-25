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

function Spinner() {
  return (
    <div className="p-16 flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
      {status.toUpperCase()}
    </span>
  );
}

// Login Screen
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
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-10 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-night-900 mb-2">Admin Portal</h1>
          <p className="text-sm text-gray-600">EasyToFindEdu Dashboard</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
              placeholder="admin@easytofindedu.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Secured by EasyToFindEdu Authentication</p>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced Sidebar
function Sidebar({ view, setView, onLogout, stats }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      badge: null
    },
    {
      id: 'approvals',
      label: 'Pending Approvals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: stats?.pendingHostels || 0
    },
    {
      id: 'hostels',
      label: 'All Hostels',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      badge: stats?.totalHostels || 0
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      badge: null
    },
    {
      id: 'owners',
      label: 'Owners',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      badge: stats?.totalOwners || 0
    },
    {
      id: 'students',
      label: 'Students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: stats?.totalStudents || 0
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: null
    },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-night-900 to-night-800 text-white flex flex-col min-h-screen shadow-2xl">
      {/* Header */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-lg">ET</span>
          </div>
          <div>
            <p className="font-bold text-white text-lg">Admin Panel</p>
            <p className="text-xs text-gold-400">EasyToFindEdu</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
              view === item.id
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className={view === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gold-400'}>
              {item.icon}
            </span>
            <span className="font-medium flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                view === item.id
                  ? 'bg-white text-gold-600'
                  : 'bg-gold-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-3 group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Sign Out</span>
        </button>
        <p className="text-xs text-gray-500 mt-4 px-4">Admin Panel v2.0</p>
      </div>
    </aside>
  );
}

// Enhanced Stats Card
function StatsCard({ label, value, sub, icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-50 to-transparent rounded-full -mr-16 -mt-16" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center">
            <span className="text-gold-600">{icon}</span>
          </div>
          {trend && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-night-900 mb-1">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </motion.div>
  );
}

function PageHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-night-900 mb-1">{title}</h2>
        {sub && <p className="text-sm text-gray-600">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// Dashboard with Enhanced UI
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Dashboard Overview"
        sub="Welcome back, Admin! Here's what's happening today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Hostels"
          value={stats?.totalHostels || 0}
          sub="Active listings"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          trend={12}
        />
        <StatsCard
          label="Pending Approvals"
          value={stats?.pendingHostels || 0}
          sub="Needs review"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          label="Total Owners"
          value={stats?.totalOwners || 0}
          sub="Registered owners"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend={8}
        />
        <StatsCard
          label="Students"
          value={stats?.totalStudents || 0}
          sub="Active students"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          trend={15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-night-900 mb-6">Platform Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-night-900">{stats?.totalViews || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-night-900">{stats?.totalLeads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-night-900">
                  {stats?.totalViews ? ((stats.totalLeads / stats.totalViews) * 100).toFixed(2) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-night-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gold-50 to-transparent border border-gold-200 rounded-xl hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-night-900">Add New Hostel</p>
                <p className="text-xs text-gray-600">Manually add a hostel listing</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-transparent border border-blue-200 rounded-xl hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-night-900">Generate Report</p>
                <p className="text-xs text-gray-600">Export analytics data</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-transparent border border-green-200 rounded-xl hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-night-900">Manage Payments</p>
                <p className="text-xs text-gray-600">View payment transactions</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Approvals with Enhanced UI
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Pending Approvals"
        sub={`${hostels.length} hostels waiting for review`}
      />

      {hostels.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-night-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {hostels.map((h) => (
            <motion.div
              key={h._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Hostel Image */}
                {h.photos && h.photos[0] && (
                  <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={h.photos[0]}
                      alt={h.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Hostel Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-night-900 mb-1">{h.masked_name || h.name}</h3>
                      <p className="text-sm text-gray-600">{h.hostel_type} · {h.address?.city}, {h.address?.state}</p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Owner</p>
                      <p className="font-semibold text-night-900 text-sm">{h.owner?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Contact</p>
                      <p className="font-semibold text-night-900 text-sm">{h.owner?.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Capacity</p>
                      <p className="font-semibold text-night-900 text-sm">{h.total_beds || 'N/A'} beds</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Submitted</p>
                      <p className="font-semibold text-night-900 text-sm">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approve(h._id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => reject(h._id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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

// All Hostels with Table View
function AllHostels({ token }) {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiCall('/admin/hostels/all', token)
      .then((d) => setHostels(d.data?.hostels || d.hostels || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    try {
      await apiCall(`/admin/hostels/${id}/${newStatus === 'approved' ? 'approve' : 'reject'}`, token, { method: 'PATCH' });
      setHostels((prev) =>
        prev.map((h) => (h._id === id ? { ...h, status: newStatus } : h))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredHostels = filter === 'all' ? hostels : hostels.filter(h => h.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="All Hostels"
        sub={`${filteredHostels.length} total hostels`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-night-800 to-night-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Hostel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Owner</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHostels.map((h) => (
                <tr key={h._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {h.photos && h.photos[0] && (
                        <img
                          src={h.photos[0]}
                          alt={h.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-night-900">{h.masked_name || h.name}</p>
                        <p className="text-xs text-gray-500">{h.hostel_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-night-900">{h.owner?.name}</p>
                    <p className="text-xs text-gray-500">{h.owner?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-night-900">{h.address?.city}</p>
                    <p className="text-xs text-gray-500">{h.address?.area}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <div className="bg-blue-50 px-2 py-1 rounded">
                        <p className="text-xs text-blue-700 font-semibold">{h.views_count || 0} views</p>
                      </div>
                      <div className="bg-green-50 px-2 py-1 rounded">
                        <p className="text-xs text-green-700 font-semibold">{h.leads_count || 0} leads</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(h._id, h.status)}
                      className="text-sm font-medium text-gold-600 hover:text-gold-700 underline underline-offset-2 transition-colors"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inquiries View
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader title="Inquiries" sub={`${inquiries.length} total inquiries`} />

      <div className="grid gap-4">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-night-900 mb-2">No Inquiries Yet</h3>
            <p className="text-gray-600">Check back later for new inquiries.</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <motion.div
              key={inq._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gold-700 text-lg">
                      {(inq.user?.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-night-900">{inq.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">{inq.user?.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-800">{inq.message}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Regarding:</span>
                <span className="font-medium text-gold-600">{inq.hostel?.name || 'N/A'}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// User List Component
function UserList({ token, role, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiCall(`/admin/users?role=${role}`, token)
      .then((d) => setUsers(d.data?.users || d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, role]);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title={title}
        sub={`${filteredUsers.length} registered`}
        action={
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        }
      />

      <div className="grid gap-4">
        {filteredUsers.map((u) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full flex items-center justify-center">
                <span className="font-bold text-gold-700 text-xl">
                  {u.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-night-900 text-lg">{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
                <p className="text-xs text-gray-500 mt-1">{u.phone || 'No phone provided'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              {u.is_verified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Analytics Dashboard
function Analytics({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/admin/hostels/dashboard', token)
      .then((d) => setStats(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader title="Analytics & Insights" sub="Platform performance metrics" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-night-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Platform Growth
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Total Views', value: stats?.totalViews || 0, color: 'blue' },
              { label: 'Total Leads', value: stats?.totalLeads || 0, color: 'green' },
              { label: 'Conversion Rate', value: stats?.totalViews ? `${((stats.totalLeads / stats.totalViews) * 100).toFixed(2)}%` : '0%', color: 'purple' }
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-r from-${color}-50 to-transparent p-6 rounded-xl border border-${color}-100`}>
                <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                <p className="text-4xl font-bold text-night-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-night-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            User Activity
          </h3>
          <div className="space-y-6">
            {[
              { label: 'Active Owners', value: stats?.totalOwners || 0, color: 'amber' },
              { label: 'Students', value: stats?.totalStudents || 0, color: 'teal' },
              { label: 'Pending Hostels', value: stats?.pendingHostels || 0, color: 'red' }
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-r from-${color}-50 to-transparent p-6 rounded-xl border border-${color}-100`}>
                <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                <p className="text-4xl font-bold text-night-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
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
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('admin_token');
      setToken(null);
    }
  };

  if (!token) return <Login onLogin={setToken} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} stats={stats} />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && <Dashboard token={token} />}
          {view === 'approvals' && <Approvals token={token} />}
          {view === 'hostels' && <AllHostels token={token} />}
          {view === 'inquiries' && <Inquiries token={token} />}
          {view === 'owners' && <UserList token={token} role="owner" title="Hostel Owners" />}
          {view === 'students' && <UserList token={token} role="student" title="Students" />}
          {view === 'analytics' && <Analytics token={token} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
