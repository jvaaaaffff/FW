import { connectDB, disconnectDB } from "./db.js";
import { productService } from "./services/productService.js";

async function seed() {
  try {
    await connectDB();
    await productService.seedProducts();
    console.log("✅ Seed completed: products are now stored in MongoDB.");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
