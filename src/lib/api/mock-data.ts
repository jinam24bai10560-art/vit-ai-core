import type {
  AnalyticsSnapshot,
  Department,
  KnowledgeDocument,
  Thread,
  Ticket,
} from "./types";

export const departments: Department[] = [
  {
    id: "academics",
    name: "Academics",
    tagline: "Curriculum, credits & FFCS",
    description:
      "Course registration, credit transfers, attendance rules, CGPA policy and faculty advisory workflows.",
    accent: "195",
    stats: [
      { label: "Docs indexed", value: "412" },
      { label: "Queries / week", value: "3.1k" },
      { label: "Auto-resolved", value: "88%" },
    ],
    popularQueries: [
      "How do I add a course after FFCS closes?",
      "What is the minimum attendance for exam eligibility?",
      "How is CGPA calculated for honours?",
    ],
    responseTimeMins: 2,
    resolutionRate: 88,
  },
  {
    id: "examinations",
    name: "Examinations",
    tagline: "CAT, FAT, revaluation",
    description:
      "Exam schedules, hall tickets, malpractice policy, revaluation windows and grade correction requests.",
    accent: "300",
    stats: [
      { label: "Docs indexed", value: "268" },
      { label: "Queries / week", value: "2.4k" },
      { label: "Auto-resolved", value: "91%" },
    ],
    popularQueries: [
      "When does the revaluation window open?",
      "How do I download my FAT hall ticket?",
      "What happens if I miss a CAT due to medical leave?",
    ],
    responseTimeMins: 1,
    resolutionRate: 91,
  },
  {
    id: "hostels",
    name: "Hostels",
    tagline: "Rooms, mess & maintenance",
    description:
      "Room allotment, block transfers, mess plans, late-entry rules and maintenance escalation.",
    accent: "160",
    stats: [
      { label: "Docs indexed", value: "154" },
      { label: "Queries / week", value: "1.9k" },
      { label: "Auto-resolved", value: "79%" },
    ],
    popularQueries: [
      "How do I request a hostel block change?",
      "What is the mess refund policy for vacation?",
      "How do I raise an AC maintenance ticket?",
    ],
    responseTimeMins: 4,
    resolutionRate: 79,
  },
  {
    id: "library",
    name: "Library",
    tagline: "Access, journals & archives",
    description:
      "Borrowing limits, IEEE / Scopus access, plagiarism checks and digital archive retrieval.",
    accent: "85",
    stats: [
      { label: "Docs indexed", value: "96" },
      { label: "Queries / week", value: "740" },
      { label: "Auto-resolved", value: "94%" },
    ],
    popularQueries: [
      "How do I access IEEE Xplore off-campus?",
      "What is the fine for a late return?",
      "Can I reserve a group discussion room?",
    ],
    responseTimeMins: 1,
    resolutionRate: 94,
  },
  {
    id: "placements",
    name: "Placements",
    tagline: "Drives, eligibility & offers",
    description:
      "Eligibility criteria, drive calendars, resume verification, offer policy and internship conversions.",
    accent: "20",
    stats: [
      { label: "Docs indexed", value: "203" },
      { label: "Queries / week", value: "2.8k" },
      { label: "Auto-resolved", value: "83%" },
    ],
    popularQueries: [
      "Am I eligible for dream companies with one backlog?",
      "When is the next super-dream drive?",
      "How do I update my resume on the placement portal?",
    ],
    responseTimeMins: 3,
    resolutionRate: 83,
  },
  {
    id: "student-services",
    name: "Student Services",
    tagline: "ID, fees, scholarships",
    description:
      "Fee receipts, scholarship renewals, bonafide certificates, ID reissue and transport passes.",
    accent: "255",
    stats: [
      { label: "Docs indexed", value: "187" },
      { label: "Queries / week", value: "2.2k" },
      { label: "Auto-resolved", value: "86%" },
    ],
    popularQueries: [
      "How do I get a bonafide certificate?",
      "What documents renew my merit scholarship?",
      "How do I claim a transport pass refund?",
    ],
    responseTimeMins: 2,
    resolutionRate: 86,
  },
];

export const departmentMap = Object.fromEntries(
  departments.map((d) => [d.id, d]),
) as Record<Department["id"], Department>;

export const tickets: Ticket[] = [
  {
    id: "VIT-4821",
    subject: "Hostel block transfer request — B7 to D2",
    department: "hostels",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-07-28T09:12:00Z",
    assignee: "Warden Office",
    slaHours: 24,
  },
  {
    id: "VIT-4830",
    subject: "FAT hall ticket not generated for CSE3001",
    department: "examinations",
    status: "open",
    priority: "high",
    createdAt: "2026-07-29T14:41:00Z",
    assignee: "Exam Cell",
    slaHours: 8,
  },
  {
    id: "VIT-4796",
    subject: "Merit scholarship renewal document mismatch",
    department: "student-services",
    status: "open",
    priority: "medium",
    createdAt: "2026-07-27T11:05:00Z",
    assignee: "Finance Desk",
    slaHours: 48,
  },
  {
    id: "VIT-4712",
    subject: "IEEE Xplore off-campus access denied",
    department: "library",
    status: "resolved",
    priority: "low",
    createdAt: "2026-07-22T08:20:00Z",
    assignee: "Digital Library",
    slaHours: 12,
  },
  {
    id: "VIT-4744",
    subject: "Backlog clearance eligibility for super-dream drive",
    department: "placements",
    status: "resolved",
    priority: "high",
    createdAt: "2026-07-24T16:02:00Z",
    assignee: "CDC",
    slaHours: 24,
  },
];

export const threads: Thread[] = [
  {
    id: "t-placement-eligibility",
    title: "Super-dream eligibility with one backlog",
    department: "placements",
    updatedAt: "2026-07-30T08:14:00Z",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Am I eligible for super-dream companies if I have one active backlog?",
        createdAt: "2026-07-30T08:12:00Z",
      },
      {
        id: "m2",
        role: "assistant",
        department: "placements",
        content:
          "Under the 2026 placement policy, super-dream drives (CTC ≥ ₹20 LPA) require **zero active backlogs** at the time of registration and a minimum CGPA of 8.0.\n\nIf your backlog is cleared in the upcoming supplementary FAT, eligibility is restored automatically once the Exam Cell publishes the revised grade sheet — usually within 5 working days. You can continue applying to dream and regular drives in the meantime.",
        citations: [
          {
            id: "c1",
            title: "Placement Policy 2026 — Eligibility Matrix",
            source: "CDC Handbook v4.2",
            section: "§3.2 Super-dream criteria",
            updatedAt: "2026-06-11",
            confidence: 0.96,
          },
          {
            id: "c2",
            title: "Backlog Clearance & Grade Revision SOP",
            source: "Examination Cell Circular",
            section: "§2 Revised grade publication",
            updatedAt: "2026-05-02",
            confidence: 0.89,
          },
        ],
        createdAt: "2026-07-30T08:14:00Z",
      },
    ],
  },
  {
    id: "t-hostel-transfer",
    title: "Hostel block transfer process",
    department: "hostels",
    updatedAt: "2026-07-29T19:40:00Z",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "My AC has been down for 4 days and no one is responding. What do I do?",
        createdAt: "2026-07-29T19:38:00Z",
      },
      {
        id: "m2",
        role: "assistant",
        department: "hostels",
        content:
          "Maintenance requests unresolved beyond 72 hours qualify for **Tier-2 escalation** to the Chief Warden. I've prepared an escalation ticket with your block and room reference.",
        citations: [
          {
            id: "c1",
            title: "Hostel Maintenance SLA",
            source: "Residence Manual 2026",
            section: "§5.4 Escalation tiers",
            updatedAt: "2026-04-18",
            confidence: 0.93,
          },
        ],
        ticket: {
          id: "VIT-4838",
          subject: "AC non-functional > 72h — Block B7 / Room 412",
          department: "hostels",
          status: "open",
          priority: "high",
          createdAt: "2026-07-29T19:40:00Z",
          assignee: "Chief Warden Office",
          slaHours: 12,
        },
        createdAt: "2026-07-29T19:40:00Z",
      },
    ],
  },
  {
    id: "t-revaluation",
    title: "Revaluation window & fees",
    department: "examinations",
    updatedAt: "2026-07-28T10:22:00Z",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "When does revaluation open and how much does it cost per subject?",
        createdAt: "2026-07-28T10:20:00Z",
      },
      {
        id: "m2",
        role: "assistant",
        department: "examinations",
        content:
          "The revaluation window opens **5 working days after results publication** and stays open for 7 days. The fee is ₹750 per subject, payable through the VTOP fee module. Revised results are published within 21 days.",
        citations: [
          {
            id: "c1",
            title: "Examination Regulations — Revaluation",
            source: "Academic Regulations 2026",
            section: "§9.1",
            updatedAt: "2026-03-30",
            confidence: 0.97,
          },
        ],
        createdAt: "2026-07-28T10:22:00Z",
      },
    ],
  },
];

export const documents: KnowledgeDocument[] = [
  {
    id: "doc-1",
    name: "Academic-Regulations-2026.pdf",
    department: "academics",
    sizeKb: 4820,
    chunks: 1284,
    status: "indexed",
    uploadedAt: "2026-06-02T10:00:00Z",
    version: "v4.1",
  },
  {
    id: "doc-2",
    name: "CDC-Placement-Handbook.pdf",
    department: "placements",
    sizeKb: 2310,
    chunks: 642,
    status: "indexed",
    uploadedAt: "2026-06-11T10:00:00Z",
    version: "v4.2",
  },
  {
    id: "doc-3",
    name: "Residence-Manual-2026.docx",
    department: "hostels",
    sizeKb: 1180,
    chunks: 318,
    status: "indexing",
    uploadedAt: "2026-07-29T10:00:00Z",
    version: "v2.0",
  },
  {
    id: "doc-4",
    name: "Library-Digital-Access-Guide.pdf",
    department: "library",
    sizeKb: 640,
    chunks: 121,
    status: "indexed",
    uploadedAt: "2026-05-19T10:00:00Z",
    version: "v1.7",
  },
  {
    id: "doc-5",
    name: "Exam-Cell-Circulars-Q3.zip",
    department: "examinations",
    sizeKb: 8930,
    chunks: 0,
    status: "queued",
    uploadedAt: "2026-07-30T06:30:00Z",
    version: "v1.0",
  },
  {
    id: "doc-6",
    name: "Scholarship-Renewal-Matrix.xlsx",
    department: "student-services",
    sizeKb: 210,
    chunks: 64,
    status: "failed",
    uploadedAt: "2026-07-21T10:00:00Z",
    version: "v3.3",
  },
];

export const analytics: AnalyticsSnapshot = {
  activeTickets: 47,
  resolvedTickets: 1284,
  conversations: 18420,
  avgResponseSeconds: 1.8,
  deflectionRate: 86,
  activity: [
    { day: "Mon", conversations: 2140, tickets: 62 },
    { day: "Tue", conversations: 2480, tickets: 71 },
    { day: "Wed", conversations: 2910, tickets: 58 },
    { day: "Thu", conversations: 3320, tickets: 84 },
    { day: "Fri", conversations: 3010, tickets: 66 },
    { day: "Sat", conversations: 1620, tickets: 31 },
    { day: "Sun", conversations: 940, tickets: 18 },
  ],
  departmentLoad: [
    { department: "academics", volume: 3120, resolution: 88 },
    { department: "examinations", volume: 2440, resolution: 91 },
    { department: "placements", volume: 2810, resolution: 83 },
    { department: "hostels", volume: 1900, resolution: 79 },
    { department: "student-services", volume: 2210, resolution: 86 },
    { department: "library", volume: 740, resolution: 94 },
  ],
  topQuestions: [
    { question: "How do I download my FAT hall ticket?", count: 812, department: "examinations" },
    { question: "Super-dream eligibility with a backlog", count: 664, department: "placements" },
    { question: "Minimum attendance for exam eligibility", count: 590, department: "academics" },
    { question: "Hostel block transfer procedure", count: 448, department: "hostels" },
    { question: "Bonafide certificate request", count: 402, department: "student-services" },
    { question: "Off-campus IEEE Xplore access", count: 287, department: "library" },
  ],
};

export const suggestedPrompts = [
  { label: "Check my exam eligibility", department: "examinations" as const },
  { label: "Hostel maintenance escalation", department: "hostels" as const },
  { label: "Placement drive calendar", department: "placements" as const },
  { label: "Request a bonafide certificate", department: "student-services" as const },
  { label: "Off-campus journal access", department: "library" as const },
  { label: "Credit transfer rules", department: "academics" as const },
];