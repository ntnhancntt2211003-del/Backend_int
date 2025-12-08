/**
 * Fix Ad #4 Caption
 * Change "bị ẩn" to "Quảng cáo 4"
 */

import mongoose from "mongoose";
import Ad from "../models/ad.js";
import { connectDB } from "../config/connectionDB.js";
import dotenv from "dotenv";

dotenv.config();

async function fixAdCaption() {
  try {
    await connectDB();

    console.log("Looking for ad with caption 'bị ẩn'...");

    const ad = await Ad.findOne({ caption: "bị ẩn" });

    if (!ad) {
      console.log("❌ Ad with caption 'bị ẩn' not found");
      process.exit(0);
    }

    console.log(`✅ Found ad: ${ad._id}`);
    console.log(`   Old caption: "${ad.caption}"`);

    // Update caption
    ad.caption = "Quảng cáo 4";
    await ad.save();

    console.log(`✅ Updated caption: "${ad.caption}"`);
    console.log("✨ Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAdCaption();
