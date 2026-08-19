import React, { useState, useEffect } from 'react';
import { User, ClipboardCheck, Wand2, ShieldCheck, BellRing, CheckCircle2, Users, Building2, PlayCircle, MessageSquare, Bot, History } from 'lucide-react';
import { AgentTicket, AgentStepLog, PipelineStage } from '../types';

interface Props {
  tickets: AgentTicket[];
  selectedTicket: AgentTicket | null;
  steps: AgentStepLog[];
  onSelectTicket: (ticketId: string) => void;
  onRunPipeline: (ticketId: string) => void;
  onCustomerResponse: (ticketId: string, satisfied: boolean, feedback?: string) => void;
  running: boolean;
}

const NODE_ORDER: PipelineStage[] = ['Intake', 'Resolution', 'QA', 'Notification'];

const nodeStatus = (stage: PipelineStage, node: PipelineStage): 'pending' | 'active' | 'done' => {
  const terminal: PipelineStage[] = ['Awaiting-Customer', 'Auto-Closed', 'Escalated-L2', 'Escalated-CRA'];
  const idx = NODE_ORDER.indexOf(node);
  const currentIdx = terminal.includes(stage) ? NODE_ORDER.length : NODE_ORDER.indexOf(stage);
  if (currentIdx > idx) return 'done';
  if (currentIdx === idx) return 'active';
  return 'pending';
};

type NodeColor = 'emerald' | 'sky' | 'purple';

// Tailwind's JIT scanner only picks up class names it can find as literal
// strings in source, so colors are mapped statically rather than built via
// template-literal interpolation (which would be silently purged).
const ICON_WRAP_CLASSES: Record<NodeColor, string> = {
  emerald: 'p-2 rounded-lg bg-emerald-500/20 text-emerald-300',
  sky: 'p-2 rounded-lg bg-sky-500/20 text-sky-300',
  purple: 'p-2 rounded-lg bg-purple-500/20 text-purple-300',
};

const ACTIVE_BORDER_CLASSES: Record<NodeColor, string> = {
  emerald: 'node-active border-emerald-400/60',
  sky: 'node-active border-sky-400/60',
  purple: 'node-active border-purple-400/60',
};

const NodeCard: React.FC<{ icon: React.ReactNode; title: string; bullets: string[]; status: 'pending' | 'active' | 'done'; color: NodeColor }> = ({ icon, title, bullets, status, color }) => (
  <div
    className={`rounded-2xl p-4 border w-56 shrink-0 bg-slate-900/70 transition-all ${
      status === 'active' ? ACTIVE_BORDER_CLASSES[color] : status === 'done' ? 'node-done border-emerald-500/40' : 'border-slate-800'
    }`}
  >
    <div className="flex items-center space-x-2 mb-2">
      <div className={ICON_WRAP_CLASSES[color]}>{icon}</div>
      <h4 className="text-sm font-bold text-white">{title}</h4>
      {status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
    </div>
    <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
      {bullets.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  </div>
);

export const PipelineView: React.FC<Props> = ({ tickets, selectedTicket, steps, onSelectTicket, onRunPipeline, onCustomerResponse, running }) => {
  const stage = selectedTicket?.pipeline_stage;
  const isAwaiting = stage === 'Awaiting-Customer';
  const isTerminal = stage === 'Auto-Closed' || stage === 'Escalated-L2' || stage === 'Escalated-CRA';
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setReplyText('');
  }, [selectedTicket?.ticket_id]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-400">Select ticket:</span>
        <select
          value={selectedTicket?.ticket_id || ''}
          onChange={(e) => onSelectTicket(e.target.value)}
          className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="" disabled>Choose a ticket...</option>
          {tickets.map((t) => (
            <option key={t.ticket_id} value={t.ticket_id}>{t.ticket_id} — {t.subject}</option>
          ))}
        </select>

        {selectedTicket && stage === 'Intake' && (
          <button
            onClick={() => onRunPipeline(selectedTicket.ticket_id)}
            disabled={running}
            className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-indigo-900/30"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{running ? 'Running Pipeline...' : 'Run Autonomous Pipeline'}</span>
          </button>
        )}
      </div>

      {!selectedTicket && (
        <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center text-slate-500 text-sm">
          Submit or select a ticket to watch the Intake → Resolution → QA → Notification pipeline run live.
        </div>
      )}

      {selectedTicket && (
        <>
          <div className="glass-panel p-6 rounded-2xl border border-white/10 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-4">
              {selectedTicket.ticket_id} — <span className="text-slate-400 font-normal">{selectedTicket.subject}</span>
            </h3>
            <div className="flex items-center space-x-4 min-w-max pb-2">
              <div className="flex flex-col items-center space-y-1 shrink-0">
                <div className="p-3 rounded-full bg-slate-800 text-slate-300"><User className="w-5 h-5" /></div>
                <span className="text-xs text-slate-400">Customer</span>
              </div>
              <div className="text-slate-600">→</div>
              <NodeCard icon={<ClipboardCheck className="w-4 h-4" />} title="Intake Agent" color="emerald"
                bullets={['Auto-classifies', 'Validates', 'Creates a ticket']}
                status={nodeStatus(stage!, 'Intake')} />
              <div className="text-slate-600">→</div>
              <NodeCard icon={<Wand2 className="w-4 h-4" />} title="Resolution Agent" color="sky"
                bullets={['Drafts response', 'Applies policy rules', 'Resolves simple cases']}
                status={nodeStatus(stage!, 'Resolution')} />
              <div className="text-slate-600">→</div>
              <NodeCard icon={<ShieldCheck className="w-4 h-4" />} title="QA Agent" color="purple"
                bullets={['Validates quality', 'Checks compliance']}
                status={nodeStatus(stage!, 'QA')} />
              <div className="text-slate-600">→</div>
              <NodeCard icon={<BellRing className="w-4 h-4" />} title="Notification Agent" color="emerald"
                bullets={['Sends response', 'Monitors satisfaction']}
                status={nodeStatus(stage!, 'Notification')} />
            </div>

            {/* Decision outcome badge */}
            {isTerminal && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className={`inline-flex px-4 py-3 rounded-xl border text-xs font-bold items-center space-x-2 ${
                  stage === 'Auto-Closed'
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                }`}>
                  {stage === 'Auto-Closed' ? (
                    <><CheckCircle2 className="w-4 h-4" /><span>Auto-Closed — resolved without human intervention</span></>
                  ) : stage === 'Escalated-L2' ? (
                    <><Users className="w-4 h-4" /><span>Escalated to L2 Specialist (Human Review)</span></>
                  ) : (
                    <><Building2 className="w-4 h-4" /><span>Escalated directly to CRA Authority (Regulatory)</span></>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Case-based grounding: what past resolved tickets informed this ticket's
              classification/response, instead of relying on keywords alone. */}
          {selectedTicket.similar_case_ids && selectedTicket.similar_case_ids.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Grounded in Past Resolved Cases</span>
                </h3>
                {selectedTicket.resolution_source && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    selectedTicket.resolution_source === 'case_reuse'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {selectedTicket.resolution_source === 'case_reuse' ? 'Response reused from precedent' : 'Freshly generated'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Classification and the drafted response were checked against these previously Auto-Closed tickets, not just keyword matching.
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTicket.similar_case_ids.map((id) => (
                  <button
                    key={id}
                    onClick={() => onSelectTicket(id)}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400/60 transition-all"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Thread: customer complaint -> agent response -> customer reply */}
          {(selectedTicket.final_response || selectedTicket.resolution_draft) && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Conversation Thread</h3>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 ml-0 mr-10">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{selectedTicket.customer_name} (CUSTOMER)</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedTicket.subject}{"\n"}{selectedTicket.description}</p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-800/50 bg-indigo-950/20 ml-10 mr-0">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 mb-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Notification Agent (AI RESPONSE)</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedTicket.final_response || selectedTicket.resolution_draft}</p>
              </div>

              {selectedTicket.customer_satisfied !== undefined && selectedTicket.customer_satisfied !== null && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 ml-0 mr-10">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{selectedTicket.customer_name} (CUSTOMER REPLY)</span>
                    </span>
                    <span className={selectedTicket.customer_satisfied ? 'text-emerald-400' : 'text-rose-400'}>
                      {selectedTicket.customer_satisfied ? 'Satisfied' : 'Not Satisfied'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {selectedTicket.customer_feedback || (selectedTicket.customer_satisfied ? 'Yes, this resolves my issue.' : 'No, this does not resolve my issue.')}
                  </p>
                </div>
              )}

              {isAwaiting && (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-3 pt-2 border-t border-slate-800"
                >
                  <label className="block text-xs font-semibold text-slate-300">
                    Reply as the customer (optional — explain why you are or aren't satisfied)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Thanks, that resolves it! / This still doesn't fix my issue..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onCustomerResponse(selectedTicket.ticket_id, true, replyText || undefined)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Yes, Satisfied — Auto-Close</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCustomerResponse(selectedTicket.ticket_id, false, replyText || undefined)}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>No, Not Satisfied — Escalate</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Agent execution trace */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Agent Execution Trace</h3>
            {steps.length === 0 ? (
              <p className="text-xs text-slate-500">No steps logged yet — run the pipeline to see each agent's actions here.</p>
            ) : (
              <div className="space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-300">{s.agent_name}</span>
                      <span className="text-slate-500">{new Date(s.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-400">{s.action}{s.confidence != null ? ` · confidence ${(s.confidence * 100).toFixed(0)}%` : ''}</p>
                    {s.reasoning && <p className="text-xs text-slate-300 mt-1 italic">"{s.reasoning}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
