import { memo, useState, useEffect } from "react";
import "./style.scss";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaRegUserCircle, FaChevronDown } from "react-icons/fa"; // CHỈ DÙNG 2 ICON NÀY
import { IoMdCreate } from "react-icons/io";
import { Link } from "react-router-dom";
import { ROUTERS } from "utils/router";
import axios from "axios";

// Trạng thái: CHƯA ĐĂNG NHẬP
const mockUser = { isLoggedIn: false };

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catError, setCatError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      setCatError(null);
      try {
        // call backend directly on port 8080 (backend server runs on 8080)
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );
        const data = response?.data?.data || response?.data || [];
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCatError(error?.message || "Lỗi tải danh mục");
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // compute menu at render time so `categories` can populate the product children
  const menu = [
    { name: "TRANG CHỦ", path: ROUTERS.USER.HOME },
    { name: "CỬA HÀNG", path: ROUTERS.USER.SHOP },
    { name: "SẢN PHẨM", path: ROUTERS.USER.PRODUCTS },
    // { name: "BÀI VIẾT", path: "" },
    { name: "LIÊN HỆ", path: "" },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateCartCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  // Dropdown menu khi chưa đăng nhập
  const guestMenuItems = [
    {
      icon: <FaRegUserCircle />,
      label: "Tạo tài khoản",
      path: "/Register",
      highlight: true,
    },
    { icon: <FaRegUserCircle />, label: "Đăng nhập", path: "/login" },
    { divider: true },
    { icon: <FaRegUserCircle />, label: "Tin đăng đã lưu", path: "/saved" },
    {
      icon: <FaRegUserCircle />,
      label: "Tìm kiếm đã lưu",
      path: "/search-history",
    },
    { icon: <FaRegUserCircle />, label: "Lịch sử xem tin", path: "/viewed" },
    {
      icon: <FaRegUserCircle />,
      label: "Đánh giá từ tôi",
      path: "/my-reviews",
    },
  ];

  return (
    <div className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="logo">
          <Link to={ROUTERS.USER.HOME}>
            HKT <span>SHOP</span>
          </Link>
        </div>

        <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            {menu.map((item, index) => (
              <li key={index} className={index === 0 ? "active" : ""}>
                <Link to={item.path} onClick={closeMenu}>
                  {item.name}
                </Link>
                {item.name === "SẢN PHẨM" ? (
                  <ul className="nav-dropdown products-dropdown">
                    {loadingCats ? (
                      <li className="loading">Đang tải...</li>
                    ) : catError ? (
                      <li className="error">Lỗi: {catError}</li>
                    ) : categories.length === 0 ? (
                      <li>Không có danh mục</li>
                    ) : (
                      categories.map((c) => (
                        <li key={c._id}>
                          <Link
                            to={`/products?category=${c.slug}`}
                            onClick={closeMenu}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                ) : (
                  item.child && (
                    <ul className="nav-dropdown">
                      {item.child.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link to={child.path} onClick={closeMenu}>
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
            <i className="fas fa-search"></i>
          </div>

          {/* NÚT ĐĂNG TIN */}
          <Link to={ROUTERS.USER.POST_AD} className="post-ad-menu">
            <div className="post-ad-btn">
              <IoMdCreate className="post-ad-icon" />
              <span className="post-ad-text">Đăng tin</span>
              {/* <FaChevronDown className="dropdown-arrow" /> */}
            </div>
          </Link>

          {/* NÚT "TÀI KHOẢN" + ICON + MŨI TÊN */}
          <div className="user-menu-account" onClick={toggleUserMenu}>
            <div className="account-btn">
              <FaRegUserCircle className="account-icon" />
              <span className="account-text">Tài khoản</span>
              <FaChevronDown className="dropdown-arrow" />
            </div>

            {/* DROPDOWN */}
            <div
              className={`account-dropdown ${isUserMenuOpen ? "active" : ""}`}
            >
              <div className="dropdown-header">
                <h3>Mua thì hời, bán thì lời.</h3>
                <p>Đăng nhập cái đã!</p>
                <div className="dropdown-actions">
                  <Link to="/Register" className="btn-create">
                    Tạo tài khoản
                  </Link>
                  <Link to="/login" className="btn-login-small">
                    Đăng nhập
                  </Link>
                </div>
              </div>

              <div className="dropdown-section">
                <h4>Tiện ích</h4>
                {guestMenuItems
                  .filter((item) => !item.divider && !item.highlight)
                  .map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <div className="cart-icon">
            <Link to="/cart">
              <AiOutlineShoppingCart />
              {updateCartCount() > 0 && (
                <span className="cart-count">{updateCartCount()}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Header);
