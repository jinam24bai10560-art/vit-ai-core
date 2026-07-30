import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/fx/MagneticButton";

export function CallToAction() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-32 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong relative overflow-hidden rounded-[2rem] px-8 py-20 text-center"
      >
        <div className="halo absolute inset-0" />
        <div className="grid-floor absolute inset-x-0 bottom-0 h-40 opacity-25 [mask-image:linear-gradient(to_top,black,transparent)]" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold sm:text-5xl">
            Every campus answer, <span className="text-aurora">one prompt away</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">
            Built for 20,000+ students, 6 departments and zero guesswork.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/chat">
              <MagneticButton>
                Launch Assistant <ArrowRight className="size-4" />
              </MagneticButton>
            </Link>
            <Link to="/admin">
              <MagneticButton variant="ghost">Knowledge console</MagneticButton>
            </Link>
          </div>
        </div>
      </motion.div>

      <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
        <span>VIT Bhopal · AI Student Assistant</span>
        <span className="font-mono">Grounded · Cited · Auditable</span>
      </footer>
    </section>
  );
}