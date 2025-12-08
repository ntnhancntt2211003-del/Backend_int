/**
 * Check Ad counts and details
 */

import mongoose from "mongoose";
import Ad from "../models/ad.js";
import { connectDB } from "../config/connectionDB.js";
import dotenv from "dotenv";

dotenv.config();

async function checkAds() {
  try {
    await connectDB();

    // Count active ads
    const activeAds = await Ad.find({ isActive: true });
    console.log(`\n📊 Active Ads: ${activeAds.length}`);
    activeAds.forEach((ad, index) => {
      console.log(
        `  ${index + 1}. Type: ${ad.type}, Caption: ${ad.caption}, Active: ${
          ad.isActive
        }`
      );
      if (ad.imageUrl) console.log(`     Image: ${ad.imageUrl}`);
      if (ad.videoUrl) console.log(`     Video: ${ad.videoUrl}`);
    });

    // Count image ads
    const imageAds = await Ad.find({ type: "image", isActive: true });
    console.log(`\n🖼️  Image Ads (Active): ${imageAds.length}`);

    // Count all ads
    const allAds = await Ad.find({});
    console.log(`\n📈 Total Ads (All): ${allAds.length}`);
    allAds.forEach((ad, index) => {
      console.log(
        `  ${index + 1}. Type: ${ad.type}, Caption: ${ad.caption}, Active: ${
          ad.isActive
        }`
      );
    });

    console.log(
      "\n⚠️  Frontend expects at least 6 image ads to show banner properly"
    );
    console.log(`✅ Currently have ${imageAds.length} active image ads`);

    if (imageAds.length < 6) {
      console.log("\n💡 Solution: Need to activate more ads or add more ads");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkAds();
