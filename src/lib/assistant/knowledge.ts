import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DepartmentId, KnowledgeDocument } from "@/lib/api/types";

export interface Chunk {
  id: string;
  docId: string;
  docName: string;
  department: DepartmentId;
  version: string;
  index: number;
  text: string;
}

interface StoreShape {
  docs: KnowledgeDocument[];
  chunks: Chunk[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "knowledge-store.json");

let cache: StoreShape | null = null;

async function load(): Promise<StoreShape> {
  if (cache) return cache;
  try {
    const raw = await readFile(STORE_FILE, "utf-8");
    cache = JSON.parse(raw) as StoreShape;
  } catch {
    cache = { docs: [], chunks: [] };
  }
  return cache;
}

async function persist() {
  if (!cache) return;
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 10)}`;

function chunkText(text: string, size = 160, overlap = 30): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  if (!words.length || words[0] === "") return [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    chunks.push(words.slice(i, i + size).join(" "));
    if (i + size >= words.length) break;
  }
  return chunks;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf-parse must be added: npm i pdf-parse
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text ?? "";
}

export async function addDocument(input: {
  name: string;
  department: DepartmentId;
  buffer: Buffer;
  isPdf: boolean;
}): Promise<KnowledgeDocument> {
  const store = await load();
  const sizeKb = Math.max(1, Math.round(input.buffer.byteLength / 1024));
  const doc: KnowledgeDocument = {
    id: uid("doc"),
    name: input.name,
    department: input.department,
    sizeKb,
    chunks: 0,
    status: "indexing",
    uploadedAt: new Date().toISOString(),
    version: "v1.0",
  };
  store.docs.unshift(doc);
  await persist();

  try {
    const text = input.isPdf
      ? await extractPdfText(input.buffer)
      : input.buffer.toString("utf-8");
    const pieces = chunkText(text);
    const chunks: Chunk[] = pieces.map((t, i) => ({
      id: uid("chunk"),
      docId: doc.id,
      docName: doc.name,
      department: doc.department,
      version: doc.version,
      index: i,
      text: t,
    }));
    store.chunks.push(...chunks);
    doc.chunks = chunks.length;
    doc.status = chunks.length > 0 ? "indexed" : "failed";
  } catch (err) {
    console.error("Failed to index document", input.name, err);
    doc.status = "failed";
  }
  await persist();
  return doc;
}

export async function listDocuments(): Promise<KnowledgeDocument[]> {
  return (await load()).docs;
}

export async function removeDocument(id: string) {
  const store = await load();
  store.docs = store.docs.filter((d) => d.id !== id);
  store.chunks = store.chunks.filter((c) => c.docId !== id);
  await persist();
}

export async function reindexAll() {
  const store = await load();
  store.docs = store.docs.map((d) => ({ ...d, status: "indexed" as const }));
  await persist();
  return { queued: store.docs.length };
}

const STOPWORDS = new Set(
  "a an the is are was were be been being to of in on for and or but with as at by from this that it if how what when where who why do does did can could should would will i my me you your".split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export interface RetrievedChunk extends Chunk {
  score: number;
}

/** Naive TF-overlap keyword retrieval — no embeddings, no external calls. */
export async function retrieve(
  question: string,
  department?: DepartmentId,
  topK = 3,
): Promise<RetrievedChunk[]> {
  const store = await load();
  const qTokens = tokenize(question);
  if (!qTokens.length || !store.chunks.length) return [];
  const qSet = new Set(qTokens);

  const pool = department ? store.chunks.filter((c) => c.department === department) : store.chunks;
  const candidates = pool.length ? pool : store.chunks;

  const scored = candidates.map((c) => {
    const cTokens = tokenize(c.text);
    if (!cTokens.length) return { ...c, score: 0 };
    let overlap = 0;
    for (const t of cTokens) if (qSet.has(t)) overlap += 1;
    const score = overlap / Math.sqrt(cTokens.length);
    return { ...c, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
