import { memo, useEffect, useState } from "react";
import { FiMapPin, FiStar } from "react-icons/fi";
import Breadcrumb from "../theme/breadcrumb";
import img1 from "../images/hero/sp3.jpg";
import img2 from "../images/hero/sp4.jpg";

import { ROUTERS } from "utils/router";
import img3 from "../images/hero/sp5.jpg";
import { Link, useParams } from "react-router-dom";
import BackToTopButton from "component/ProductCard/BackToTopButton";
import "./style.scss";
import { formater } from "utils/formater";
import axios from "axios";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );
        setProduct(response.data.data);

        // Fetch images for the product
        const imagesResponse = await axios.get(
          `http://localhost:8080/api/images/${id}`
        );
        if (imagesResponse.data && imagesResponse.data.length > 0) {
          setProductImages(imagesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;
  }

  const imgs = [img1, img2, img3];
  const owner = product.IdOnwer || {};

  // Format phone number to hide middle digits
  const maskPhone = (phone) => {
    if (!phone) return "***";
    return phone.slice(0, 4) + " " + "*".repeat(4) + " " + phone.slice(-3);
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
      <Breadcrumb name="Chi Tiết sản phẩm" />
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
            <h2 className="product-title">{product.name}</h2>

            <p className="product-condition">Cũ like new</p>

            <h3 className="product-price">{formater(product.price)}</h3>

            <div className="product-address">
              <FiMapPin className="icon" />
              <span>{product.address}</span>
            </div>

            {/* === THÔNG TIN NGƯỜI BÁN === */}
            <div className="seller-profile mt-5 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl">
                    {owner.username
                      ? owner.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  {/* Tên + trạng thái */}
                  <div>
                    <h4 className="font-semibold text-lg">{owner.username}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Hoạt động
                    </p>
                  </div>
                </div>
                {/* Lượt bán + đánh giá */}
                <div className="text-right text-sm">
                  <p className="font-medium">-</p>
                  <p className="text-gray-500">Đã bán</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-yellow-500">
                    <FiStar className="text-xs" /> 0 đánh giá
                  </p>
                </div>
              </div>

              {/* Nút Xem trang */}
              <div className="mt-3 text-right">
                <Link
                  to={ROUTERS.USER.PROFILE}
                  className="btn-view-shop text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition inline-block"
                >
                  Xem trang
                </Link>
              </div>
            </div>

            {/* Số điện thoại (ẩn một phần) */}
            <p className="mt-3 text-sm text-gray-600">
              Phone: <strong>{maskPhone(owner.numberPhone)}</strong> (hiện khi
              liên hệ)
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
                <div className="detail-item">
                  <span className="detail-key">Tiêu đề:</span>
                  <span className="detail-value">{product.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Giá:</span>
                  <span className="detail-value">
                    {formater(product.price)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Danh mục:</span>
                  <span className="detail-value">
                    {product.category?.name || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Địa chỉ:</span>
                  <span className="detail-value">{product.address}</span>
                </div>
              </div>
            ) : (
              <div className="description-content">
                <p className="whitespace-pre-line text-gray-700 leading-6">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
        {/*=== SẢN PHẨM TƯƠNG TỰ === */}
        <div className="similar-products grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {/* Placeholder - có thể thêm sản phẩm tương tự sau */}
          <p className="text-gray-500">Sản phẩm tương tự sẽ hiển thị ở đây</p>
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default memo(ProductDetailPage);
