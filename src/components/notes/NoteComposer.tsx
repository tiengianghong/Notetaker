"use client";

import * as React from "react";
import { createNote } from "@/server-actions/notes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/tags/TagPicker";

export function NoteComposer({ suggestions }: { suggestions: string[] }) {
  const [content, setContent] = React.useState("");
  const [extraTags, setExtraTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  async function submit() {
    const c = content.trim();
    if (!c) return;
    setBusy(true);
    try {
      await createNote({ content: c, extraTags });
      setContent("");
      setExtraTags([]);
      taRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-3">
      <Textarea
        ref={taRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết ghi chú nhanh… dùng #hashtag để phân loại"
        rows={3}
        className="border-0 p-0 focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex items-end justify-between gap-3 border-t border-neutral-100 pt-2">
        <div className="flex-1">
          <TagPicker
            value={extraTags}
            onChange={setExtraTags}
            suggestions={suggestions}
            placeholder="Tag bổ sung…"
          />
        </div>
        <Button onClick={submit} disabled={!content.trim() || busy} size="sm">
          Lưu ghi chú
        </Button>
      </div>
      <p className="text-[10px] text-neutral-400">Mẹo: Ctrl/⌘+Enter để lưu nhanh.</p>
    </div>
  );
}
