import { useMemo } from "react";

export function AmbientBackground({ dense = false }: { dense?: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: dense ? 46 : 28 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        delay: (i % 11) * 1.1,
        duration: 14 + ((i * 7) % 16),
        size: 1 + (i % 3),
        opacity: 0.15 + ((i % 5) * 0.1),
      })),
    [dense],
  );

  const streams = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({ id: i, left: 6 + i * 11, delay: i * 1.7, duration: 7 + (i % 4) })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      {/* deep-space gradients */}
      <div className="absolute -top-1/3 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.15_195/0.16),transparent_65%)] blur-2xl" />
      <div className="absolute top-1/4 -left-40 h-[50vh] w-[50vw] rounded-full bg-[radial-gradient(circle,oklch(0.66_0.18_300/0.16),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-0 -right-32 h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(circle,oklch(0.72_0.16_160/0.12),transparent_70%)] blur-3xl" />

      {/* neural mesh */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.16]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="neural-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.15 195)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.66 0.18 300)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={i}
            x1={`${(i * 13) % 100}%`}
            y1={`${(i * 29) % 100}%`}
            x2={`${(i * 41 + 20) % 100}%`}
            y2={`${(i * 17 + 35) % 100}%`}
            stroke="url(#neural-line)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* grid floor */}
      <div className="absolute inset-x-0 bottom-0 h-[46vh] [perspective:520px]">
        <div className="grid-floor h-full w-full origin-bottom [transform:rotateX(72deg)_scale(2.1)] opacity-40 [mask-image:linear-gradient(to_top,black,transparent_78%)]" />
      </div>

      {/* volumetric shafts */}
      <div className="absolute inset-x-0 top-0 h-full opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]">
        <div className="absolute left-[18%] top-0 h-full w-40 -rotate-6 bg-[linear-gradient(to_bottom,oklch(0.78_0.15_195/0.1),transparent_70%)] blur-2xl" />
        <div className="absolute right-[22%] top-0 h-full w-52 rotate-6 bg-[linear-gradient(to_bottom,oklch(0.66_0.18_300/0.1),transparent_70%)] blur-2xl" />
      </div>

      {/* holographic data streams */}
      {streams.map((s) => (
        <span
          key={s.id}
          className="absolute top-0 h-24 w-px bg-[linear-gradient(to_bottom,transparent,oklch(0.78_0.15_195/0.7),transparent)]"
          style={{
            left: `${s.left}%`,
            animation: `stream ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full bg-primary"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
            transform: `translateY(-${(p.id % 9) * 9}vh)`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,oklch(0.145_0.028_265/0.85)_100%)]" />
    </div>
  );
}