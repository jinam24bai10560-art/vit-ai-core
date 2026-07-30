export type DepartmentId =
  | "academics"
  | "examinations"
  | "hostels"
  | "library"
  | "placements"
  | "student-services";

export interface Department {
  id: DepartmentId;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  stats: { label: string; value: string }[];
  popularQueries: string[];
  responseTimeMins: number;
  resolutionRate: number;
}

export interface Citation {
  id: string;
  title: string;
  source: string;
  section: string;
  updatedAt: string;
  confidence: number;
}

export interface Ticket {
  id: string;
  subject: string;
  department: DepartmentId;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  assignee: string;
  slaHours: number;
}

export interface WorkflowStep {
  id: string;
  label: string;
  state: "done" | "active" | "pending";
  detail: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  department?: DepartmentId;
  citations?: Citation[];
  ticket?: Ticket;
  workflow?: WorkflowStep[];
  createdAt: string;
}

export interface Thread {
  id: string;
  title: string;
  department: DepartmentId;
  updatedAt: string;
  messages: Message[];
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  department: DepartmentId;
  sizeKb: number;
  chunks: number;
  status: "indexed" | "indexing" | "queued" | "failed";
  uploadedAt: string;
  version: string;
}

export interface AnalyticsSnapshot {
  activeTickets: number;
  resolvedTickets: number;
  conversations: number;
  avgResponseSeconds: number;
  deflectionRate: number;
  activity: { day: string; conversations: number; tickets: number }[];
  departmentLoad: { department: DepartmentId; volume: number; resolution: number }[];
  topQuestions: { question: string; count: number; department: DepartmentId }[];
}