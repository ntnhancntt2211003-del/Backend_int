import express from "express";
import { GetAllUser } from "../controller/user.controller.js";

const router = express.Router();

const api_routes = (app) => {
  router.get("/get-users", GetAllUser);

  app.use("/api", router);
};

export default api_routes;
