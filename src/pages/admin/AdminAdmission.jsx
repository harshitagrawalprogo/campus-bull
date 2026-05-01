import React, { useState, useEffect } from 'react';

export default function AdminAdmission() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <header className="sticky top-0 right-0 w-full h-20 bg-[#131314]/80 backdrop-blur-md z-40 flex justify-between items-center px-10 font-['Space_Grotesk'] font-medium">
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96">
          <span className="material-symbols-outlined text-zinc-500">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full" placeholder="Search sessions or students..." type="text"/>
        </div>
        <div className="flex items-center gap-6">
          <h2 className="text-[#EF4444] font-bold text-lg">Admin Dashboard</h2>
        </div>
      </header>

      <div className="p-10 space-y-12 overflow-y-auto h-[calc(100vh-80px)]">
        <section className="flex justify-between items-end">
          <div className="space-y-2">
            <h3 className="text-secondary text-sm font-label font-bold tracking-[0.2em] uppercase">Academic Operations</h3>
            <h2 className="text-5xl font-display font-bold tracking-tighter text-white">Admission Counselling</h2>
          </div>
          <div className="flex gap-4">
            <button className="bg-surface-container-highest px-6 py-3 text-white rounded-lg font-label font-medium hover:bg-surface-bright transition-colors">Export Report</button>
            <button className="bg-gradient-to-r from-primary-container to-primary px-8 py-3 rounded-lg font-label font-bold text-white shadow-lg shadow-red-900/20 active:scale-95 transition-transform">Schedule New Session</button>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary text-3xl">event_available</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Total Booked Today</p>
              <p className="text-4xl font-display font-bold text-white">0</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-3xl">pending_actions</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Pending Approvals</p>
              <p className="text-4xl font-display font-bold text-white">0</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 bg-surface-container p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Completed</p>
              <p className="text-4xl font-display font-bold text-white">0</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-6">Upcoming Sessions</h3>
          <div className="bg-surface-container-low rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-highest/30">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">AI Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">No sessions scheduled yet.</td>
                  </tr>
                ) : (
                  sessions.map(session => (
                    <tr key={session.id} className="hover:bg-surface-container-high/40 transition-colors group">
                      <td className="px-6 py-5 text-white font-medium">{session.student}</td>
                      <td className="px-6 py-5 text-zinc-400">{session.rank}</td>
                      <td className="px-6 py-5 text-zinc-400">{session.time}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider 
                          ${session.status === 'PENDING' ? 'bg-secondary/10 text-secondary' : 
                            session.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 
                            'bg-primary/10 text-primary'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {session.status === 'PENDING' && (
                          <button className="text-xs bg-primary text-on-primary px-4 py-2 rounded font-bold">Approve</button>
                        )}
                        {session.status === 'APPROVED' && (
                          <button className="text-xs bg-surface-container-highest text-white px-4 py-2 rounded font-bold">Join Call</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
