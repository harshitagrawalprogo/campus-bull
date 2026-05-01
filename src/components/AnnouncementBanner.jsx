import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    fetch(`${API}/api/announcements`)
      .then(r => r.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter(a => !dismissed.includes(a.id));

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify(next));
    setCurrent(0);
  };

  if (visible.length === 0) return null;

  const ann = visible[current % visible.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-low border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={() => dismiss(ann.id)}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Image */}
        {ann.imageUrl ? (
          <div className="w-full h-48 sm:h-64 flex-shrink-0 bg-surface-container-highest relative">
            <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
          </div>
        ) : (
          <div className="w-full h-32 flex-shrink-0 bg-gradient-to-br from-red-600/20 to-red-900/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-5xl text-red-500/50" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest">
               Platform Update
             </span>
             {ann.expiresAt && (
               <span className="text-xs text-zinc-500">
                 Ends {new Date(ann.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
               </span>
             )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{ann.title}</h2>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
        </div>

        {/* Footer actions */}
        <div className="p-6 sm:p-8 pt-0 mt-auto">
           {visible.length > 1 && (
             <div className="flex gap-1.5 mb-6 justify-center">
               {visible.map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setCurrent(i)}
                   className="h-1.5 rounded-full transition-all"
                   style={{ 
                     width: i === current % visible.length ? '24px' : '12px',
                     background: i === current % visible.length ? '#EF4444' : 'rgba(255,255,255,0.1)' 
                   }}
                 />
               ))}
             </div>
           )}
           <button
             onClick={() => dismiss(ann.id)}
             className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
           >
             {visible.length > 1 ? 'Next Announcement' : 'Got it, let\'s go!'}
           </button>
        </div>

      </div>
    </div>
  );
}
