import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { departments } from "@/lib/api/mock-data";
import { SectionHeading } from "./HowItWorks";

export function DepartmentExplorer() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="Coverage"
        title="Six departments, one intelligence layer"
        subtitle="Each desk contributes its own verified corpus. The assistant routes automatically."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => (
          <motion.article
            key={d.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
            className="group glass relative overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `oklch(0.7 0.17 ${d.accent} / 0.45)` }}
            />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{d.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{d.tagline}</p>
              </div>
              <span
                className="mt-1 size-2.5 rounded-full transition-shadow group-hover:shadow-[0_0_16px_5px_currentColor]"
                style={{ background: `oklch(0.75 0.17 ${d.accent})`, color: `oklch(0.75 0.17 ${d.accent} / 0.5)` }}
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {d.stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/[0.04] p-2.5">
                  <p className="font-mono text-sm text-foreground">{s.value}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-48 group-hover:opacity-100">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Popular queries</p>
              <ul className="mt-2 space-y-1.5">
                {d.popularQueries.map((q) => (
                  <li key={q} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-primary">›</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/chat"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-transform group-hover:translate-x-1"
            >
              Ask {d.name} <ArrowUpRight className="size-3.5" />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}