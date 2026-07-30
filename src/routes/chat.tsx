import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  CheckCircle2,
  CircleDot,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkle,
  TicketCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AmbientBackground } from "@/components/fx/AmbientBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { askAssistantFn } from "@/lib/assistant/functions";
import { departmentMap, suggestedPrompts, threads as seedThreads } from "@/lib/api/mock-data";
import { newMessage } from "@/lib/api/client";
import type { DepartmentId, Message, Thread } from "@/lib/api/types";

const title = "Assistant — VIT Bhopal AI Student Assistant";
const description =
  "Ask any campus question and get a verified, cited answer routed to the right VIT Bhopal department.";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ChatPage,
});

function fakeWorkflowSteps() {
  return [
    { id: "w1", label: "Understanding question", state: "pending" as const, detail: "Intent + department routing" },
    { id: "w2", label: "Retrieving sources", state: "pending" as const, detail: "Keyword search over indexed chunks" },
    { id: "w3", label: "Composing answer", state: "pending" as const, detail: "Grounded in retrieved passages" },
  ];
}

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>(seedThreads);
  const [activeId, setActiveId] = useState<string>(seedThreads[0].id);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId, streaming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages, streaming]);

  function patchThread(id: string, fn: (t: Thread) => Thread) {
    setThreads((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  }

  function newThread() {
    const t: Thread = {
      id: `t-${Math.random().toString(36).slice(2, 8)}`,
      title: "New conversation",
      department: "academics",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;
    const threadId = active.id;
    setInput("");
    setStreaming(true);

    const assistantId = `a-${Math.random().toString(36).slice(2, 8)}`;
    const steps = fakeWorkflowSteps();
    patchThread(threadId, (t) => ({
      ...t,
      title: t.messages.length === 0 ? question.slice(0, 46) : t.title,
      updatedAt: new Date().toISOString(),
      messages: [
        ...t.messages,
        newMessage({ role: "user", content: question }),
        { ...newMessage({ role: "assistant", content: "" }), id: assistantId, workflow: steps },
      ],
    }));

    const update = (patch: Partial<Message>) =>
      patchThread(threadId, (t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      }));

    // Animate the workflow steps while the real request is in flight.
    for (let i = 0; i < steps.length; i++) {
      update({
        workflow: steps.map((s, idx) => ({
          ...s,
          state: (idx < i ? "done" : idx === i ? "active" : "pending") as "done" | "active" | "pending",
        })),
      });
      await new Promise((r) => setTimeout(r, 260));
    }

    try {
      const result = await askAssistantFn({ data: { question } });
      update({
        workflow: steps.map((s) => ({ ...s, state: "done" as const })),
        department: result.department,
      });

      let acc = "";
      const words = result.answer.split(/(\s+)/);
      for (const w of words) {
        acc += w;
        update({ content: acc });
        await new Promise((r) => setTimeout(r, 12));
      }

      const ticket = shouldEscalate(question)
        ? {
            id: `VIT-${Math.floor(4800 + Math.random() * 199)}`,
            subject: question.slice(0, 72),
            department: result.department ?? "student-services",
            status: "open" as const,
            priority: "high" as const,
            createdAt: new Date().toISOString(),
            assignee: "Department Desk",
            slaHours: 12,
          }
        : undefined;

      update({ citations: result.citations, ticket });

      if (result.department) {
        patchThread(threadId, (t) => ({ ...t, department: result.department as DepartmentId }));
      }
    } catch (err) {
      console.error(err);
      update({
        workflow: steps.map((s) => ({ ...s, state: "done" as const })),
        content: "Something went wrong reaching the assistant backend. Please try again.",
      });
    }

    setStreaming(false);
  }

  function shouldEscalate(q: string) {
    return /escalat|complain|not working|no response|urgent|broken|refund/i.test(q);
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl gap-4 px-4 pb-6 pt-24">
        {/* Sidebar */}
        <aside className="glass hidden w-72 shrink-0 flex-col rounded-3xl p-3 lg:flex">
          <button
            onClick={newThread}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary/15 px-4 py-3 text-xs font-semibold text-primary ring-1 ring-primary/25 transition-colors hover:bg-primary/25"
          >
            <Plus className="size-4" /> New conversation
          </button>

          <p className="px-2 pb-2 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Threads
          </p>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  t.id === active.id ? "bg-white/10" : "hover:bg-white/[0.05]"
                }`}
              >
                <p className="truncate text-xs font-medium">{t.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: `oklch(0.75 0.17 ${departmentMap[t.department].accent})` }}
                  />
                  {departmentMap[t.department].name}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-2xl bg-white/[0.04] p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium">
              <ShieldCheck className="size-3.5 text-primary" /> Verified mode
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Answers restricted to indexed university sources.
            </p>
          </div>
        </aside>

        {/* Conversation */}
        <section className="glass flex min-h-[calc(100vh-7.5rem)] flex-1 flex-col rounded-3xl">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h1 className="text-sm font-semibold">{active.title}</h1>
              <p className="text-[11px] text-muted-foreground">
                Routed to {departmentMap[active.department].name} · {departmentMap[active.department].tagline}
              </p>
            </div>
            <span className="glass hidden rounded-full px-3 py-1.5 font-mono text-[10px] text-muted-foreground sm:block">
              {active.messages.length} messages
            </span>
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
            {active.messages.length === 0 && <EmptyState onPick={send} />}
            {active.messages.map((m) => (
              <MessageBlock key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-4">
            <div className="glass-strong animated-border relative rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={2}
                placeholder="Ask about attendance, revaluation, hostel transfers, placements…"
                className="w-full resize-none bg-transparent px-3 py-2 pr-14 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => void send(input)}
                disabled={streaming || !input.trim()}
                className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                {streaming ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Grounded in official VIT Bhopal circulars. Escalations create tracked tickets.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
        <Sparkle className="size-7 text-primary" strokeWidth={1.4} />
        <span className="absolute inset-0 rounded-2xl border border-primary/30 [animation:pulse-ring_2s_ease-out_infinite]" />
      </div>
      <h2 className="text-xl font-semibold">What do you need from campus today?</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Ask in your own words. The assistant routes to the right desk and cites the exact policy clause.
      </p>
      <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {suggestedPrompts.map((p, i) => (
          <motion.button
            key={p.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onPick(p.label)}
            className="group glass flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs transition-colors hover:bg-white/10"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: `oklch(0.75 0.17 ${departmentMap[p.department].accent})` }}
            />
            <span className="flex-1">{p.label}</span>
            <span className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {departmentMap[p.department].name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MessageBlock({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {message.department && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium">
          <span
            className="size-1.5 rounded-full"
            style={{ background: `oklch(0.75 0.17 ${departmentMap[message.department].accent})` }}
          />
          {departmentMap[message.department].name}
        </span>
      )}

      {message.workflow && <WorkflowCard steps={message.workflow} />}

      {message.content ? (
        <div className="max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {message.content.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
            chunk.startsWith("**") && chunk.endsWith("**") ? (
              <strong key={i} className="font-semibold text-foreground">
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{chunk}</span>
            ),
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/8" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-white/8" />
        </div>
      )}

      <AnimatePresence>
        {message.citations && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2 sm:grid-cols-2"
          >
            {message.citations.map((c) => (
              <div key={c.id} className="glass group rounded-2xl p-3.5 transition-colors hover:bg-white/[0.08]">
                <div className="flex items-start gap-2.5">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.6} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{c.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {c.source} · {c.section}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${c.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {message.ticket && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong ring-glow max-w-lg rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold">
              <TicketCheck className="size-4 text-primary" /> Ticket {message.ticket.id}
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
              {message.ticket.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{message.ticket.subject}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-muted-foreground">
            <span>Desk · {message.ticket.assignee}</span>
            <span>SLA · {message.ticket.slaHours}h</span>
            <span>Priority · {message.ticket.priority}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function WorkflowCard({ steps }: { steps: NonNullable<Message["workflow"]> }) {
  return (
    <div className="glass max-w-lg rounded-2xl p-3.5">
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5">
            {s.state === "done" ? (
              <CheckCircle2 className="size-3.5 text-primary" />
            ) : s.state === "active" ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <CircleDot className="size-3.5 text-muted-foreground/50" />
            )}
            <span
              className={`text-[11px] ${s.state === "pending" ? "text-muted-foreground/60" : "text-foreground"}`}
            >
              {s.label}
            </span>
            <span className="ml-auto font-mono text-[9px] text-muted-foreground">{s.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}