// src/admin/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
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
} from "react-icons/fa";

const menuItems = [
  { icon: <FaTachometerAlt />, label: "Dashboard", path: "/admin" },
  { icon: <FaBox />, label: "Sản phẩm", path: "/admin/products" },
  { icon: <FaUsers />, label: "Người dùng", path: "/admin/users" },
  { icon: <FaShoppingCart />, label: "Đơn hàng", path: "/admin/orders" },
  { icon: <FaFileAlt />, label: "Bài đăng", path: "/admin/posts" },
  { icon: <FaBullhorn />, label: "Quảng cáo", path: "/admin/ads" },
  { icon: <FaChartLine />, label: "Doanh thu", path: "/admin/revenue" },
  { icon: <FaCog />, label: "Cài đặt", path: "/admin/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="main-sidebar">
      <div className="sidebar-brand">
        <Link to="/admin">Chợ Tốt Admin</Link>
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
          <Link to="/logout">
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
