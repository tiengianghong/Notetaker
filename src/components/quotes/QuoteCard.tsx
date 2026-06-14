"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Trash2, X } from "lucide-react";
import type { Quote } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagList } from "@/components/tags/TagList";
import { updateQuote, deleteQuote } from "@/server-actions/quotes";

type Props = {
  quote: Quote;
  tags: { id: string; name: string }[];
  suggestions: string[];
  document?: { id: string; title: string } | null;
  showDocument?: boolean;
};

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });
}

export function QuoteCard({ quote, tags, suggestions, document, showDocument = true }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [content, setContent] = React.useState(quote.content);
  const [note, setNote] = React.useState(quote.note ?? "");
  const [extra, setExtra] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      await updateQuote({ id: quote.id, content, note, tags: extra.length > 0 ? extra : undefined });
      setEditing(false);
      setExtra([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] uppercase tracking-wide text-neutral-400">
          {formatTime(quote.createdAt)}
          {quote.location ? ` · ${quote.location}` : ""}
        </p>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Sửa"
          >
            {editing ? <X size={13} /> : <Pencil size={13} />}
          </button>
          <button
            onClick={() => {
              if (confirm("Xóa quote này?")) deleteQuote(quote.id);
            }}
            className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Xóa"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú…" rows={2} />
          <TagPicker value={extra} onChange={setExtra} suggestions={suggestions} placeholder="Thêm tag…" />
          <div className="flex gap-2">
            <Button onClick={save} disabled={busy} size="sm">
              Lưu
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <>
          <blockquote className="mt-2 border-l-2 border-neutral-300 pl-3 text-sm text-neutral-800 whitespace-pre-wrap">
            {quote.content}
          </blockquote>
          {quote.note ? <p className="mt-2 text-xs text-neutral-600 whitespace-pre-wrap">{quote.note}</p> : null}
        </>
      )}

      <div className="mt-3 flex items-end justify-between gap-2">
        <TagList tags={tags} size="sm" />
        {showDocument && document ? (
          <Link
            href={`/library/${document.id}`}
            className="text-[11px] text-neutral-500 hover:text-neutral-900"
          >
            {document.title} ↗
          </Link>
        ) : null}
      </div>
    </article>
  );
}
