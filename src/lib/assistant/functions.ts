import { createServerFn } from "@tanstack/react-start";
import {
  addDocument,
  listDocuments,
  removeDocument,
  reindexAll,
  retrieve,
} from "@/lib/assistant/knowledge";
import { departments } from "@/lib/api/mock-data";
import type { Citation, DepartmentId } from "@/lib/api/types";

export const listDocumentsFn = createServerFn({ method: "GET" }).handler(async () => {
  return listDocuments();
});

export const uploadDocumentFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file") as File | null;
    const department = (data.get("department") as DepartmentId) ?? "academics";
    if (!file) throw new Error("No file provided");
    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    return addDocument({ name: file.name, department, buffer, isPdf });
  });

export const removeDocumentFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await removeDocument(data.id);
    return { id: data.id, deleted: true };
  });

export const reindexFn = createServerFn({ method: "POST" }).handler(async () => {
  return reindexAll();
});

const GREETING_RE =
  /^(hi|hii+|hello|hey|yo|hola|good\s?(morning|afternoon|evening)|sup|thanks|thank you|thankyou|bye|goodbye|ok|okay|cool)[\s!.,]*$/i;

function isGreeting(q: string) {
  return GREETING_RE.test(q.trim());
}

function greetingReply(q: string) {
  const t = q.trim().toLowerCase();
  if (/thank/.test(t)) return "You're welcome! Let me know if there's anything else about campus you'd like to check.";
  if (/bye/.test(t)) return "Take care! Come back anytime you have a campus question.";
  return "Hey! I'm the VIT Bhopal AI Student Assistant. Ask me anything about academics, exams, hostels, library, placements, or student services.";
}

async function composeWithGroq(question: string, context: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are the VIT Bhopal AI Student Assistant. Answer ONLY using the provided context from official documents. If the context doesn't contain the answer, say you couldn't find it in the indexed documents. Be concise and cite specifics from the context.",
          },
          { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("Groq call failed", err);
    return null;
  }
}

function detectDepartment(q: string): DepartmentId {
  const t = q.toLowerCase();
  if (/hostel|mess|room|warden|ac /.test(t)) return "hostels";
  if (/exam|revaluation|hall ticket|cat|fat|grade/.test(t)) return "examinations";
  if (/placement|drive|intern|offer|resume|cdc/.test(t)) return "placements";
  if (/library|journal|ieee|book|scopus/.test(t)) return "library";
  if (/fee|scholarship|bonafide|id card|transport/.test(t)) return "student-services";
  return "academics";
}

export const askAssistantFn = createServerFn({ method: "POST" })
  .validator((data: { question: string }) => data)
  .handler(async ({ data }) => {
    const question = data.question.trim();

    if (isGreeting(question)) {
      return {
        answer: greetingReply(question),
        department: undefined as DepartmentId | undefined,
        citations: [] as Citation[],
        grounded: false,
      };
    }

    const department = detectDepartment(question);
    const hits = await retrieve(question, department, 3);
    const fallbackHits = hits.length ? hits : await retrieve(question, undefined, 3);

    if (!fallbackHits.length) {
      return {
        answer:
          "I couldn't find anything about that in the indexed documents yet. Try rephrasing, or ask an admin to upload the relevant PDF in the Knowledge Console.",
        department,
        citations: [] as Citation[],
        grounded: false,
      };
    }

    const context = fallbackHits.map((h, i) => `[${i + 1}] (${h.docName}) ${h.text}`).join("\n\n");
    const llmAnswer = await composeWithGroq(question, context);

    const answer =
      llmAnswer ??
      `Here's the most relevant passage I found in the indexed documents:\n\n"${fallbackHits[0].text.trim()}"`;

    const dept = departments.find((d) => d.id === department);
    const citations: Citation[] = fallbackHits.map((h) => ({
      id: h.id,
      title: h.docName,
      source: dept ? `${dept.name} Knowledge Base` : "Knowledge Base",
      section: `Chunk ${h.index + 1}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      confidence: Math.min(0.98, Math.max(0.4, h.score / 5)),
    }));

    return { answer, department, citations, grounded: true };
  });
