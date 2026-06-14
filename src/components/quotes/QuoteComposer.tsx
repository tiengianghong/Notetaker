"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TagPicker } from "@/components/tags/TagPicker";
import { createQuote } from "@/server-actions/quotes";

type Props = {
  suggestions: string[];
  documents: { id: string; title: string }[];
};

export function QuoteComposer({ suggestions, documents }: Props) {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [note, setNote] = React.useState("");
  const [documentId, setDocumentId] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function save() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      await createQuote({
        content,
        note,
        documentId: documentId || undefined,
        location: location || undefined,
        tags,
      });
      setContent("");
      setNote("");
      setDocumentId("");
      setLocation("");
      setTags([]);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} /> Thêm quote
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Quote mới">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Trích đoạn</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dán đoạn trích vào đây…"
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Ghi chú</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Tài liệu</label>
              <select
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
              >
                <option value="">— Không —</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Vị trí</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="p.42 / chương 3…" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Tags</label>
            <TagPicker value={tags} onChange={setTags} suggestions={suggestions} />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>
              Hủy
            </Button>
            <Button onClick={save} disabled={busy || !content.trim()} size="sm">
              {busy ? "Đang lưu…" : "Lưu quote"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
