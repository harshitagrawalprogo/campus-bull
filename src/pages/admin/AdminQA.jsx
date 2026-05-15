import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

export default function AdminQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerModal, setAnswerModal] = useState({ isOpen: false, questionId: null, content: '' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await apiFetch('/qa');
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiFetch(`/qa/question/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerModal.content.trim()) return;
    try {
      await apiFetch(`/qa/question/${answerModal.questionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ content: answerModal.content })
      });
      setAnswerModal({ isOpen: false, questionId: null, content: '' });
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingQuestions = questions.filter(q => q.status === 'PENDING');
  const answeredQuestions = questions.filter(q => q.status === 'APPROVED' && q.answers && q.answers.length > 0);
  const rejectedQuestions = questions.filter(q => q.status === 'REJECTED');

  return (
    <>
      {/* TopNavBar */}
      <header className="sticky top-0 right-0 w-full h-20 bg-[#131314]/80 backdrop-blur-md z-40 flex justify-between items-center px-10 font-['Space_Grotesk'] font-medium">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Q/A Management</h2>
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">search</span>
            <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/40 text-zinc-200 placeholder-zinc-600 transition-all" placeholder="Search questions, students, or topics..." type="text"/>
          </div>
        </div>
      </header>

      {/* Dashboard Canvas */}
      <div className="p-10 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Page Hero / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group hover:bg-surface-container transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">pending_actions</span>
            </div>
            <p className="text-sm font-label text-secondary tracking-widest uppercase mb-2">Pending Review</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-white">{pendingQuestions.length}</h3>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group hover:bg-surface-container transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">check_circle</span>
            </div>
            <p className="text-sm font-label text-zinc-500 tracking-widest uppercase mb-2">Answered / Approved</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-white">{answeredQuestions.length}</h3>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group hover:bg-surface-container transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-8xl">psychology</span>
            </div>
            <p className="text-sm font-label text-zinc-500 tracking-widest uppercase mb-2">Total Questions</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-white">{questions.length}</h3>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="flex flex-col gap-16">
          {/* Pending Questions */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary rounded-full"></span>
                  Pending Questions
                </h3>
                <p className="text-zinc-500 mt-1 text-sm">Critical inquiries requiring immediate attention</p>
              </div>
            </div>
            
            {loading ? (
              <p className="text-zinc-400">Loading questions...</p>
            ) : pendingQuestions.length === 0 ? (
              <p className="text-zinc-400">No pending questions.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingQuestions.map(q => (
                  <div key={q.id} className="bg-surface-container p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">General</span>
                        <span className="text-[10px] text-zinc-500 font-label">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-zinc-200 font-medium mb-4 leading-relaxed line-clamp-3">{q.content}</h4>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">{q.user.name[0]}</div>
                        <span className="text-xs text-zinc-400 font-medium">{q.user.name} <span className="text-zinc-600 ml-1">• {q.user.role}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setAnswerModal({ isOpen: true, questionId: q.id, content: '' })}
                        className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Answer
                      </button>
                      <button onClick={() => handleUpdateStatus(q.id, 'APPROVED')} className="p-2.5 rounded-lg bg-surface-container-highest text-green-400 hover:text-green-300 transition-colors" title="Approve Without Answer">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                      <button onClick={() => handleUpdateStatus(q.id, 'REJECTED')} className="p-2.5 rounded-lg bg-surface-container-highest text-zinc-300 hover:text-red-400 transition-colors" title="Reject">
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Two Column Layout for Answered and Rejected */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-10">
            {/* Answered Questions */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                    Answered
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {answeredQuestions.map(q => (
                  <div key={q.id} className="bg-surface-container-low p-5 rounded-xl border border-white/5 flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-green-500">task_alt</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium text-zinc-300 mb-1 line-clamp-1">{q.content}</h5>
                        <span className="text-[10px] text-zinc-600">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1 mb-2">Answer: {q.answers[0]?.content}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus(q.id, 'REJECTED')} className="text-[10px] text-red-500 font-bold uppercase tracking-tighter hover:underline">Revoke</button>
                      </div>
                    </div>
                  </div>
                ))}
                {answeredQuestions.length === 0 && <p className="text-zinc-500 text-sm">No answered questions yet.</p>}
              </div>
            </section>

            {/* Rejected Questions */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                    Rejected
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {rejectedQuestions.map(q => (
                  <div key={q.id} className="bg-surface-container-low p-5 rounded-xl border border-white/5 flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-500">block</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium text-zinc-300 mb-1 line-clamp-1">{q.content}</h5>
                        <span className="text-[10px] text-zinc-600">{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">By {q.user.name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus(q.id, 'PENDING')} className="text-[10px] text-primary font-bold uppercase tracking-tighter hover:underline">Restore</button>
                      </div>
                    </div>
                  </div>
                ))}
                {rejectedQuestions.length === 0 && <p className="text-zinc-500 text-sm">No rejected questions.</p>}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Answer Modal */}
      {answerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container p-6 rounded-2xl w-full max-w-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Provide an Answer</h3>
            <textarea 
              className="w-full h-32 bg-surface-container-low border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none mb-4 resize-none"
              placeholder="Type your answer here..."
              value={answerModal.content}
              onChange={(e) => setAnswerModal({ ...answerModal, content: e.target.value })}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAnswerModal({ isOpen: false, questionId: null, content: '' })}
                className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAnswerSubmit}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
