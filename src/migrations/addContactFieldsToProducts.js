import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/products.js";

dotenv.config();

const migrateContactFields = async () => {
  try {
    console.log(
      "🔄 Starting migration to add contactName and contactPhone fields..."
    );

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/test"
    );
    console.log("✅ Connected to MongoDB");

    // Update all products that don't have contactName or contactPhone
    const result = await Product.updateMany(
      {
        $or: [
          { contactName: { $exists: false } },
          { contactPhone: { $exists: false } },
        ],
      },
      {
        $set: {
          contactName: "",
          contactPhone: "",
          condition: "new",
        },
      }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched documents: ${result.matchedCount}`);
    console.log(`   - Modified documents: ${result.modifiedCount}`);

    // Verify the update
    const allProducts = await Product.find({});
    console.log(`\n📊 Total products in database: ${allProducts.length}`);

    const productsWithContactFields = await Product.find({
      contactName: { $exists: true },
      contactPhone: { $exists: true },
    });
    console.log(
      `✅ Products with contact fields: ${productsWithContactFields.length}`
    );

    await mongoose.connection.close();
    console.log("✅ Migration finished and connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateContactFields();
