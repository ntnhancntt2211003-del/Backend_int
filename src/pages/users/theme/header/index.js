import { memo, useState, useEffect } from "react";
import "./style.scss";
import { IoHeartCircle } from "react-icons/io5";
import { FaRegUserCircle, FaChevronDown } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { useEditProduct } from "../../../../context/EditProductContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { isEditing } = useEditProduct();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catError, setCatError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      setCatError(null);
      try {
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

  const menu = [
    { name: "TRANG CHỦ", path: ROUTERS.USER.HOME },
    { name: "CỬA HÀNG", path: ROUTERS.USER.SHOP },
    { name: "SẢN PHẨM", path: ROUTERS.USER.PRODUCTS },
    { name: "LIÊN HỆ", path: "" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateWishlistCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handlePostAdClick = (e) => {
    if (isEditing) {
      e.preventDefault();
      alert(
        "❌ Bạn đang trong quá trình chỉnh sửa sản phẩm!\n\nVui lòng cập nhật xong sản phẩm trước khi đăng sản phẩm mới."
      );
      return;
    }
    navigate(ROUTERS.USER.POST_AD);
  };

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
          <button
            onClick={handlePostAdClick}
            className="post-ad-menu"
            disabled={isEditing}
            title={
              isEditing
                ? "❌ Bạn đang trong quá trình chỉnh sửa sản phẩm. Vui lòng cập nhật xong sản phẩm trước!"
                : "Đăng tin"
            }
            style={{
              cursor: isEditing ? "not-allowed" : "pointer",
              opacity: isEditing ? 0.5 : 1,
              pointerEvents: isEditing ? "auto" : "auto",
            }}
          >
            <div className="post-ad-btn">
              <IoMdCreate className="post-ad-icon" />
              <span className="post-ad-text">Đăng tin</span>
            </div>
          </button>

          {/* NÚT "TÀI KHOẢN" + ICON + MŨI TÊN */}
          <div className="user-menu-account" onClick={toggleUserMenu}>
            <div className="account-btn">
              <img
                src={user?.avatar || "/avatar/default.webp"}
                alt="Avatar"
                className="account-avatar"
                onError={(e) => {
                  e.target.src = "/avatar/default.webp";
                }}
              />
              <FaChevronDown className="dropdown-arrow" />
            </div>

            {/* DROPDOWN */}
            <div
              className={`account-dropdown ${isUserMenuOpen ? "active" : ""}`}
            >
              {user ? (
                // Đã đăng nhập
                <>
                  <div className="dropdown-header">
                    <div className="avatar-display">
                      <img
                        src={user?.avatar || "/avatar/default.webp"}
                        alt={user.username}
                        className="dropdown-avatar"
                        onError={(e) => {
                          e.target.src = "/avatar/default.webp";
                        }}
                      />
                    </div>
                    <h3>Xin chào, {user.username}!</h3>
                    <p>{user.email}</p>
                    <div className="user-info">
                      <p>
                        <strong>Điện thoại:</strong> {user.numberPhone || "N/A"}
                      </p>
                      {user.role === "admin" && (
                        <p className="admin-badge">
                          <strong>Vai trò:</strong> <span>Admin</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="dropdown-section">
                    <h4>Tài khoản</h4>
                    <Link
                      to="/personal-info"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Hồ sơ của tôi</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaRegUserCircle />
                        <span>Trang quản lý Admin</span>
                      </Link>
                    )}
                    <Link
                      to={ROUTERS.USER.PROFILE}
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Tin đăng của tôi</span>
                    </Link>
                    <Link
                      to="/saved"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Tin đăng đã lưu</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                  </div>

                  <div className="dropdown-section">
                    <button className="logout-btn" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                // Chưa đăng nhập
                <>
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
                    <Link
                      to="/saved"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Tin đăng đã lưu</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                    <Link
                      to="/search-history"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Tìm kiếm đã lưu</span>
                    </Link>
                    <Link
                      to="/viewed"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Lịch sử xem tin</span>
                    </Link>
                    <Link
                      to="/my-reviews"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaRegUserCircle />
                      <span>Đánh giá từ tôi</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="wishlist-icon">
            <Link to="/wishlist">
              <IoHeartCircle />
              {updateWishlistCount() > 0 && (
                <span className="wishlist-count">{updateWishlistCount()}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Header);
