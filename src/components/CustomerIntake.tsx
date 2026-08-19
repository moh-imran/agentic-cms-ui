import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { AgentTicket } from '../types';

interface Props {
  tickets: AgentTicket[];
  onTicketCreated: (ticketId: string) => void;
  onSelectTicket: (ticketId: string) => void;
  selectedTicket: AgentTicket | null;
}

export const CustomerIntake: React.FC<Props> = ({ tickets, onTicketCreated, onSelectTicket, selectedTicket }) => {
  const [customerName, setCustomerName] = useState('Layla Al-Otaibi');
  const [channel, setChannel] = useState('Mobile App');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastCreated, setLastCreated] = useState<AgentTicket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/agentic/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName, channel, subject, description })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setLastCreated(data.ticket);
        setSubject('');
        setDescription('');
        onTicketCreated(data.ticket.ticket_id);
      }
    } catch (err) {
      console.error('Failed to submit complaint', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submit Complaint / Request</h2>
              <p className="text-xs text-slate-400">Handled end-to-end by the Autonomous Agent Pipeline</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Mobile App">Mobile App</option>
                <option value="Online Banking">Online Banking</option>
                <option value="Branch">Branch</option>
                <option value="Call Center">Call Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Summary</label>
              <input
                type="text"
                placeholder="e.g., ATM did not dispense cash"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Description</label>
              <textarea
                rows={4}
                placeholder="Provide detailed information regarding your dispute or inquiry..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/30"
            >
              {submitting ? (
                <span>Intake Agent Processing...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit to Agent Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {lastCreated && (
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Ticket Created ({lastCreated.ticket_id})</span>
              </div>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Intake Agent
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <p><strong className="text-slate-400">Classified Category:</strong> {lastCreated.category}</p>
              <p><strong className="text-slate-400">Type:</strong> {lastCreated.case_type} ({lastCreated.severity} Severity)</p>
              <p className="text-indigo-300 pt-1">Head to the <strong>Pipeline Monitor</strong> tab to watch the agents process this ticket live.</p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">My Submitted Cases</h2>
          <div className="grid grid-cols-1 gap-3 max-h-[520px] overflow-y-auto pr-1">
            {tickets.length === 0 && (
              <p className="text-sm text-slate-500">No tickets yet. Submit a complaint to see the agent pipeline in action.</p>
            )}
            {tickets.map((t) => (
              <div
                key={t.ticket_id}
                onClick={() => onSelectTicket(t.ticket_id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedTicket?.ticket_id === t.ticket_id
                    ? 'bg-indigo-950/40 border-indigo-500/60'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-400">{t.ticket_id}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full badge-stage">{t.pipeline_stage}</span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">{t.subject}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>Category: {t.category}</span>
                  <span className="text-indigo-300 font-medium">{t.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
