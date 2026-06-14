"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { createTodo } from "@/server-actions/todos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TodoComposer() {
  const [title, setTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      await createTodo({ title: t });
      setTitle("");
      formRef.current?.querySelector("input")?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thêm việc mới…"
        disabled={busy}
      />
      <Button type="submit" disabled={!title.trim() || busy} size="md">
        <Plus size={14} />
        Thêm
      </Button>
    </form>
  );
}
