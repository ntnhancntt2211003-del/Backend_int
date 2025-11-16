import express from "express";
import connectDB from "./config/connectionDB.js";
import api_routes from "./routes/user.route.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || `3000`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api_routes(app);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
