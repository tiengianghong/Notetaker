import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (session?.user) redirect("/");
  const sp = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const next = (formData.get("next") as string) || "/";
    await signIn("credentials", { email, password, redirectTo: next });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Notetaker</h1>
          <p className="mt-1 text-sm text-neutral-500">Đăng nhập để tiếp tục</p>
        </div>
        <form action={login} className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="next" value={sp.next ?? "/"} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {sp.error ? (
            <p className="text-xs text-red-600">Email hoặc mật khẩu không đúng.</p>
          ) : null}
          <Button type="submit" className="mt-2">
            Đăng nhập
          </Button>
        </form>
      </div>
    </main>
  );
}
