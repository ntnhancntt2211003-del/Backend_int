/**
 * Fix Ad #4 - Rename file and update URL
 * Change "anh 4-..." to "anh4-..." (remove space)
 */

import mongoose from "mongoose";
import Ad from "../models/ad.js";
import { connectDB } from "../config/connectionDB.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function fixAd4Filename() {
  try {
    await connectDB();

    console.log("🔍 Finding ad with 'anh 4-' in filename...");

    const ad4 = await Ad.findOne({ imageUrl: /anh\s4-/ });

    if (!ad4) {
      console.log("❌ Ad not found");
      process.exit(1);
    }

    console.log(`✅ Found ad: ${ad4._id}`);
    console.log(`   Old URL: ${ad4.imageUrl}`);

    const oldFilename = path.basename(ad4.imageUrl);
    const newFilename = oldFilename.replace("anh 4-", "anh4-");

    const uploadsDir = path.join(__dirname, "../../public/uploads/ads");
    const oldFilePath = path.join(uploadsDir, oldFilename);
    const newFilePath = path.join(uploadsDir, newFilename);

    console.log(`\n📁 File Operations:`);
    console.log(`   Old file: ${oldFilePath}`);
    console.log(`   New file: ${newFilePath}`);

    if (!fs.existsSync(oldFilePath)) {
      console.log(`❌ Old file doesn't exist`);
      process.exit(1);
    }

    // Rename file
    fs.renameSync(oldFilePath, newFilePath);
    console.log(`✅ File renamed successfully`);

    // Update database
    const newImageUrl = `/uploads/ads/${newFilename}`;
    ad4.imageUrl = newImageUrl;
    await ad4.save();

    console.log(`\n✅ Database updated:`);
    console.log(`   New URL: ${newImageUrl}`);
    console.log(`\n✨ All done!`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixAd4Filename();
