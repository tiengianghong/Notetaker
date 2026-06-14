import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: npm run hash:password -- "your-password"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 10);
console.log(hash);
