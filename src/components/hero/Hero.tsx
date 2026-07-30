import { ClientOnly } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useRef, useState } from "react";
import { ArrowRight, Sparkle } from "lucide-react";
import { departments } from "@/lib/api/mock-data";
import type { DepartmentId } from "@/lib/api/types";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { Link } from "@tanstack/react-router";

const AICoreCanvas = lazy(() => import("./AICoreCanvas"));

const ORBIT_RADIUS = 40; // % of container

export function Hero() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [coreHot, setCoreHot] = useState(false);
  const [activeNode, setActiveNode] = useState<DepartmentId | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const paused = activeNode !== null;

  return (
    <section
      ref={wrapper}
      onMouseMove={(e) => {
        const r = wrapper.current?.getBoundingClientRect();
        if (!r) return;
        setPointer({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 flex flex-col items-center text-center"
      >
        <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkle className="size-3.5 text-primary" />
          Retrieval-grounded · Citation-verified · Campus-wide
        </span>
        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-7xl">
          The digital operating system of{" "}
          <span className="text-aurora">VIT Bhopal</span>
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          One intelligence layer across every department — answering students with verified
          university sources, and escalating what needs a human.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/chat">
            <MagneticButton>
              Launch Assistant <ArrowRight className="size-4" />
            </MagneticButton>
          </Link>
          <Link to="/dashboard">
            <MagneticButton variant="ghost">View live insights</MagneticButton>
          </Link>
        </div>
      </motion.div>

      {/* AI core + orbit system */}
      <div className="relative mt-[-2rem] aspect-square w-full max-w-[780px] sm:mt-2">
        <div
          className="absolute inset-0 z-10 [mask-image:radial-gradient(circle_at_center,black_45%,transparent_72%)]"
          onMouseEnter={() => setCoreHot(true)}
          onMouseLeave={() => setCoreHot(false)}
        >
          <ClientOnly
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="size-40 animate-pulse rounded-full bg-primary/10 blur-2xl" />
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="size-40 animate-pulse rounded-full bg-primary/10 blur-2xl" />
                </div>
              }
            >
              <AICoreCanvas active={coreHot || paused} pointer={pointer} />
            </Suspense>
          </ClientOnly>
        </div>

        {/* connection lines */}
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full">
          <defs>
            <linearGradient id="link" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.78 0.15 195)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="oklch(0.66 0.18 300)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {departments.map((d, i) => {
            const angle = (i / departments.length) * Math.PI * 2;
            const cx = Number((50 + Math.cos(angle) * ORBIT_RADIUS).toFixed(3));
            const cy = Number((50 + Math.sin(angle) * ORBIT_RADIUS * 0.78).toFixed(3));
            const on = activeNode === d.id;
            return (
              <g key={d.id}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${cx}%`}
                  y2={`${cy}%`}
                  stroke="url(#link)"
                  strokeWidth={on ? 1.6 : 0.8}
                  strokeDasharray={on ? "0" : "3 6"}
                  opacity={on ? 1 : 0.45}
                />
                {on && (
                  <circle r="3.5" fill="oklch(0.9 0.12 195)">
                    <animateMotion
                      dur="1.1s"
                      repeatCount="indefinite"
                      path={`M ${cx * 0.01 * 780} ${cy * 0.01 * 780} L 390 390`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* orbiting department nodes */}
        {departments.map((d, i) => {
          const angle = (i / departments.length) * Math.PI * 2;
          const cx = Number((50 + Math.cos(angle) * ORBIT_RADIUS).toFixed(3));
          const cy = Number((50 + Math.sin(angle) * ORBIT_RADIUS * 0.78).toFixed(3));
          const on = activeNode === d.id;
          return (
            <div
              key={d.id}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${cx}%`, top: `${cy}%` }}
            >
              <motion.button
                onMouseEnter={() => setActiveNode(d.id)}
                onMouseLeave={() => setActiveNode(null)}
                animate={{
                  y: on ? 0 : [0, -8, 0],
                  scale: on ? 1.22 : 1,
                }}
                transition={
                  on
                    ? { duration: 0.3 }
                    : { duration: 5 + i, repeat: Infinity, ease: "easeInOut" }
                }
                className={`glass-strong relative flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[11px] font-medium tracking-tight transition-shadow sm:text-xs ${
                  on ? "ring-glow text-foreground" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${on ? "bg-primary" : "bg-primary/50"}`}
                  style={on ? { boxShadow: "0 0 12px 3px oklch(0.78 0.15 195 / 0.7)" } : undefined}
                />
                {d.name}
                {on && (
                  <span className="absolute inset-0 rounded-full border border-primary/40 [animation:pulse-ring_1.4s_ease-out_infinite]" />
                )}
              </motion.button>

              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    className="glass-strong pointer-events-none absolute left-1/2 top-[calc(100%+12px)] z-40 w-64 -translate-x-1/2 rounded-2xl p-4 text-left shadow-[var(--shadow-elevated)]"
                  >
                    <p className="text-xs font-semibold text-foreground">{d.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{d.tagline}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {d.stats.map((s) => (
                        <div key={s.label} className="rounded-lg bg-white/5 p-2">
                          <p className="text-[11px] font-semibold text-primary">{s.value}</p>
                          <p className="text-[9px] leading-tight text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-20 mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
      >
        <span>18,420 conversations</span>
        <span className="hidden sm:block">1.8s median answer</span>
        <span>86% auto-deflection</span>
      </motion.div>
    </section>
  );
}