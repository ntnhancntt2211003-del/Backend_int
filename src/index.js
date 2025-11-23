import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterCustom from "./router"; // Chỉ import 1 lần
import "./style/style.scss";
import "bootstrap/dist/css/bootstrap.min.css";
// Xóa dòng này: import RouterCustom from "./router"; // User router
// Xóa dòng này: import AdminRouter from "./admin/AdminRouter";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <RouterCustom />
  </BrowserRouter>
);
