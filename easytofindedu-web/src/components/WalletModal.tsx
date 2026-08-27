import { useEffect, useState } from 'react';
import { cx } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/api';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletData {
  coins: number;
  referralCode: string;
  transactions: Array<{
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    timestamp: string;
  }>;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { getToken } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/wallet/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWallet(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (wallet?.referralCode) {
      navigator.clipboard.writeText(wallet.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-cream-50 border border-cream-300 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-cream-300 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-night-800">Your Wallet</h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-night-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-ink-500">
            Loading...
          </div>
        ) : wallet ? (
          <div className="px-6 py-6 space-y-6">
            {/* Coins Balance */}
            <div className="text-center py-6 bg-gold-50 border border-gold-200">
              <div className="text-5xl font-display text-gold-700 mb-2">{wallet.coins}</div>
              <div className="text-sm uppercase tracking-wide text-gold-600">Total Coins</div>
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink-500 mb-2">
                Your Referral Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wallet.referralCode || 'Generating...'}
                  readOnly
                  className="flex-1 border border-cream-300 px-4 py-3 font-mono text-lg text-night-800 bg-cream-100"
                />
                <button
                  onClick={copyReferralCode}
                  className="bg-gold-600 hover:bg-gold-700 text-cream-50 px-6 py-3 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-ink-500 mt-2">
                Share this code with friends. They get 1000 coins, you get 500 coins!
              </p>
            </div>

            {/* Recent Transactions */}
            {wallet.transactions && wallet.transactions.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-wide text-ink-500 mb-3">
                  Recent Transactions
                </h3>
                <div className="space-y-2">
                  {wallet.transactions.slice(0, 5).map((tx, index) => (
                    <div
                      key={index}
                      className="border border-cream-300 px-4 py-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-night-800 truncate">{tx.description}</div>
                        <div className="text-xs text-ink-400 mt-1">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={cx(
                        'text-sm font-medium whitespace-nowrap',
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-ink-500">
            Failed to load wallet
          </div>
        )}
      </div>
    </div>
  );
}
