"use client";

import * as React from "react";
import { ReactReader } from "react-reader";
import type { Rendition, Contents } from "epubjs";
import { Button } from "@/components/ui/button";
import { SaveQuoteDialog } from "./SaveQuoteDialog";

type Props = {
  documentId: string;
  fileUrl: string;
  suggestions: string[];
};

export function EpubReader({ documentId, fileUrl, suggestions }: Props) {
  const [location, setLocation] = React.useState<string | number>(0);
  const [selected, setSelected] = React.useState<{ text: string; cfi: string } | null>(null);
  const [open, setOpen] = React.useState(false);
  const rendition = React.useRef<Rendition | null>(null);

  function getRendition(r: Rendition) {
    rendition.current = r;
    r.on("selected", (cfiRange: string, contents: Contents) => {
      const range = contents.window.getSelection();
      const text = range?.toString().trim() ?? "";
      if (text.length >= 3) setSelected({ text, cfi: cfiRange });
    });
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="flex items-center justify-end gap-2 border-b border-neutral-200 px-3 py-2">
        {selected ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            Lưu quote
          </Button>
        ) : (
          <span className="text-[11px] text-neutral-400">Bôi đen text để lưu quote</span>
        )}
      </div>
      <div className="flex-1 relative">
        <ReactReader
          url={fileUrl}
          location={location}
          locationChanged={(loc) => setLocation(loc)}
          getRendition={getRendition}
          epubInitOptions={{ openAs: "epub" }}
        />
      </div>
      {selected ? (
        <SaveQuoteDialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setSelected(null);
          }}
          documentId={documentId}
          content={selected.text}
          location={selected.cfi}
          suggestions={suggestions}
        />
      ) : null}
    </div>
  );
}
