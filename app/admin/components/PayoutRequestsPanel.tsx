"use client";

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabaseClient';
import { Check, X, CreditCard, Building, User } from 'lucide-react';

type PayoutItem = {
  id: string;
  creator_shop_id: string;
  user_id: string;
  amount: number;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_upi_id: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
  creator_shops?: {
    name: string;
    slug: string;
  };
};

export default function PayoutRequestsPanel() {
  const [requests, setRequests] = useState<PayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/payouts', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setRequests(json.payoutRequests || []);
      }
    } catch (e) {
      console.error('Failed to load payout requests', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'paid' | 'rejected') => {
    setActionLoading(id);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        await loadRequests();
      }
    } catch (e) {
      console.error('Failed to update payout status', e);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-zinc-500">Loading creator payout requests...</div>;
  }

  const pending = requests.filter(r => r.status === 'pending');
  const processed = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Creator Payout Requests</h1>
        <p className="text-xs text-zinc-500 font-medium mt-1">Review creator payout requests and transfer funds to bank/UPI.</p>
      </header>

      {/* Pending Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending Requests ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-xs text-zinc-500 font-medium">
            ✓ No pending creator payout requests!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((item) => (
              <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{item.creator_shops?.name || 'Creator'}</span>
                  <span className="text-xl font-black text-emerald-700">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-700 bg-white p-3 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-semibold">{item.bank_account_name || 'Name not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono font-bold">{item.bank_account_number || 'A/C not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono">IFSC: {item.bank_ifsc || 'N/A'}</span>
                  </div>
                  {item.bank_upi_id && (
                    <div className="text-[11px] font-bold text-sky-700 pt-1">
                      UPI ID: {item.bank_upi_id}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'paid')}
                    disabled={actionLoading === item.id}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Paid
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'rejected')}
                    disabled={actionLoading === item.id}
                    className="w-full py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="space-y-4 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Payout History</h2>
        {processed.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-xs text-zinc-400">
            No payout history yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {processed.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-bold text-zinc-900">{item.creator_shops?.name || 'Creator'}</td>
                    <td className="py-3 px-4 font-black text-zinc-900">₹{item.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      {item.status === 'paid' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          ❌ Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
