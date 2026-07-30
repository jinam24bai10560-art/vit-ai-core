import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithoutRef<typeof motion.button> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function MagneticButton({ children, className, variant = "primary", ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(((e.clientX - r.left) / r.width - 0.5) * 18);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 14);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors",
        variant === "primary"
          ? "bg-primary text-primary-foreground ring-glow hover:bg-primary/90"
          : "glass text-foreground hover:bg-white/10",
        className,
      )}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.35),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </motion.button>
  );
}