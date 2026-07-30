import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/chat", label: "Assistant" },
  { to: "/dashboard", label: "Insights" },
  { to: "/admin", label: "Knowledge" },
] as const;

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="glass flex w-full max-w-5xl items-center gap-2 rounded-full py-2 pl-3 pr-2 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.9)]">
        <Link to="/" className="flex items-center gap-2.5 pr-3">
          <span className="relative flex size-8 items-center justify-center rounded-xl bg-primary/15">
            <Hexagon className="size-4 text-primary" strokeWidth={1.8} />
            <span className="absolute inset-0 rounded-xl ring-1 ring-primary/40" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            VIT Bhopal <span className="text-muted-foreground">· AI Assistant</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-white/10 data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/chat"
            className="ml-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground ring-glow transition-transform hover:scale-[1.03]"
          >
            Launch
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}