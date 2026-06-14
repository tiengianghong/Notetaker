"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveQuoteDialog } from "./SaveQuoteDialog";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type Props = {
  documentId: string;
  fileUrl: string;
  suggestions: string[];
};

export function PdfReader({ documentId, fileUrl, suggestions }: Props) {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ text: string; page: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  function onMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const txt = sel.toString().trim();
    if (txt.length < 3) return;
    // Only accept selections inside the page container
    const range = sel.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;
    setSelected({ text: txt, page });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Trang trước"
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-xs text-neutral-600 tabular-nums">
            {page} / {numPages ?? "…"}
          </span>
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => setPage((p) => Math.min(numPages ?? p, p + 1))}
            disabled={!numPages || page >= numPages}
            aria-label="Trang sau"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selected ? (
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Lưu quote
            </Button>
          ) : (
            <span className="text-[11px] text-neutral-400">Bôi đen text để lưu quote</span>
          )}
          <div className="flex items-center gap-0.5">
            <Button
              size="iconSm"
              variant="ghost"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              aria-label="Thu nhỏ"
            >
              <Minus size={13} />
            </Button>
            <span className="text-xs text-neutral-500 tabular-nums w-8 text-center">{Math.round(scale * 100)}%</span>
            <Button
              size="iconSm"
              variant="ghost"
              onClick={() => setScale((s) => Math.min(3, s + 0.1))}
              aria-label="Phóng to"
            >
              <Plus size={13} />
            </Button>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        onMouseUp={onMouseUp}
        className="flex-1 overflow-auto bg-neutral-100 flex justify-center py-4"
      >
        {error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={(info) => setNumPages(info.numPages)}
            onLoadError={(e) => setError(e.message)}
            loading={<div className="p-6 text-sm text-neutral-500">Đang tải PDF…</div>}
          >
            <Page
              pageNumber={page}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer={false}
              className="shadow-md"
            />
          </Document>
        )}
      </div>
      {selected ? (
        <SaveQuoteDialog
          open={dialogOpen}
          onOpenChange={(v) => {
            setDialogOpen(v);
            if (!v) setSelected(null);
          }}
          documentId={documentId}
          content={selected.text}
          location={`p.${selected.page}`}
          suggestions={suggestions}
        />
      ) : null}
    </div>
  );
}
