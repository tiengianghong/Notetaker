"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/server-actions/documents";

export function UploadDialog() {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setBusy(true);
    setErr(null);
    try {
      await uploadDocument(formData);
      formRef.current?.reset();
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Upload size={14} /> Tải lên
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Tải tài liệu mới">
        <form ref={formRef} action={action} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">File (PDF hoặc EPUB, tối đa 50MB)</Label>
            <Input id="file" name="file" type="file" accept=".pdf,.epub" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Tiêu đề (tùy chọn)</Label>
            <Input id="title" name="title" placeholder="Để trống sẽ dùng tên file" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author">Tác giả (tùy chọn)</Label>
            <Input id="author" name="author" />
          </div>
          {err ? <p className="text-xs text-red-600">{err}</p> : null}
          <div className="mt-1 flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "Đang tải…" : "Tải lên"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
