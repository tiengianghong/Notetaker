"use client";

import * as React from "react";
import { Trash2, Calendar, Pencil, X } from "lucide-react";
import { toggleTodo, deleteTodo, updateTodo } from "@/server-actions/todos";
import type { Todo } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagList } from "@/components/tags/TagList";
import { cn } from "@/lib/cn";

type Props = {
  todo: Todo;
  tags: { id: string; name: string }[];
  suggestions: string[];
};

function toDateStr(unix: number | null): string {
  if (!unix) return "";
  const d = new Date(unix * 1000);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDue(unix: number | null): string | null {
  if (!unix) return null;
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
}

export function TodoItem({ todo, tags, suggestions }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(todo.title);
  const [notes, setNotes] = React.useState(todo.notes ?? "");
  const [dueDate, setDueDate] = React.useState(toDateStr(todo.dueDate));
  const [priority, setPriority] = React.useState<"low" | "medium" | "high" | "">(todo.priority ?? "");
  const [selectedTags, setSelectedTags] = React.useState<string[]>(tags.map((t) => t.name));
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      await updateTodo({
        id: todo.id,
        title,
        notes,
        dueDate: dueDate || undefined,
        priority: priority || undefined,
        tags: selectedTags,
      });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  const dueLabel = formatDue(todo.dueDate);
  const isOverdue = todo.dueDate && todo.dueDate < Date.now() / 1000 - 24 * 3600 && !todo.done;

  return (
    <div className={cn("rounded-md border border-neutral-200 bg-white p-3", todo.done && "opacity-60")}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={(e) => toggleTodo(todo.id, e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-neutral-900"
          aria-label="Đánh dấu hoàn thành"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("text-sm", todo.done && "line-through text-neutral-500")}>{todo.title}</p>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setEditing((v) => !v)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Sửa"
              >
                {editing ? <X size={13} /> : <Pencil size={13} />}
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Xóa"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {dueLabel ? (
              <span className={cn("inline-flex items-center gap-1 text-[11px]", isOverdue ? "text-red-600" : "text-neutral-500")}>
                <Calendar size={11} />
                {dueLabel}
              </span>
            ) : null}
            {todo.priority ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
                  todo.priority === "high" && "bg-red-50 text-red-600",
                  todo.priority === "medium" && "bg-amber-50 text-amber-700",
                  todo.priority === "low" && "bg-neutral-100 text-neutral-600",
                )}
              >
                {todo.priority}
              </span>
            ) : null}
            <TagList tags={tags} size="sm" />
          </div>
          {todo.notes ? <p className="mt-1.5 text-xs whitespace-pre-wrap text-neutral-600">{todo.notes}</p> : null}

          {editing ? (
            <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề" />
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú (hỗ trợ #hashtag)"
                rows={2}
              />
              <div className="flex flex-wrap gap-2">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="max-w-[12rem]"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                >
                  <option value="">— Ưu tiên —</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Vừa</option>
                  <option value="high">Cao</option>
                </select>
              </div>
              <TagPicker value={selectedTags} onChange={setSelectedTags} suggestions={suggestions} />
              <div className="flex gap-2">
                <Button onClick={save} disabled={busy} size="sm">
                  Lưu
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
