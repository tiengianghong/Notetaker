"use client";

import * as React from "react";
import Link from "next/link";
import { BookText, FileText, Trash2 } from "lucide-react";
import type { Document } from "@/lib/db/schema";
import { deleteDocument } from "@/server-actions/documents";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentCard({ doc }: { doc: Document }) {
  const Icon = doc.fileType === "epub" ? BookText : FileText;
  return (
    <div className="group relative flex flex-col rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300">
      <Link href={`/library/${doc.id}`} className="flex flex-col gap-2">
        <Icon size={18} className="text-neutral-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{doc.title}</p>
          {doc.author ? <p className="truncate text-xs text-neutral-500">{doc.author}</p> : null}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-400">
          <span>{doc.fileType}</span>
          <span>·</span>
          <span>{formatSize(doc.fileSize)}</span>
        </div>
      </Link>
      <button
        onClick={() => {
          if (confirm(`Xóa "${doc.title}"?`)) deleteDocument(doc.id);
        }}
        className="absolute right-2 top-2 rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        aria-label="Xóa"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
