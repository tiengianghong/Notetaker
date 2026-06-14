"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, NotebookPen, BookOpen, Quote, Hash, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/todos", label: "To-do", icon: CheckSquare },
  { href: "/notes", label: "Ghi chú", icon: NotebookPen },
  { href: "/library", label: "Thư viện", icon: BookOpen },
  { href: "/quotes", label: "Quote", icon: Quote },
  { href: "/tags", label: "Tag", icon: Hash },
];

export function Sidebar({ email, signOutAction }: { email: string | null; signOutAction: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-56 flex-col border-r border-neutral-200 bg-white">
      <div className="px-5 py-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Notetaker
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
                active
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              <Icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-3 text-xs text-neutral-500">
        <p className="truncate px-2 py-1">{email ?? "—"}</p>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
          >
            <LogOut size={13} /> Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
