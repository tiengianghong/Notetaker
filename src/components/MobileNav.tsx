"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, NotebookPen, BookOpen, Quote, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Trang chính", icon: LayoutDashboard },
  { href: "/todos", label: "To-do", icon: CheckSquare },
  { href: "/notes", label: "Note", icon: NotebookPen },
  { href: "/library", label: "Đọc", icon: BookOpen },
  { href: "/quotes", label: "Quote", icon: Quote },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              active ? "text-neutral-900" : "text-neutral-500",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
