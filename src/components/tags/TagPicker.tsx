"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
};

function normalize(name: string) {
  return name.trim().toLowerCase().replace(/^#+/, "").replace(/\s+/g, "-");
}

export function TagPicker({ value, onChange, suggestions, placeholder = "Thêm tag…" }: Props) {
  const [input, setInput] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !value.includes(s))
      .slice(0, 6);
  }, [input, suggestions, value]);

  function addTag(name: string) {
    const clean = normalize(name);
    if (!clean) return;
    if (value.includes(clean)) {
      setInput("");
      return;
    }
    onChange([...value, clean]);
    setInput("");
  }

  function removeTag(name: string) {
    onChange(value.filter((v) => v !== name));
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={cn("flex flex-wrap items-center gap-1.5 rounded-md border border-neutral-300 bg-white p-1.5")}>
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
          >
            #{t}
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-700"
              onClick={() => removeTag(t)}
              aria-label={`Xóa tag ${t}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || (e.key === " " && input.trim().length > 0)) {
              e.preventDefault();
              addTag(input);
            } else if (e.key === "Backspace" && input === "" && value.length > 0) {
              removeTag(value[value.length - 1]!);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[6rem] bg-transparent px-1 py-0.5 text-sm placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
      {filtered.length > 0 ? (
        <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full bg-neutral-50 px-2 py-0.5 hover:bg-neutral-100"
            >
              #{s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
