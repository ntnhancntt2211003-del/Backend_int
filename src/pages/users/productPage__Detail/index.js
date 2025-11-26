import { memo, useEffect, useState } from "react";
import { FiMapPin, FiStar } from "react-icons/fi";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import Breadcrumb from "../theme/breadcrumb";

import { Link, useParams } from "react-router-dom";
import BackToTopButton from "component/ProductCard/BackToTopButton";
import "./style.scss";
import { formater } from "utils/formater";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [productImages, setProductImages] = useState([]);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
        console.log("Images response:", imagesResponse.data);
        if (imagesResponse.data?.data) {
          setProductImages(imagesResponse.data.data);
        }

        // Load wishlist from localStorage
        if (user && user.id) {
          const wishlistKey = `wishlist_${user.id}`;
          const savedWishlist = JSON.parse(
            localStorage.getItem(wishlistKey) || "[]"
          );
          setIsLiked(savedWishlist.includes(id));
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
  }, [id, user]);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;
  }

  // Toggle like product
  const handleToggleLike = () => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để yêu thích sản phẩm");
      return;
    }

    const wishlistKey = `wishlist_${user.id}`;
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    if (isLiked) {
      // Remove from wishlist
      const updatedWishlist = savedWishlist.filter(
        (productId) => productId !== id
      );
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    } else {
      // Add to wishlist
      if (!savedWishlist.includes(id)) {
        savedWishlist.push(id);
        localStorage.setItem(wishlistKey, JSON.stringify(savedWishlist));
      }
    }

    setIsLiked(!isLiked);
  };

  const owner = product.IdOnwer || {};

  // Format phone number to hide middle digits
  const maskPhone = (phone) => {
    if (!phone) return "***";
    return phone.slice(0, 4) + " " + "*".repeat(4) + " " + phone.slice(-3);
  };

  // Copy phone to clipboard
  const copyPhoneToClipboard = () => {
    if (owner.numberPhone) {
      navigator.clipboard.writeText(owner.numberPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Get image URLs for display
  const mainImage =
    productImages?.mainImageUrl || require("../images/hero/sp1.jpg");
  return (
    <>
      <Breadcrumb name="Chi Tiết sản phẩm" />
      <div className="container">
        <div className="row">
          <div className="col-lg-5 product-detail__pic">
            <img
              src={
                mainImageIndex === 0
                  ? productImages?.mainImageUrl || mainImage
                  : productImages?.additionalImageUrls?.[mainImageIndex - 1] ||
                    mainImage
              }
              alt="product-pic"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => setShowLightbox(true)}
            />
            <div className="main">
              {/* Main Image */}
              <img
                src={productImages?.mainImageUrl || mainImage}
                alt="product-pic"
                onClick={() => setMainImageIndex(0)}
                className="cursor-pointer hover:opacity-70 transition"
                style={{ opacity: mainImageIndex === 0 ? 1 : 0.6 }}
              />
              {/* Additional Images */}
              {productImages?.additionalImageUrls &&
              productImages.additionalImageUrls.length > 0 ? (
                productImages.additionalImageUrls.map((imgUrl, key) => (
                  <img
                    src={imgUrl}
                    alt="product-pic"
                    key={key}
                    onClick={() => setMainImageIndex(key + 1)}
                    className="cursor-pointer hover:opacity-70 transition"
                    style={{ opacity: mainImageIndex === key + 1 ? 1 : 0.6 }}
                  />
                ))
              ) : (
                <img
                  src={mainImage}
                  alt="product-pic"
                  onClick={() => setMainImageIndex(0)}
                  className="cursor-pointer hover:opacity-70 transition"
                  style={{ opacity: mainImageIndex === 0 ? 1 : 0.6 }}
                />
              )}
            </div>
          </div>
          <div className="col-lg-7 product-detail__text">
            <div className="product-detail__header">
              <h2 className="product-title">{product.name}</h2>
              <button
                onClick={handleToggleLike}
                className={`btn-like ${isLiked ? "liked" : ""}`}
                title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
              >
                {isLiked ? <PiHeartFill /> : <PiHeartBold />}
              </button>
            </div>

            <p className="product-condition">Cũ like new</p>

            <h3 className="product-price">{formater(product.price)}</h3>

            <div className="product-quantity mt-2 mb-3">
              <p className="text-sm text-gray-700">
                <strong>Số lượng:</strong>{" "}
                <span className="text-lg font-semibold text-blue-600">
                  {product.quantity || 0}
                </span>{" "}
                sản phẩm
              </p>
            </div>

            <div className="product-address">
              <FiMapPin className="icon" />
              <span>{product.address}</span>
            </div>

            <div className="product-phone-contact mt-3">
              <p className="text-sm text-gray-700">
                <strong>Phone:</strong>{" "}
                <span
                  className="font-bold cursor-pointer text-blue-600 hover:text-blue-800 transition"
                  onClick={() => setShowFullPhone(!showFullPhone)}
                >
                  {showFullPhone ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold">
                        {owner.numberPhone || "Chưa cập nhật"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPhoneToClipboard();
                        }}
                        className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                      >
                        {copiedPhone ? "✓ Đã sao chép" : "Sao chép"}
                      </button>
                    </span>
                  ) : (
                    maskPhone(owner.numberPhone)
                  )}
                </span>
                {!showFullPhone && (
                  <span className="text-gray-500 text-xs ml-1">
                    (hiện khi liên hệ)
                  </span>
                )}
              </p>
            </div>

            {/* === THÔNG TIN NGƯỜI BÁN === */}
            <div className="seller-profile mt-5 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
                    {owner.avatar ? (
                      <img
                        src={owner.avatar}
                        alt={owner.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            owner.username?.charAt(0).toUpperCase() || "U";
                        }}
                      />
                    ) : (
                      owner.username?.charAt(0).toUpperCase() || "U"
                    )}
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
                  to={`/seller/${owner._id || owner.id}`}
                  className="btn-view-shop text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition inline-block"
                >
                  Xem trang
                </Link>
              </div>
            </div>

            {/* Số điện thoại (ẩn một phần) */}
            {/* <p className="mt-3 text-sm text-gray-600">
              Phone: <strong>{maskPhone(owner.numberPhone)}</strong> (hiện khi
              liên hệ)
            </p> */}
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

      {/* === LIGHTBOX MODAL === */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex flex-col items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition z-10"
          >
            ✕
          </button>

          {/* Main image container */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                mainImageIndex === 0
                  ? productImages?.mainImageUrl || mainImage
                  : productImages?.additionalImageUrls?.[mainImageIndex - 1] ||
                    mainImage
              }
              alt="product-enlarged"
              className="max-w-full max-h-[75vh] object-contain"
            />

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const totalImages =
                  1 + (productImages?.additionalImageUrls?.length || 0);
                setMainImageIndex(
                  mainImageIndex === 0 ? totalImages - 1 : mainImageIndex - 1
                );
              }}
              className="absolute left-4 text-white text-5xl hover:text-gray-400 transition disabled:opacity-50"
            >
              ‹
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const totalImages =
                  1 + (productImages?.additionalImageUrls?.length || 0);
                setMainImageIndex(
                  mainImageIndex === totalImages - 1 ? 0 : mainImageIndex + 1
                );
              }}
              className="absolute right-4 text-white text-5xl hover:text-gray-400 transition disabled:opacity-50"
            >
              ›
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-6 text-white bg-black bg-opacity-60 px-4 py-2 rounded">
              {mainImageIndex + 1} /{" "}
              {1 + (productImages?.additionalImageUrls?.length || 0)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ProductDetailPage);
