"use client";

import * as React from "react";
import { Pencil, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "@/lib/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagList } from "@/components/tags/TagList";
import { updateNote, deleteNote } from "@/server-actions/notes";
import { cn } from "@/lib/cn";

type Props = {
  note: Note;
  tags: { id: string; name: string }[];
  suggestions: string[];
};

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteCard({ note, tags, suggestions }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [content, setContent] = React.useState(note.content);
  const [extraTags, setExtraTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      await updateNote({ id: note.id, content, extraTags });
      setEditing(false);
      setExtraTags([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-md border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wide text-neutral-400">
          {formatTime(note.updatedAt)}
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
              if (confirm("Xóa ghi chú này?")) deleteNote(note.id);
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
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
          <TagPicker
            value={extraTags}
            onChange={setExtraTags}
            suggestions={suggestions}
            placeholder="Tag bổ sung…"
          />
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
        <div className={cn("mt-1 prose prose-sm max-w-none prose-neutral", "[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1")}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>
      )}
      <div className="mt-3">
        <TagList tags={tags} size="sm" />
      </div>
    </article>
  );
}
