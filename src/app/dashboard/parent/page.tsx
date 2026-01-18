'use client';
import { useSession, signOut } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { BG } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Users, Plus, LogOut, Trash2, ArrowRight } from "lucide-react";

type Child = { id: string; nickname: string; ageBracket: string; age: number };

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nickname: "", age: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChildren();
  }, []);

  async function fetchChildren() {
    const res = await fetch("/api/parent/children");
    if (res.ok) {
      const data = await res.json();
      setChildren(data);
    }
  }

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const age = parseInt(formData.age);
    const ageBracket = age <= 12 ? "10-12" : "13-15";

    const res = await fetch("/api/parent/children", {
      method: "POST",
      body: JSON.stringify({ ...formData, ageBracket }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      setIsModalOpen(false);
      setFormData({ nickname: "", age: "" });
      fetchChildren();
    } else {
      const data = await res.json();
      setError(data.error || BG.val_reg_fail_generic);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">{BG.parent_dash_title}</h1>
        </div>
        <button onClick={() => signOut()} className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-all px-4 py-2 rounded-xl hover:bg-red-50">
          <LogOut className="w-5 h-5" /> {BG.auth_logout}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            {BG.parent_my_kids}
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> {BG.parent_add_child_btn}
          </button>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[2rem]">
            <p className="text-slate-300 font-bold text-lg">{BG.parent_no_kids}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {children.map(child => (
              <div key={child.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between group hover:border-blue-200 transition-all">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">{child.nickname}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Група: {child.ageBracket}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/dashboard/child/${child.id}`}
                    className="bg-white text-blue-600 px-5 py-3 rounded-xl font-black text-sm shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    {BG.parent_btn_enter} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-black mb-8 text-slate-900 text-center">{BG.parent_modal_add_title}</h3>
            {error && <p className="text-red-500 text-sm mb-6 bg-red-50 p-4 rounded-2xl border border-red-100 font-bold">{error}</p>}
            <form onSubmit={handleAddChild} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{BG.parent_label_nickname}</label>
                <input 
                  value={formData.nickname}
                  onChange={e => setFormData({...formData, nickname: e.target.value})}
                  required
                  placeholder="напр. TechStar"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{BG.parent_label_age}</label>
                <input 
                  type="number"
                  min="5"
                  max="20"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  required
                  placeholder="напр. 12"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">{BG.parent_btn_cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">{BG.parent_btn_create}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
