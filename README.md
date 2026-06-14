# Notetaker

Ứng dụng web cá nhân, tối giản: to-do, ghi chú nhanh có hashtag, đọc PDF/EPUB và lưu quote — tất cả trong một chỗ.

## Stack
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind v4
- SQLite qua Drizzle ORM (better-sqlite3)
- NextAuth.js v5 (credentials, single user)
- react-pdf (PDF) + react-reader / epub.js (EPUB)
- react-markdown cho note

## Chạy local

```bash
npm install
cp .env.example .env.local
# tạo mật khẩu cho mình
npm run hash:password -- "mat-khau-cua-ban"
# dán hash vào AUTH_PASSWORD_HASH trong .env.local
# tạo schema + user
npm run db:push
npm run seed
# chạy dev
npm run dev
```

Mở http://localhost:3000 và đăng nhập bằng `AUTH_EMAIL` + mật khẩu vừa đặt.

## Scripts

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build production |
| `npm start` | Start production server |
| `npm run db:push` | Tạo/cập nhật schema SQLite |
| `npm run db:studio` | Mở Drizzle Studio (xem dữ liệu) |
| `npm run seed` | Tạo user duy nhất từ env |
| `npm run hash:password -- "..."` | Sinh bcrypt hash để dán vào env |
| `npm run lint` | ESLint |

## Biến môi trường

| Tên | Mặc định | Ghi chú |
|---|---|---|
| `DATABASE_URL` | `./data/notetaker.db` | Đường dẫn file SQLite |
| `AUTH_SECRET` | — | `openssl rand -base64 32` |
| `AUTH_EMAIL` | — | Email đăng nhập duy nhất |
| `AUTH_PASSWORD_HASH` | — | Bcrypt hash mật khẩu |
| `STORAGE_DRIVER` | `local` | Hiện chỉ hỗ trợ `local` |
| `LOCAL_UPLOAD_DIR` | `./data/uploads` | Thư mục lưu PDF/EPUB |

## Deploy lên Railway

1. Push repo lên GitHub.
2. Tạo project mới trên Railway từ repo. Railway tự nhận Dockerfile.
3. Vào **Variables** đặt các biến: `AUTH_SECRET`, `AUTH_EMAIL`, `AUTH_PASSWORD_HASH`, `DATABASE_URL=/app/data/notetaker.db`, `LOCAL_UPLOAD_DIR=/app/data/uploads`.
4. Vào **Settings → Volumes**, mount một volume vào `/app/data` (ví dụ 1 GB).
5. Deploy. Lần đầu chạy, container sẽ `drizzle-kit push` để tạo bảng. Vào tab Shell trên Railway và chạy:
   ```
   npm run seed
   ```

## Cấu trúc dữ liệu

Mọi entity (note, quote, todo) đều có thể gắn nhiều tag thông qua bảng `taggings` polymorphic. Hashtag `#abc` trong nội dung sẽ được tự động parse và sync vào bảng `tags`.

## Phím tắt

- `Ctrl/⌘ + Enter` trong NoteComposer: lưu nhanh.
- Bôi đen text trong PDF/EPUB reader → bấm "Lưu quote".

## Giới hạn hiện tại

- File upload tối đa 50 MB (chỉnh trong `documents.ts` và `next.config.ts`).
- Highlight quote trong PDF lưu vị trí dạng `p.<số trang>`, EPUB lưu dạng CFI.
- Chưa có PWA / offline mode (tương lai).
