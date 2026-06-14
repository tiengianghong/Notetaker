import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const { key } = await params;

  try {
    const { size, stream } = await storage.getStream(decodeURIComponent(key));
    const ext = key.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "epub"
          ? "application/epub+zip"
          : "application/octet-stream";
    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
