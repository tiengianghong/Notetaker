import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const uploadDir = process.env.LOCAL_UPLOAD_DIR ?? "./data/uploads";
const absUploadDir = path.isAbsolute(uploadDir)
  ? uploadDir
  : path.join(process.cwd(), uploadDir);

export type StorageObject = {
  key: string;
  size: number;
};

async function ensureDir() {
  await fs.mkdir(absUploadDir, { recursive: true });
}

function resolveKey(key: string): string {
  // prevent path traversal
  const normalized = path.normalize(key).replace(/^([./\\])+/, "");
  const abs = path.join(absUploadDir, normalized);
  if (!abs.startsWith(absUploadDir)) throw new Error("Invalid storage key");
  return abs;
}

function makeKey(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, "") || "";
  const slug = randomBytes(12).toString("base64url");
  return `${slug}${ext}`;
}

export const storage = {
  async put(originalName: string, data: Buffer): Promise<StorageObject> {
    await ensureDir();
    const key = makeKey(originalName);
    const abs = resolveKey(key);
    await fs.writeFile(abs, data);
    return { key, size: data.byteLength };
  },

  async getStream(key: string): Promise<{ size: number; stream: ReadableStream }> {
    const abs = resolveKey(key);
    const stat = await fs.stat(abs);
    const handle = await fs.open(abs, "r");
    const stream = handle.readableWebStream({ type: "bytes" }) as unknown as ReadableStream;
    return { size: stat.size, stream };
  },

  async delete(key: string): Promise<void> {
    const abs = resolveKey(key);
    try {
      await fs.unlink(abs);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  },
};
