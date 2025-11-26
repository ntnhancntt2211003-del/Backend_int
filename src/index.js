import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RouterCustom from "./router";
import { AuthProvider } from "./context/AuthContext";
import { EditProductProvider } from "./context/EditProductContext";
import "./style/style.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <EditProductProvider>
        <RouterCustom />
      </EditProductProvider>
    </AuthProvider>
  </BrowserRouter>
);
