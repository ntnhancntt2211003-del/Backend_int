import express from "express";
import { connectDB } from "./config/connectionDB.js";
import api_routes from "./routes/api.route.js";
import dotenv from "dotenv";
import { seed } from "./seed/seedCategories.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || `8080`;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from public folder
app.use("/public", express.static(path.join(__dirname, "../public")));

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

api_routes(app);

connectDB().then(() => {
  seed();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
