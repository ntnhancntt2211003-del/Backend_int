// src/admin/components/Header.jsx
import { FaBell, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="main-header">
      <div className="header-left">
        <button className="sidebar-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div className="header-right">
        <button
          onClick={toggleTheme}
          className="dark-mode-toggle"
          title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        {/* <div className="notification">
          <FaBell />
          <span className="badge">3</span>
        </div> */}
        <div className="user-menu">
          <FaUserCircle />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
