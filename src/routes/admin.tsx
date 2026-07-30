import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/fx/AmbientBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MagneticButton } from "@/components/fx/MagneticButton";
import { listDocumentsFn, uploadDocumentFn, removeDocumentFn, reindexFn } from "@/lib/assistant/functions";
import { departmentMap, departments } from "@/lib/api/mock-data";
import type { DepartmentId, KnowledgeDocument } from "@/lib/api/types";

const title = "Knowledge Console — VIT Bhopal AI Student Assistant";
const description =
  "Upload, inspect, re-index and retire the official documents powering the VIT Bhopal AI Student Assistant.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdminPage,
});

const statusMeta: Record<KnowledgeDocument["status"], { tone: string; icon: typeof CheckCircle2 }> = {
  indexed: { tone: "text-emerald-300 bg-emerald-400/12", icon: CheckCircle2 },
  indexing: { tone: "text-primary bg-primary/12", icon: Loader2 },
  queued: { tone: "text-muted-foreground bg-white/8", icon: Database },
  failed: { tone: "text-destructive bg-destructive/12", icon: AlertTriangle },
};

function AdminPage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [dept, setDept] = useState<DepartmentId>("academics");
  const [dragging, setDragging] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listDocumentsFn().then(setDocs);
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      form.set("department", dept);
      toast.loading(`Indexing ${file.name}…`, { id: file.name });
      try {
        const doc = await uploadDocumentFn({ data: form });
        setDocs((prev) => [doc, ...prev]);
        if (doc.status === "indexed") {
          toast.success(`${file.name} indexed — ${doc.chunks} chunks`, { id: file.name });
        } else {
          toast.error(`${file.name} failed to index (no extractable text?)`, { id: file.name });
        }
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`, { id: file.name });
      }
    }
  }

  async function remove(id: string) {
    await removeDocumentFn({ data: { id } });
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast("Document removed from the knowledge base");
  }

  async function reindex() {
    setReindexing(true);
    setDocs((prev) => prev.map((d) => ({ ...d, status: "indexing" as const })));
    const res = await reindexFn();
    setDocs(await listDocumentsFn());
    setReindexing(false);
    toast.success(`Re-indexed ${res.queued} documents`);
  }

  const totalChunks = docs.reduce((a, d) => a + d.chunks, 0);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Console</span>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Knowledge base</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {docs.length} documents · {totalChunks.toLocaleString()} embedded chunks
            </p>
          </motion.div>
          <MagneticButton variant="ghost" onClick={reindex} disabled={reindexing}>
            <RefreshCw className={`size-4 ${reindexing ? "animate-spin" : ""}`} />
            {reindexing ? "Re-indexing…" : "Re-index knowledge base"}
          </MagneticButton>
        </div>

        {/* uploader */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`glass mt-8 rounded-3xl p-8 text-center transition-colors ${
            dragging ? "ring-glow bg-white/[0.08]" : ""
          }`}
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/25">
            <Upload className="size-6 text-primary" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-medium">Drop official circulars, handbooks or policy PDFs</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Chunked, embedded and freshness-gated before students ever see them.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setDept(d.id)}
                className={`rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                  dept === d.id ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <div className="mt-6">
            <MagneticButton onClick={() => fileRef.current?.click()}>Select documents</MagneticButton>
          </div>
        </motion.div>

        {/* document table */}
        <section className="glass mt-4 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-12 gap-4 border-b border-border px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Document</span>
            <span className="col-span-2">Department</span>
            <span className="col-span-2">Chunks</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1" />
          </div>
          <AnimatePresence initial={false}>
            {docs.map((d) => {
              const meta = statusMeta[d.status];
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group grid grid-cols-12 items-center gap-4 border-b border-border px-6 py-4 last:border-0 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="col-span-5 flex min-w-0 items-center gap-3">
                    <FileText className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.version} · {(d.sizeKb / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <span className="col-span-2 text-[11px] text-muted-foreground">
                    {departmentMap[d.department].name}
                  </span>
                  <span className="col-span-2 font-mono text-[11px] text-muted-foreground">
                    {d.chunks.toLocaleString()}
                  </span>
                  <span className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase ${meta.tone}`}
                    >
                      <meta.icon className={`size-3 ${d.status === "indexing" ? "animate-spin" : ""}`} />
                      {d.status}
                    </span>
                  </span>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => void remove(d.id)}
                      aria-label={`Delete ${d.name}`}
                      className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}