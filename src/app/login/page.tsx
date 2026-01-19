
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BG } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);

    const res = await fetch('/api/auth/kid', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 border border-slate-800">
        <h2 className="text-3xl font-black text-orange-500 mb-8 text-center uppercase tracking-widest">{BG.login_title}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">{BG.login_label}</label>
            <input 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-black border border-slate-700 p-4 text-white text-lg font-bold focus:border-orange-500 outline-none transition-colors"
              placeholder="Ex: CyberNinja"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {loading ? '...' : BG.login_btn}
          </button>
        </form>
      </div>
    </div>
  );
}
