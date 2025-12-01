// src/admin/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/admin.scss";

const AdminLayout = () => {
  return (
    <ThemeProvider>
      <div className="admin-wrapper">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="content-wrapper">
            <Outlet /> {/* Nội dung trang con */}
          </div>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
