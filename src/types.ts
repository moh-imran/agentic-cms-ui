export type PipelineStage =
  | 'Intake'
  | 'Resolution'
  | 'QA'
  | 'Notification'
  | 'Awaiting-Customer'
  | 'Auto-Closed'
  | 'Escalated-L2'
  | 'Escalated-CRA';

export interface AgentTicket {
  ticket_id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  channel: string;
  subject: string;
  description: string;

  case_type: 'Complaint' | 'Inquiry' | 'Suggestion';
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  ai_confidence: number;
  ai_rationale?: string;

  resolution_draft?: string;
  is_auto_resolvable: boolean;
  policy_notes?: string;

  similar_case_ids: string[];
  resolution_source?: 'case_reuse' | 'generated';

  qa_passed?: boolean;
  qa_notes?: string;
  qa_confidence?: number;

  final_response?: string;
  notified_at?: string;

  pipeline_stage: PipelineStage;
  is_direct_escalation_eligible: boolean;
  escalation_target?: 'L2 Specialist' | 'CRA Authority';

  customer_satisfied?: boolean;
  customer_feedback?: string;
  customer_responded_at?: string;

  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface AgentStepLog {
  ticket_id: string;
  agent_name: string;
  action: string;
  input_snapshot: Record<string, any>;
  output_snapshot: Record<string, any>;
  confidence?: number;
  reasoning?: string;
  timestamp: string;
}
