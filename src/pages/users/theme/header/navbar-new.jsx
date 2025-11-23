import { useState } from "react";
import { Link } from "react-router-dom";
import RegisterModal from "../../../../component/RegisterModal";
import LoginModal from "../../../../component/LoginModal";
import "./style.scss";

const Navbar = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/">
              <h1>HKT SHOP</h1>
            </Link>
          </div>

          <ul className="navbar-menu">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/shop">Cửa hàng</Link>
            </li>
            <li>
              <Link to="/products">Sản phẩm</Link>
            </li>
            <li>
              <Link to="/posts">Bài viết</Link>
            </li>
          </ul>

          <div className="navbar-auth">
            <button 
              className="btn-login"
              onClick={() => setIsLoginOpen(true)}
            >
              Đăng nhập
            </button>
            <button 
              className="btn-register"
              onClick={() => setIsRegisterOpen(true)}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  );
};

export default Navbar;
