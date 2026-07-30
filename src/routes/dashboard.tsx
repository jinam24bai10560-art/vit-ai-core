import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Clock, MessagesSquare, TicketCheck, Zap } from "lucide-react";
import { AmbientBackground } from "@/components/fx/AmbientBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { analytics, departmentMap, threads, tickets } from "@/lib/api/mock-data";

const title = "Insights — VIT Bhopal AI Student Assistant";
const description =
  "Live telemetry across tickets, conversations, department load and the most-asked student questions at VIT Bhopal.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DashboardPage,
});

const statusTone: Record<string, string> = {
  open: "text-destructive bg-destructive/12",
  in_progress: "text-primary bg-primary/12",
  resolved: "text-emerald-300 bg-emerald-400/12",
};

function DashboardPage() {
  const active = tickets.filter((t) => t.status !== "resolved");
  const maxQ = Math.max(...analytics.topQuestions.map((q) => q.count));
  const maxAct = Math.max(...analytics.activity.map((a) => a.conversations));

  const kpis = [
    { icon: TicketCheck, label: "Active tickets", value: String(analytics.activeTickets), delta: -12 },
    { icon: MessagesSquare, label: "Conversations (30d)", value: "18,420", delta: 28 },
    { icon: Clock, label: "Median answer", value: "1.8s", delta: -18 },
    { icon: Zap, label: "Deflection rate", value: "86%", delta: 5 },
  ];

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Telemetry</span>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Campus intelligence dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Rolling 30-day window · refreshed every 60 seconds
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass group rounded-2xl p-5 transition-colors hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between">
                <k.icon className="size-4 text-primary" strokeWidth={1.7} />
                <span
                  className={`flex items-center gap-0.5 font-mono text-[10px] ${k.delta > 0 ? "text-emerald-300" : "text-primary"}`}
                >
                  {k.delta > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.abs(k.delta)}%
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{k.value}</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="glass rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Student activity</h2>
              <span className="font-mono text-[10px] text-muted-foreground">conversations / tickets</span>
            </div>
            <div className="mt-8 flex h-52 items-end gap-4">
              {analytics.activity.map((a, i) => (
                <div key={a.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="relative flex w-full items-end justify-center gap-1" style={{ height: 176 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: Math.round((a.conversations / maxAct) * 168) }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/20 to-primary/80"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: Math.round((a.tickets / 90) * 168) }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.05 }}
                      className="w-2 rounded-t-md bg-accent/70"
                    />
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] opacity-0 transition-opacity group-hover:opacity-100">
                      {a.conversations}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{a.day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="text-sm font-semibold">Department analytics</h2>
            <div className="mt-6 space-y-4">
              {analytics.departmentLoad.map((d, i) => (
                <div key={d.department}>
                  <div className="flex justify-between text-[11px]">
                    <span>{departmentMap[d.department].name}</span>
                    <span className="font-mono text-muted-foreground">
                      {d.volume.toLocaleString()} · {d.resolution}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.resolution}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, oklch(0.7 0.17 ${departmentMap[d.department].accent}), oklch(0.82 0.14 195))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="glass rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Tickets</h2>
              <span className="font-mono text-[10px] text-muted-foreground">
                {active.length} active · {analytics.resolvedTickets.toLocaleString()} resolved
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {tickets.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.08]"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{t.id}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{t.subject}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {departmentMap[t.department].name} · {t.assignee} · SLA {t.slaHours}h
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase ${statusTone[t.status]}`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="text-sm font-semibold">Most asked questions</h2>
            <div className="mt-5 space-y-3.5">
              {analytics.topQuestions.map((q) => (
                <div key={q.question}>
                  <p className="text-[11px]">{q.question}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-primary/80"
                        style={{ width: `${(q.count / maxQ) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground">{q.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="glass mt-4 rounded-3xl p-6">
          <h2 className="text-sm font-semibold">Recent conversations</h2>
          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {threads.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]">
                <p className="text-xs font-medium">{t.title}</p>
                <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {t.messages[0]?.content}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: `oklch(0.75 0.17 ${departmentMap[t.department].accent})` }}
                  />
                  {departmentMap[t.department].name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}