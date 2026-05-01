import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminAnnouncements() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '', scheduledAt: '', expiresAt: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/announcements`, { headers: authHeaders });
      const data = await res.json();
      setAnnouncements(data);
    } catch {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    
    // Ensure logical dates if both provided
    if (form.scheduledAt && form.expiresAt && new Date(form.scheduledAt) >= new Date(form.expiresAt)) {
      setError('Expiry time must be after the schedule time.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/admin/announcements`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          scheduledAt: form.scheduledAt || null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setAnnouncements(prev => [created, ...prev]);
      setForm({ title: '', content: '', imageUrl: '', scheduledAt: '', expiresAt: '' });
      setShowForm(false);
      showToast('✅ Announcement published to all students!');
    } catch {
      setError('Failed to create announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentState) => {
    try {
      const res = await fetch(`${API}/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isActive: !currentState }),
      });
      if (!res.ok) throw new Error();
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentState } : a));
      showToast(!currentState ? '✅ Announcement activated' : '⏸ Announcement paused');
    } catch {
      setError('Failed to update announcement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement? Students will no longer see it.')) return;
    try {
      await fetch(`${API}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('🗑 Announcement deleted.');
    } catch {
      setError('Failed to delete announcement.');
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const activeCount = announcements.filter(a => a.isActive).length;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-surface-container-highest border border-white/10 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 w-full h-20 bg-[#131314]/80 backdrop-blur-md z-40 flex justify-between items-center px-10 font-['Space_Grotesk'] font-medium">
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
          <span className="material-symbols-outlined text-zinc-500">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full outline-none"
            placeholder="Search announcements..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-6">
          <h2 className="text-[#EF4444] font-bold text-lg">Admin Dashboard</h2>
        </div>
      </header>

      <div className="p-10 space-y-10 overflow-y-auto h-[calc(100vh-80px)]">

        {/* Page Title */}
        <section className="flex justify-between items-end">
          <div className="space-y-2">
            <h3 className="text-secondary text-sm font-bold tracking-[0.2em] uppercase">Broadcast</h3>
            <h2 className="text-5xl font-bold tracking-tighter text-white">Announcements</h2>
            <p className="text-zinc-500 text-sm">Publish notices that appear on every student's dashboard in real-time.</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-red-900/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            New Announcement
          </button>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-3 gap-6">
          {[
            { label: 'Total Published', value: announcements.length, icon: 'article', color: 'text-blue-400' },
            { label: 'Currently Active', value: activeCount, icon: 'visibility', color: 'text-green-400' },
            { label: 'Paused / Hidden', value: announcements.length - activeCount, icon: 'visibility_off', color: 'text-zinc-500' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-low p-6 rounded-2xl flex items-center gap-4">
              <span className={`material-symbols-outlined text-3xl ${s.color}`}>{s.icon}</span>
              <div>
                <p className="text-3xl font-bold text-white">{loading ? '…' : s.value}</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-surface-container-low p-8 rounded-3xl border border-white/5 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit</span>
              Compose Announcement
            </h3>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Title *</label>
              <input
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 focus:ring-0 outline-none transition-colors"
                placeholder="e.g. New Mock Test Added — Biology Chapter 12"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                maxLength={120}
              />
              <p className="text-right text-xs text-zinc-600 mt-1">{form.title.length}/120</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Schedule Start (Optional)</label>
                 <input
                   type="datetime-local"
                   className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 focus:ring-0 outline-none transition-colors"
                   value={form.scheduledAt}
                   onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                 />
              </div>
              <div>
                 <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Expiry Time (Optional)</label>
                 <input
                   type="datetime-local"
                   className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 focus:ring-0 outline-none transition-colors"
                   value={form.expiresAt}
                   onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                 />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Image URL (Optional)</label>
              <input
                type="url"
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 focus:ring-0 outline-none transition-colors"
                placeholder="https://example.com/image.png"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Message *</label>
              <textarea
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-white text-sm border border-white/5 focus:border-primary/50 focus:ring-0 outline-none transition-colors resize-none"
                placeholder="Write the full announcement message here..."
                rows={4}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
                maxLength={600}
              />
              <p className="text-right text-xs text-zinc-600 mt-1">{form.content.length}/600</p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-500 px-8 py-3 rounded-xl font-bold text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Publishing…' : <><span className="material-symbols-outlined text-sm">send</span> Publish Now</>}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Announcements list */}
        <section>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">All Announcements</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-surface-container-low rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-16 flex flex-col items-center justify-center gap-4">
              <span className="material-symbols-outlined text-6xl text-zinc-700">campaign</span>
              <p className="text-zinc-500 font-bold">No announcements yet</p>
              <p className="text-zinc-600 text-sm">Click "New Announcement" to broadcast a message to all students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(a => (
                <div
                  key={a.id}
                  className={`bg-surface-container-low p-6 rounded-2xl border flex gap-5 transition-all group ${a.isActive ? 'border-green-500/20' : 'border-white/5 opacity-60'}`}
                >
                  {/* Status dot */}
                  <div className="pt-1 flex-shrink-0">
                    <span className={`w-3 h-3 rounded-full block mt-1 ${a.isActive ? 'bg-green-400 shadow-md shadow-green-500/40' : 'bg-zinc-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h4 className="text-white font-bold text-base flex-1 leading-snug">{a.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-700/50 text-zinc-500'}`}>
                        {a.isActive ? 'LIVE' : 'PAUSED'}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed line-clamp-3">{a.content}</p>
                    <p className="text-zinc-600 text-xs mt-2">Published: {formatDate(a.createdAt)}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleToggle(a.id, a.isActive)}
                      title={a.isActive ? 'Pause' : 'Activate'}
                      className={`p-2 rounded-lg transition-colors ${a.isActive ? 'hover:bg-yellow-500/10 text-yellow-400' : 'hover:bg-green-500/10 text-green-400'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{a.isActive ? 'pause_circle' : 'play_circle'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
