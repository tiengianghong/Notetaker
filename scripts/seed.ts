import { db, schema } from "../src/lib/db";
import { newId } from "../src/lib/ids";
import { eq } from "drizzle-orm";

const email = process.env.AUTH_EMAIL;
const passwordHash = process.env.AUTH_PASSWORD_HASH;

if (!email || !passwordHash) {
  console.error("AUTH_EMAIL and AUTH_PASSWORD_HASH must be set in .env.local");
  process.exit(1);
}

const existing = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
if (existing) {
  console.log(`User ${email} already exists (id=${existing.id}). Updating password hash.`);
  db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, existing.id)).run();
} else {
  const id = newId("usr");
  db.insert(schema.users).values({ id, email, passwordHash }).run();
  console.log(`Seeded user ${email} (id=${id}).`);
}
