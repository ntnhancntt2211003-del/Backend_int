// src/admin/AdminRouter.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Orders from "./pages/Orders";

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />
        <Route
          path="/settings"
          element={<div>Cài đặt (chưa hoàn thành)</div>}
        />
        <Route path="*" element={<div>Trang không tồn tại</div>} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;
