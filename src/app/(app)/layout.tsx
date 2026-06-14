import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.user.email ?? null} signOutAction={doSignOut} />
      <div className="flex flex-1 flex-col pb-14 md:pb-0">
        <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
