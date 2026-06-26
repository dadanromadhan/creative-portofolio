import "dotenv/config";
import { getPayload } from "payload";
import config from "../payload.config.js";

const email = process.env.ADMIN_EMAIL || "admin@daanz.com";
const password = process.env.ADMIN_PASSWORD || "admin123";
const name = process.env.ADMIN_NAME || "Admin";

async function seed() {
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    limit: 1,
  });

  if (existing.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: { email, password, name },
    });
    console.log(`✅ Admin user created: ${email} / ${password}`);
  } else {
    console.log("ℹ️  Admin user already exists, skipping seed.");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
