import express from "express";
import { connectDB } from "./config/connectionDB.js";
import api_routes from "./routes/api.route.js";
import dotenv from "dotenv";
import { seed } from "./seed/seedCategories.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || `8080`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors({ origin: "http://localhost:3000" }));

api_routes(app);

connectDB().then(() => {
  seed();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
