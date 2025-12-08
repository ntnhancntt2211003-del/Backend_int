/**
 * Migration: Fix Ad Image URLs
 *
 * Problem: Ads have imageUrl and videoUrl stored as `/public/uploads/ads/filename`
 * but they should be `/uploads/ads/filename` to work with the Express static middleware
 *
 * This script updates all existing ads with the correct URL format
 */

import mongoose from "mongoose";
import Ad from "../models/ad.js";
import { connectDB } from "../config/connectionDB.js";
import dotenv from "dotenv";

dotenv.config();

async function fixAdUrls() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Finding all ads with incorrect URLs...");

    // Find ads with /public/uploads in their URLs
    const adsToUpdate = await Ad.find({
      $or: [
        { imageUrl: { $regex: /^\/public\/uploads/ } },
        { videoUrl: { $regex: /^\/public\/uploads/ } },
      ],
    });

    console.log(`Found ${adsToUpdate.length} ads to update`);

    if (adsToUpdate.length === 0) {
      console.log("No ads need updating");
      process.exit(0);
    }

    // Update each ad
    let updated = 0;
    for (const ad of adsToUpdate) {
      const updateData = {};

      if (ad.imageUrl && ad.imageUrl.startsWith("/public/uploads")) {
        updateData.imageUrl = ad.imageUrl.replace(
          "/public/uploads",
          "/uploads"
        );
      }

      if (ad.videoUrl && ad.videoUrl.startsWith("/public/uploads")) {
        updateData.videoUrl = ad.videoUrl.replace(
          "/public/uploads",
          "/uploads"
        );
      }

      if (Object.keys(updateData).length > 0) {
        await Ad.findByIdAndUpdate(ad._id, updateData);
        updated++;
        console.log(`Updated ad ${ad._id}:`, updateData);
      }
    }

    console.log(`Successfully updated ${updated} ads`);
    console.log("Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

fixAdUrls();
