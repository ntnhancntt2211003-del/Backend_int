/**
 * Check Ad #4 Details
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

async function checkAd4() {
  try {
    await connectDB();

    // Find ad with caption "Quảng cáo 4"
    const ad4 = await Ad.findOne({ caption: "Quảng cáo 4" });

    if (!ad4) {
      console.log("❌ Ad with caption 'Quảng cáo 4' not found");
      process.exit(1);
    }

    console.log("\n📋 Ad #4 Details:");
    console.log("==================");
    console.log(`ID: ${ad4._id}`);
    console.log(`Type: ${ad4.type}`);
    console.log(`Caption: ${ad4.caption}`);
    console.log(`Active: ${ad4.isActive}`);
    console.log(`Image URL: ${ad4.imageUrl}`);
    console.log(`Video URL: ${ad4.videoUrl}`);
    console.log(`Created At: ${ad4.createdAt}`);

    if (ad4.type === "image" && ad4.imageUrl) {
      // Check if image file exists
      const imagePath = path.join(
        __dirname,
        "../../public",
        ad4.imageUrl.replace(/^\/+/, "")
      );
      console.log(`\n📁 File Path: ${imagePath}`);
      const fileExists = fs.existsSync(imagePath);
      console.log(`File Exists: ${fileExists ? "✅ YES" : "❌ NO"}`);

      if (fileExists) {
        const stats = fs.statSync(imagePath);
        console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`✅ File is OK`);
      } else {
        console.log(`❌ File is MISSING!`);
        console.log(`Check if file exists at: ${imagePath}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAd4();
