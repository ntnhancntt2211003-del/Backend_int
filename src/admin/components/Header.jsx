// src/admin/components/Header.jsx
import { FaBell, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import { useState } from "react";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

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
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        <div className="notification">
          <FaBell />
          <span className="badge">3</span>
        </div>
        <div className="user-menu">
          <FaUserCircle />
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
