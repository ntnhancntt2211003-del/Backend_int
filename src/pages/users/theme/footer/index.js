import { memo } from "react";
import "./style.scss";
import { Link } from "react-router-dom";
import { FaFacebookSquare, FaInstagramSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-3">
            <div className="footer__about">
              <ul>
                <h1 className="footer__about__logo">HKT MARKET</h1>

                <li className="footer__contact__item">
                  <a
                    href="mailto:hello@gmail.com"
                    className="footer__link footer__email"
                    title="Gửi email"
                  >
                    <FaEnvelope className="footer__icon" />
                    hello@gmail.com
                  </a>
                </li>
                <li className="footer__contact__item">
                  <a
                    href="tel:0706679352"
                    className="footer__link footer__phone"
                    title="Gọi điện"
                  >
                    <FaPhone className="footer__icon" />
                    0706679352
                  </a>
                </li>
                <li className="footer__contact__item">
                  <a
                    href="https://www.google.com/maps/search/123+Liên+Hòa+Thuận"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__link footer__address"
                    title="Xem trên Google Maps"
                  >
                    <FaMapMarkerAlt className="footer__icon" />
                    123 Liên Hòa Thuận
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__help">
              <ul>
                <h1 className="footer__help__title">Hỗ trợ</h1>
                <li>
                  <Link to="/info/tro-giup" className="footer__link">
                    Trợ giúp
                  </Link>
                </li>
                <li>
                  <Link to="/info/huong-dan-mua-hang" className="footer__link">
                    Hướng dẫn mua hàng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/info/huong-dan-thanh-toan"
                    className="footer__link"
                  >
                    Hướng dẫn thanh toán
                  </Link>
                </li>
                <li>
                  <Link to="/info/chinh-sach-bao-mat" className="footer__link">
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__company">
              <ul>
                <h1 className="footer__company__title">Công ty</h1>
                <li>
                  <Link to="/info/gioi-thieu" className="footer__link">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link to="/lien-he" className="footer__link">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="/info/tuyen-dung" className="footer__link">
                    Tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link to="/info/chinh-sach-bao-mat" className="footer__link">
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-3">
            <div className="footer__follow">
              <ul>
                <h1 className="footer__follow__title">FOLLOWS</h1>
                <li>
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social__link facebook"
                    title="Facebook"
                  >
                    <FaFacebookSquare />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social__link instagram"
                    title="Instagram"
                  >
                    <FaInstagramSquare />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social__link twitter"
                    title="Twitter"
                  >
                    <FaSquareXTwitter />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social__link youtube"
                    title="YouTube"
                  >
                    <IoLogoYoutube />
                  </a>
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
