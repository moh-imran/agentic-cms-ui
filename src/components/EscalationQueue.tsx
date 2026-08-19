import React from 'react';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { AgentTicket } from '../types';

interface Props {
  tickets: AgentTicket[];
  onSelectTicket: (ticketId: string) => void;
  onGoToMonitor: () => void;
}

export const EscalationQueue: React.FC<Props> = ({ tickets, onSelectTicket, onGoToMonitor }) => {
  const escalated = tickets.filter((t) => t.pipeline_stage === 'Escalated-L2' || t.pipeline_stage === 'Escalated-CRA');
  const l2 = escalated.filter((t) => t.pipeline_stage === 'Escalated-L2');
  const cra = escalated.filter((t) => t.pipeline_stage === 'Escalated-CRA');

  const Column: React.FC<{ title: string; icon: React.ReactNode; items: AgentTicket[]; accent: string }> = ({ title, icon, items, accent }) => (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex-1 min-w-[280px]">
      <div className={`flex items-center space-x-2 mb-4 ${accent}`}>
        {icon}
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="ml-auto text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {items.length === 0 && <p className="text-xs text-slate-500">Nothing here — the autonomous pipeline is handling everything.</p>}
        {items.map((t) => (
          <div
            key={t.ticket_id}
            onClick={() => { onSelectTicket(t.ticket_id); onGoToMonitor(); }}
            className="p-4 rounded-xl cursor-pointer border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-indigo-400">{t.ticket_id}</span>
              <span className="text-xs text-slate-400">{t.severity}</span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate">{t.subject}</h4>
            <p className="text-xs text-slate-400 mt-1">{t.category}</p>
            <div className="flex items-center text-xs text-indigo-300 mt-2 space-x-1">
              <span>View in Pipeline Monitor</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <p className="text-sm text-slate-300">
          Cases land here only when a customer rejects the autonomous resolution (or the case is flagged for
          direct regulatory escalation). Everything else is resolved end-to-end by the agent pipeline.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Column title="L2 Specialist Queue" icon={<Users className="w-4 h-4" />} items={l2} accent="text-amber-300" />
        <Column title="CRA Authority Queue" icon={<Building2 className="w-4 h-4" />} items={cra} accent="text-rose-300" />
      </div>
    </div>
  );
};
