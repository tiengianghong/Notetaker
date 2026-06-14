import { auth } from "@/lib/auth";

/**
 * Server-side helper: returns the current user id, throwing if not signed in.
 * Use in server actions and server components after auth-gated routes.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}
