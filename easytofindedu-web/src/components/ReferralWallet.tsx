import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalCoinsEarned: number;
}

interface WalletData {
  coins: number;
  referralCode?: string | null;
  referredBy?: string;
}

export function ReferralWallet() {
  const { user, getToken } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const token = getToken();
      console.log('ReferralWallet: Token retrieved:', token ? 'Yes' : 'No');

      if (!token) {
        console.error('ReferralWallet: No token available');
        setWalletData({ coins: 0, referralCode: null });
        setLoading(false);
        return;
      }

      // Load wallet data
      const walletRes = await fetch('https://easytofindedu.onrender.com/api/v1/wallet/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        console.log('ReferralWallet: Wallet data received:', walletData);
        setWalletData(walletData.data || walletData);
      } else {
        const errorData = await walletRes.json();
        console.error('ReferralWallet: Wallet API failed:', errorData);
        setWalletData({ coins: 0, referralCode: null });
      }

      // Load referral stats
      const statsRes = await fetch('https://easytofindedu.onrender.com/api/v1/student/auth/referral-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('ReferralWallet: Referral stats received:', statsData);
        setReferralStats(statsData.data || null);
      } else {
        const errorData = await statsRes.json();
        console.error('ReferralWallet: Referral stats API failed:', errorData);
      }
    } catch (error) {
      console.error('Failed to load wallet/referral data:', error);
      setWalletData({ coins: 0, referralCode: null });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const code = referralStats?.referralCode || walletData?.referralCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyShareLink = () => {
    const code = referralStats?.referralCode || walletData?.referralCode;
    if (code) {
      const link = `${window.location.origin}/login?ref=${code}`;
      navigator.clipboard.writeText(link);
      setShareLink(link);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShareLink('');
      }, 3000);
    }
  };

  if (!user || user.role !== 'student') return null;
  if (loading) return null;

  const referralCode = referralStats?.referralCode || walletData?.referralCode;
  const totalReferrals = referralStats?.totalReferrals || 0;
  const totalCoinsEarned = referralStats?.totalCoinsEarned || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gold-500 to-gold-600 p-6 text-night-900 shadow-lg"
    >
      {/* Wallet Balance */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide2 text-night-800/70">Your Wallet</p>
          <p className="mt-1 font-display text-3xl font-semibold">{walletData?.coins || 0} Coins</p>
        </div>
        <span className="text-4xl">💰</span>
      </div>

      {/* Referral Section */}
      {referralCode && (
        <div className="mt-4 pt-4 border-t border-night-900/20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wide2 text-night-800/70">Refer & Earn</p>
            <div className="text-right">
              <p className="text-xs text-night-800/70">{totalReferrals} successful referral{totalReferrals !== 1 ? 's' : ''}</p>
              <p className="text-sm font-semibold text-night-900">+{totalCoinsEarned} coins earned</p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="mb-3">
            <p className="text-xs text-night-800/70 mb-1.5">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-night-900/10 px-3 py-2 font-mono text-sm font-bold tracking-wider">
                {referralCode}
              </code>
              <button
                onClick={copyReferralCode}
                className="shrink-0 bg-night-900 text-gold-400 px-4 py-2 text-xs uppercase tracking-wide hover:bg-night-800 transition-colors"
              >
                {copied && !shareLink ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div className="mb-3">
            <p className="text-xs text-night-800/70 mb-1.5">Share Link</p>
            <button
              onClick={copyShareLink}
              className="w-full bg-night-900 text-gold-400 px-4 py-2 text-xs uppercase tracking-wide hover:bg-night-800 transition-colors"
            >
              {shareLink ? '✓ Link Copied!' : '📋 Copy Referral Link'}
            </button>
          </div>

          {/* Info */}
          <div className="bg-night-900/10 px-3 py-2 rounded">
            <p className="text-xs text-night-800/80 font-medium mb-1">
              💡 How it works:
            </p>
            <p className="text-xs text-night-800/70">
              • Your friend gets <strong>1,000 coins</strong> when they sign up<br/>
              • You earn <strong>500 coins</strong> for each successful referral
            </p>
          </div>
        </div>
      )}

      {/* Referred By */}
      {walletData?.referredBy && (
        <p className="mt-3 text-xs text-night-800/60">
          ✓ Referred by: {walletData.referredBy}
        </p>
      )}
    </motion.div>
  );
}
