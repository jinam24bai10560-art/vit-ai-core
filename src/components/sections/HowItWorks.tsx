import { motion } from "framer-motion";
import { Brain, FileCheck2, LifeBuoy, MessageSquareText, Quote } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    title: "Student question",
    detail: "Asked in natural language, any department, any hour.",
    meta: "Intent + department routing",
  },
  {
    icon: Brain,
    title: "AI retrieval",
    detail: "Hybrid vector + keyword search across the campus knowledge graph.",
    meta: "1.3k policy chunks scanned",
  },
  {
    icon: FileCheck2,
    title: "Verified sources",
    detail: "Only current circulars and handbooks pass the freshness gate.",
    meta: "Stale documents rejected",
  },
  {
    icon: Quote,
    title: "Answer + citation",
    detail: "Every claim linked to the exact clause it came from.",
    meta: "0 ungrounded statements",
  },
  {
    icon: LifeBuoy,
    title: "Ticket escalation",
    detail: "Officer decisions become tracked tickets with SLA timers.",
    meta: "Auto-assigned to desk",
  },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="Pipeline"
        title="How an answer is manufactured"
        subtitle="Not prediction — retrieval. Every response walks the same verified pipeline."
      />

      <div className="relative mt-14">
        <div className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-primary/60 via-accent/40 to-transparent md:block" />
        <div className="space-y-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group glass relative flex items-start gap-5 rounded-2xl p-5 transition-colors hover:bg-white/[0.07] md:pl-16"
            >
              <div className="absolute left-4 top-6 hidden size-6 items-center justify-center rounded-full bg-background ring-1 ring-primary/50 md:flex">
                <span className="size-2 rounded-full bg-primary transition-shadow group-hover:shadow-[0_0_14px_4px_oklch(0.78_0.15_195/0.6)]" />
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 md:hidden">
                <s.icon className="size-5" strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.detail}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 self-center rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-muted-foreground lg:flex">
                <s.icon className="size-3.5 text-primary" strokeWidth={1.8} />
                {s.meta}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
    </motion.div>
  );
}