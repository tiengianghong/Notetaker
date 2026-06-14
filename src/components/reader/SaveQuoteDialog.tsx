"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/tags/TagPicker";
import { createQuote } from "@/server-actions/quotes";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentId: string;
  content: string;
  location?: string;
  suggestions: string[];
};

export function SaveQuoteDialog({ open, onOpenChange, documentId, content, location, suggestions }: Props) {
  const [text, setText] = React.useState(content);
  const [note, setNote] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setText(content);
      setNote("");
      setTags([]);
    }
  }, [open, content]);

  async function save() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await createQuote({ content: text, note, documentId, location, tags });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Lưu quote">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Trích đoạn</label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Ghi chú</label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="(Tùy chọn) Suy nghĩ của bạn…" rows={2} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">Tags</label>
          <TagPicker value={tags} onChange={setTags} suggestions={suggestions} />
        </div>
        {location ? (
          <p className="text-[11px] text-neutral-500">Vị trí: {location}</p>
        ) : null}
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Hủy
          </Button>
          <Button onClick={save} disabled={busy || !text.trim()} size="sm">
            {busy ? "Đang lưu…" : "Lưu quote"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
