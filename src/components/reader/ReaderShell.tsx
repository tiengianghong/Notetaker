"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { touchDocument } from "@/server-actions/documents";

const PdfReader = dynamic(() => import("./PdfReader").then((m) => m.PdfReader), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-neutral-500">Đang tải reader…</div>,
});
const EpubReader = dynamic(() => import("./EpubReader").then((m) => m.EpubReader), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-neutral-500">Đang tải reader…</div>,
});

type Props = {
  documentId: string;
  fileType: "pdf" | "epub";
  fileUrl: string;
  suggestions: string[];
};

export function ReaderShell({ documentId, fileType, fileUrl, suggestions }: Props) {
  React.useEffect(() => {
    touchDocument(documentId).catch(() => {});
  }, [documentId]);

  return fileType === "pdf" ? (
    <PdfReader documentId={documentId} fileUrl={fileUrl} suggestions={suggestions} />
  ) : (
    <EpubReader documentId={documentId} fileUrl={fileUrl} suggestions={suggestions} />
  );
}
