// src/admin/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  FaTachometerAlt,
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaCog,
  FaSignOutAlt,
  FaFileAlt,
  FaBullhorn,
  FaChartLine,
  FaTag,
} from "react-icons/fa";

const menuItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard", path: "/admin" },
  { icon: <FaBox />, label: "Bài đăng", path: "/admin/products" },
  { icon: <FaUsers />, label: "Người dùng", path: "/admin/users" },
  // { icon: <FaShoppingCart />, label: "Đơn hàng", path: "/admin/orders" },
  { icon: <FaFileAlt />, label: "Báo cáo", path: "/admin/posts" },
  { icon: <FaBullhorn />, label: "Quảng cáo", path: "/admin/ads" },
  { icon: <FaChartLine />, label: "Doanh thu", path: "/admin/revenue" },
  { icon: <FaTag />, label: "Phí đăng", path: "/admin/posting-fee" },
  { icon: <FaCog />, label: "HKT Market", path: "/" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="main-sidebar">
      <div className="sidebar-brand">
        <Link to="/admin">HKT Market Admin</Link>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, i) => (
          <li
            key={i}
            className={location.pathname.startsWith(item.path) ? "active" : ""}
          >
            <Link to={item.path}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        <li className="logout">
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              width: "100%",
              fontSize: "inherit",
            }}
          >
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
