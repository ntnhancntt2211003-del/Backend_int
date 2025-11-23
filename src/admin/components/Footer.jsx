import React from "react";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} Chợ Tốt Admin</span>
        <span style={{ marginLeft: 12, color: "#666" }}>v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
