import { motion } from "framer-motion";
import { Activity, Ticket as TicketIcon, MessagesSquare, Timer } from "lucide-react";
import { analytics } from "@/lib/api/mock-data";
import { departmentMap } from "@/lib/api/mock-data";
import { SectionHeading } from "./HowItWorks";

const kpis = [
  { icon: TicketIcon, label: "Active tickets", value: analytics.activeTickets, delta: "-12%" },
  { icon: MessagesSquare, label: "Conversations", value: "18.4k", delta: "+28%" },
  { icon: Timer, label: "Median answer", value: "1.8s", delta: "-0.4s" },
  { icon: Activity, label: "Deflection", value: "86%", delta: "+5%" },
];

export function DashboardPreview() {
  const max = Math.max(...analytics.activity.map((a) => a.conversations));

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="Telemetry"
        title="Administration sees everything, live"
        subtitle="Volume, load, resolution and escalations across every desk on campus."
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="animated-border glass-strong mt-14 rounded-3xl p-5 shadow-[var(--shadow-elevated)] sm:p-7"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <k.icon className="size-4 text-primary" strokeWidth={1.7} />
                <span className="font-mono text-[10px] text-primary">{k.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</p>
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          <div className="rounded-2xl bg-white/[0.04] p-5 lg:col-span-3">
            <p className="text-xs font-medium text-muted-foreground">Student activity · last 7 days</p>
            <div className="mt-6 flex h-40 items-end gap-3">
              {analytics.activity.map((a, i) => (
                <motion.div
                  key={a.day}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(a.conversations / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex-1 rounded-t-md bg-gradient-to-t from-primary/25 to-primary/80"
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] opacity-0 transition-opacity group-hover:opacity-100">
                    {a.conversations}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 flex gap-3">
              {analytics.activity.map((a) => (
                <span key={a.day} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {a.day}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.04] p-5 lg:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Department load</p>
            <div className="mt-5 space-y-3.5">
              {analytics.departmentLoad.map((d, i) => (
                <div key={d.department}>
                  <div className="flex justify-between text-[11px]">
                    <span>{departmentMap[d.department].name}</span>
                    <span className="font-mono text-muted-foreground">{d.resolution}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.resolution}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, oklch(0.7 0.17 ${departmentMap[d.department].accent}), oklch(0.8 0.14 195))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}