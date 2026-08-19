import React, { useState, useEffect } from 'react';
import { CustomerIntake } from './components/CustomerIntake';
import { PipelineView } from './components/PipelineView';
import { EscalationQueue } from './components/EscalationQueue';
import { AgentTicket, AgentStepLog } from './types';
import { Bot, Send, Activity, Users, Sparkles } from 'lucide-react';

type Tab = 'submit' | 'monitor' | 'escalations';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('submit');
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AgentTicket | null>(null);
  const [steps, setSteps] = useState<AgentStepLog[]>([]);
  const [running, setRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/agentic/tickets');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (err) {
      console.error('Error fetching agent tickets', err);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/agentic/tickets/${ticketId}`);
      const data = await res.json();
      if (data.ticket) {
        setSelectedTicket(data.ticket);
        setSteps(data.steps || []);
      }
    } catch (err) {
      console.error('Error fetching ticket details', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicketId) fetchTicketDetails(selectedTicketId);
  }, [selectedTicketId]);

  const handleTicketCreated = async (ticketId: string) => {
    await fetchTickets();
    setSelectedTicketId(ticketId);
    showToast(`Ticket ${ticketId} created — Intake Agent classified it.`);
  };

  const handleRunPipeline = async (ticketId: string) => {
    setRunning(true);
    try {
      const res = await fetch(`/api/agentic/tickets/${ticketId}/run-pipeline`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setSelectedTicket(data.ticket);
        setSteps(data.steps || []);
        await fetchTickets();
        showToast('Resolution → QA → Notification agents completed. Awaiting customer confirmation.');
      }
    } catch (err) {
      console.error('Error running pipeline', err);
    } finally {
      setRunning(false);
    }
  };

  const handleCustomerResponse = async (ticketId: string, satisfied: boolean, feedback?: string) => {
    try {
      const res = await fetch(`/api/agentic/tickets/${ticketId}/customer-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfied, feedback }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setSelectedTicket(data.ticket);
        await fetchTickets();
        showToast(
          data.ticket.pipeline_stage === 'Auto-Closed'
            ? `Ticket ${ticketId} auto-closed — resolved without human intervention.`
            : `Ticket ${ticketId} escalated to ${data.ticket.escalation_target}.`
        );
      }
    } catch (err) {
      console.error('Error posting customer response', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 glass-panel border border-indigo-500/40 bg-indigo-950/90 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <header className="border-b border-white/10 glass-panel sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-lg shadow-indigo-900/40">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-wide">
                Agentic Complaint Resolution Platform
              </h1>
              <p className="text-xs text-slate-400">Next-Gen Agentic Complaint Management System — autonomous end-to-end processing</p>
            </div>
          </div>

          <nav className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'submit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Submit Complaint</span>
            </button>

            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Pipeline Monitor</span>
            </button>

            <button
              onClick={() => setActiveTab('escalations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'escalations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Escalations</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'submit' && (
          <CustomerIntake
            tickets={tickets}
            onTicketCreated={handleTicketCreated}
            onSelectTicket={setSelectedTicketId}
            selectedTicket={selectedTicket}
          />
        )}

        {activeTab === 'monitor' && (
          <PipelineView
            tickets={tickets}
            selectedTicket={selectedTicket}
            steps={steps}
            onSelectTicket={setSelectedTicketId}
            onRunPipeline={handleRunPipeline}
            onCustomerResponse={handleCustomerResponse}
            running={running}
          />
        )}

        {activeTab === 'escalations' && (
          <EscalationQueue
            tickets={tickets}
            onSelectTicket={setSelectedTicketId}
            onGoToMonitor={() => setActiveTab('monitor')}
          />
        )}
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        Agentic Architecture • Autonomous Agent Pipeline • ~80% of tickets resolved without human intervention
      </footer>
    </div>
  );
};
