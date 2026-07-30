import { analytics, departments, documents, threads, tickets } from "./mock-data";
import type {
  AnalyticsSnapshot,
  Citation,
  Department,
  DepartmentId,
  KnowledgeDocument,
  Message,
  Thread,
  Ticket,
  WorkflowStep,
} from "./types";

/**
 * Mock backend layer. Every function mirrors the shape of the eventual REST /
 * server-function API so a real backend can be dropped in without touching UI.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

export const departmentApi = {
  async list(): Promise<Department[]> {
    await delay(120);
    return departments;
  },
  async get(id: DepartmentId): Promise<Department | undefined> {
    await delay(80);
    return departments.find((d) => d.id === id);
  },
};

export const ticketApi = {
  async list(): Promise<Ticket[]> {
    await delay(140);
    return tickets;
  },
  async create(input: Pick<Ticket, "subject" | "department" | "priority">): Promise<Ticket> {
    await delay(200);
    return {
      id: `VIT-${Math.floor(4800 + Math.random() * 199)}`,
      status: "open",
      createdAt: new Date().toISOString(),
      assignee: "Auto-routed",
      slaHours: input.priority === "high" ? 8 : 24,
      ...input,
    };
  },
};

export const documentApi = {
  async list(): Promise<KnowledgeDocument[]> {
    await delay(120);
    return documents;
  },
  async upload(file: { name: string; sizeKb: number; department: DepartmentId }) {
    await delay(400);
    return {
      id: `doc-${uid()}`,
      chunks: 0,
      status: "queued" as const,
      uploadedAt: new Date().toISOString(),
      version: "v1.0",
      ...file,
    } satisfies KnowledgeDocument;
  },
  async remove(id: string) {
    await delay(180);
    return { id, deleted: true };
  },
  async reindex() {
    await delay(900);
    return { queued: documents.length, startedAt: new Date().toISOString() };
  },
};

export const analyticsApi = {
  async snapshot(): Promise<AnalyticsSnapshot> {
    await delay(150);
    return analytics;
  },
};

export const conversationApi = {
  async listThreads(): Promise<Thread[]> {
    await delay(120);
    return threads;
  },

  /** Simulated retrieval + generation stream. */
  async *stream(question: string, department: DepartmentId) {
    const workflow: WorkflowStep[] = [
      { id: "w1", label: "Understanding question", state: "active", detail: "Intent + department routing" },
      { id: "w2", label: "Retrieving sources", state: "pending", detail: "Vector search across 1.3k chunks" },
      { id: "w3", label: "Verifying policy", state: "pending", detail: "Cross-checking latest circulars" },
      { id: "w4", label: "Composing answer", state: "pending", detail: "Grounded generation with citations" },
    ];

    for (let i = 0; i < workflow.length; i++) {
      await delay(420);
      const snapshot = workflow.map((s, idx) => ({
        ...s,
        state: idx < i ? ("done" as const) : idx === i ? ("active" as const) : ("pending" as const),
      }));
      yield { type: "workflow" as const, workflow: snapshot };
    }

    const answer = buildAnswer(question, department);
    let acc = "";
    for (const token of answer.split(/(\s+)/)) {
      acc += token;
      await delay(18);
      yield { type: "token" as const, text: acc };
    }

    await delay(250);
    yield {
      type: "done" as const,
      citations: buildCitations(department),
      workflow: workflow.map((s) => ({ ...s, state: "done" as const })),
      ticket: shouldEscalate(question)
        ? ({
            id: `VIT-${Math.floor(4800 + Math.random() * 199)}`,
            subject: question.slice(0, 72),
            department,
            status: "open",
            priority: "high",
            createdAt: new Date().toISOString(),
            assignee: "Department Desk",
            slaHours: 12,
          } satisfies Ticket)
        : undefined,
    };
  },
};

function shouldEscalate(q: string) {
  return /escalat|complain|not working|no response|urgent|broken|refund/i.test(q);
}

function buildCitations(department: DepartmentId): Citation[] {
  const dept = departments.find((d) => d.id === department)!;
  return [
    {
      id: uid(),
      title: `${dept.name} Policy Handbook 2026`,
      source: "VIT Bhopal Knowledge Base",
      section: "§ Verified policy clause",
      updatedAt: "2026-06-11",
      confidence: 0.94,
    },
    {
      id: uid(),
      title: `${dept.name} Office Circular — Q3`,
      source: "Official Circulars Archive",
      section: "§ Current academic year",
      updatedAt: "2026-07-04",
      confidence: 0.87,
    },
  ];
}

function buildAnswer(question: string, department: DepartmentId) {
  const dept = departments.find((d) => d.id === department)!;
  return `Based on the verified ${dept.name} knowledge base, here's what applies to you.\n\nThe current policy is published in the ${dept.name} handbook and the latest office circular, both re-indexed this term. Your request — "${question.trim()}" — is handled by the ${dept.name} desk with an average turnaround of ${dept.responseTimeMins} minutes for informational queries.\n\nEvery statement above is grounded in the cited sources below. If the answer requires an officer decision, I can escalate it into a tracked ticket with an SLA timer.`;
}

export function newMessage(partial: Partial<Message> & Pick<Message, "role" | "content">): Message {
  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
}