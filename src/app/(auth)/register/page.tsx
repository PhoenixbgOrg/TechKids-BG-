'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BG } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password.length < 8) {
      setError(BG.val_pass_len);
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError(BG.val_pass_match);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || BG.auth_error_generic);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">{BG.auth_register_title}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{BG.auth_names_label}</label>
            <input name="fullName" type="text" required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{BG.auth_email_label}</label>
            <input name="email" type="email" required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{BG.auth_password_label}</label>
            <input name="password" type="password" required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{BG.auth_confirm_pass_label}</label>
            <input name="confirm" type="password" required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" required id="consent" className="mt-1" />
            <label htmlFor="consent" className="text-xs text-slate-600 leading-tight">
              {BG.auth_consent_label}
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-4"
          >
            {loading ? '...' : BG.auth_register_btn}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            {BG.auth_goto_login}
          </Link>
        </div>
      </div>
    </div>
  );
}