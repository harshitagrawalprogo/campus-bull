import React, { useState, useEffect } from 'react';

export default function AdminGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <header className="sticky top-0 right-0 w-full h-20 bg-[#131314]/80 backdrop-blur-md z-40 flex justify-between items-center px-10 font-['Space_Grotesk'] font-medium">
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
          <span className="material-symbols-outlined text-zinc-500">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full" placeholder="Search guides or topics..." type="text"/>
        </div>
        <div className="flex items-center gap-6">
          <h2 className="text-[#EF4444] font-bold text-lg">Admin Dashboard</h2>
        </div>
      </header>

      <div className="p-10 space-y-12 overflow-y-auto h-[calc(100vh-80px)]">
        <section className="flex justify-between items-end">
          <div className="space-y-2">
            <h3 className="text-secondary text-sm font-label font-bold tracking-[0.2em] uppercase">Guidance & Mentorship</h3>
            <h2 className="text-5xl font-display font-bold tracking-tighter text-white">Guide Counselling</h2>
          </div>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-primary-container to-primary px-8 py-3 rounded-lg font-label font-bold text-white shadow-lg shadow-red-900/20 active:scale-95 transition-transform">Add New Guide</button>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-3xl">groups</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Active Guides</p>
              <p className="text-4xl font-display font-bold text-white">{guides.length}</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-3xl">star</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Average Rating</p>
              <p className="text-4xl font-display font-bold text-white">{guides.length > 0 ? '4.7' : '0.0'}</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-green-500 text-3xl">school</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Total Students Mentored</p>
              <p className="text-4xl font-display font-bold text-white">0</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-6">Expert Guides Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.length === 0 ? (
              <p className="text-zinc-500 col-span-3 text-center py-8">No expert guides have been added yet.</p>
            ) : (
              guides.map(guide => (
                <div key={guide.id} className="bg-surface-container p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold text-lg">
                      {guide.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{guide.name}</h4>
                      <p className="text-xs text-primary font-bold">{guide.topic}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                    <div className="text-xs text-zinc-400">
                      <span className="text-secondary font-bold material-symbols-outlined text-sm align-middle mr-1">star</span>
                      {guide.rating}
                    </div>
                    <div className="text-xs text-zinc-400">
                      <span className="text-white font-bold">{guide.students}</span> Students
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <button className="flex-1 py-2 bg-surface-container-low text-white text-xs rounded hover:bg-surface-container-highest transition-colors">View Profile</button>
                     <button className="flex-1 py-2 bg-primary/10 text-primary font-bold text-xs rounded hover:bg-primary/20 transition-colors">Assign Student</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
