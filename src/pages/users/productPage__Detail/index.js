import { memo } from "react";
import { FiMapPin, FiStar } from "react-icons/fi";
import Breadcrumb from "../theme/breadcrumb";
import img1 from "../images/hero/sp3.jpg";
import img2 from "../images/hero/sp4.jpg";

import { ROUTERS } from "utils/router";
import img3 from "../images/hero/sp5.jpg";
import { Link } from "react-router-dom";
import BackToTopButton from "component/ProductCard/BackToTopButton";
import "./style.scss";
import { formater } from "utils/formater";
import { useState } from "react";
const ProductDetailPage = () => {
  const imgs = [img1, img2, img3];
  const [activeTab, setActiveTab] = useState("details"); // "details" | "description"

  // Dữ liệu mẫu
  const productDetails = {
    attributes: {
      "Thương hiệu": "Apple",
      "Dòng máy": "iPhone 14 Pro",
      "Dung lượng": "256GB",
      "Màu sắc": "Deep Purple",
      "Tình trạng pin": "94%",
      "Bảo hành": "Còn 7 tháng",
      "Phụ kiện": "Hộp, sạc, ốp lưng",
    },
    description: `Máy chính hãng VN/A, nguyên bản 100%, không lỗi lầm.
• Màn hình: Super Retina XDR 6.1 inch, 120Hz, Always-on Display
• Chip: A16 Bionic siêu mạnh, tiết kiệm pin
• Camera: 48MP chính, quay 4K Cinematic, chống rung tốt
• Pin: 94% (chỉ thay 1 lần), dùng 1.5 ngày
• Đã dán cường lực + ốp lưng xịn
• Bảo hành Apple chính hãng đến 06/2025

Liên hệ xem máy trực tiếp tại cửa hàng. Hỗ trợ trả góp 0%. Giao hàng toàn quốc.`,
  };
  const similarProducts = [
    {
      id: 1,
      name: "Nike Air Force 1",
      price: 2500000,
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 2,
      name: "Nike Air Max 97",
      price: 3200000,
      img: require("../images/hero/sp2.jpg"),
    },
    {
      id: 3,
      name: "Nike Air Jordan 1",
      price: 4000000,
      img: require("../images/hero/sp3.jpg"),
    },
    {
      id: 4,
      name: "Nike Dunk Low",
      price: 2800000,
      img: require("../images/hero/sp4.jpg"),
    },
    {
      id: 5,
      name: "Nike Blazer Mid",
      price: 2600000,
      img: require("../images/hero/sp5.jpg"),
    },
    {
      id: 6,
      name: "Adidas Ultraboost",
      price: 3500000,
      img: require("../images/hero/sp6.jpg"),
    },
  ];
  return (
    <>
      <Breadcrumb name="Chi Tiết sản phẩm" />;
      <div className="container">
        <div className="row">
          <div className="col-lg-6 product-detail__pic">
            <img src={img1} alt="product-pic" />
            <div className="main">
              {imgs.map((Item, key) => (
                <img src={Item} alt="procduct-pic" key={key} />
              ))}
            </div>
          </div>
          <div className="col-lg-6 product-detail__text">
            <h2 className="product-title">
              iPhone 14 Pro 256GB - Like New 99%
            </h2>

            <p className="product-condition">Cũ like new</p>

            <h3 className="product-price">{formater(18500000)}</h3>

            <div className="product-address">
              <FiMapPin className="icon" />
              <span>Phường 10, Quận 3, TP. Hồ Chí Minh</span>
            </div>

            {/* === THÔNG TIN NGƯỜI BÁN (giống ảnh) === */}
            <div className="seller-profile mt-5 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl">
                    D
                  </div>

                  {/* Tên + trạng thái */}
                  <div>
                    <h4 className="font-semibold text-lg">Đặng Toàn</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Hoạt động 10 ngày trước
                    </p>
                  </div>
                </div>
                {/* Lượt bán + đánh giá */}
                <div className="text-right text-sm">
                  <p className="font-medium">2</p>
                  <p className="text-gray-500">Đã bán</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-yellow-500">
                    <FiStar className="text-xs" /> 0 đánh giá
                  </p>
                </div>
              </div>

              {/* Nút Xem trang */}
              <div className="mt-3 text-right">
                <Link
                  to={ROUTERS.USER.PROFILE} // Đường dẫn trang cá nhân
                  className="btn-view-shop text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition inline-block"
                >
                  Xem trang
                </Link>
              </div>
            </div>

            {/* Số điện thoại (ẩn một phần như Chợ Tốt) */}
            <p className="mt-3 text-sm text-gray-600">
              Phone: <strong>0918 888 ***</strong> (hiện khi liên hệ)
            </p>
          </div>
        </div>
        <div className="product-detail__tab mt-8">
          {/* Tab Header */}
          <div className="tab-header border-b">
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Thông tin chi tiết
            </button>
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content p-4">
            {activeTab === "details" ? (
              <div className="details-content">
                {Object.entries(productDetails.attributes).map(
                  ([key, value]) => (
                    <div key={key} className="detail-item">
                      <span className="detail-key">{key}:</span>
                      <span className="detail-value">{value}</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="description-content">
                <p className="whitespace-pre-line text-gray-700 leading-6">
                  {productDetails.description}
                </p>
              </div>
            )}
          </div>
        </div>
        {/*=== SẢN PHẨM TƯƠNG TỰ === */}
        <div className="similar-products grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {similarProducts.map((product) => (
            <Link
              key={product.id}
              to={`/san-pham/${product.id}`}
              className="similar-product-card group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-chotot transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-red-600 mt-1">
                    {formater(product.price)} ₫
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default memo(ProductDetailPage);
