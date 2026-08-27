import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export function ReferralWallet() {
  const { user, getToken } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      const token = getToken();
      const res = await fetch('https://easytofindedu.onrender.com/api/v1/wallet/wallet', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWalletData(data.data || data);
      } else {
        // Set default data if API fails
        setWalletData({ coins: 0, referralCode: null });
      }
    } catch (error) {
      console.error('Failed to load wallet data');
      // Set default data on error
      setWalletData({ coins: 0, referralCode: null });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (walletData?.referralCode) {
      navigator.clipboard.writeText(walletData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user || user.role !== 'student') return null;
  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gold-500 to-gold-600 p-6 text-night-900 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide2 text-night-800/70">Your Wallet</p>
          <p className="mt-1 font-display text-3xl font-semibold">{walletData?.coins || 0} Coins</p>
        </div>
        <span className="text-4xl">💰</span>
      </div>

      {walletData?.referralCode && (
        <div className="mt-4 pt-4 border-t border-night-900/20">
          <p className="text-[10px] uppercase tracking-wide2 text-night-800/70 mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-night-900/10 px-3 py-2 font-mono text-sm font-bold tracking-wider">
              {walletData.referralCode}
            </code>
            <button
              onClick={copyReferralCode}
              className="shrink-0 bg-night-900 text-gold-400 px-4 py-2 text-xs uppercase tracking-wide hover:bg-night-800 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-night-800/60">
            Share this code with friends. Both get 1000 coins when they sign up!
          </p>
        </div>
      )}

      {walletData?.referredBy && (
        <p className="mt-3 text-xs text-night-800/60">
          ✓ Referred by: {walletData.referredBy}
        </p>
      )}
    </motion.div>
  );
}
