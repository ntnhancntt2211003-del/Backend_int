import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { FaFacebookSquare, FaInstagramSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-3">
            <div className="footer__about">
              <ul>
                <h1 className="footer__about__logo">HKT</h1>
                <li>
                  <Link to="">Email:hello@gmail.com </Link>{" "}
                </li>
                <li>
                  <Link to="">Phone: 0706679352</Link>
                </li>
                <li>
                  <Link to="">Adress:123 Liên Hòa Thuận</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__help">
              <ul>
                <h1 className="footer__help__title">Hỗ trợ</h1>
                <li>
                  <Link to="">Trợ giúp</Link>
                </li>
                <li>
                  <Link to="">Hướng dẫn mua hàng</Link>
                </li>
                <li>
                  <Link to="">Hướng dẫn thanh toán</Link>
                </li>
                <li>
                  <Link to="">Chính sách bảo mật</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__company">
              <ul>
                <h1 className="footer__company__title">Công ty</h1>
                <li>
                  <Link to="">Giới thiệu</Link>
                </li>
                <li>
                  <Link to="">Liên hệ</Link>
                </li>
                <li>
                  <Link to="">Tuyển dụng</Link>
                </li>
                <li>
                  <Link to="">Chính sách bảo mật</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__follow">
              <ul>
                <h1 className="footer__follow__title">FOLLOWS</h1>
                <li>
                  <Link to="">
                    <FaFacebookSquare />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <FaInstagramSquare />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <FaSquareXTwitter />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <IoLogoYoutube />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
