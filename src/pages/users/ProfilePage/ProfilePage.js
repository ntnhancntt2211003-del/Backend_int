// src/pages/users/profile/index.jsx
import { useState } from "react";
import {
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./ProfilePage.scss";
import axios from "axios";

const mockUser = {
  name: "Mi Phạm",
  avatar: "https://i.imgur.com/8g9c1vP.png", // hoặc null
  rating: 4.7,
  reviews: 7,
  followers: 626,
  following: 0,
  location: "Quận Phú Nhuận, Hồ Chí Minh, Việt Nam",
  joinDate: "9 năm 8 tháng",
  isOnline: true,
};

const mockProducts = [
  {
    id: 1,
    image: "https://via.placeholder.com/150",
    title: "iphone 13 ProMax 128 Blue BH dài 6 tháng",
    price: "10.500.000 đ",
    time: "1 tuần trước",
    location: "Tp Hồ Chí Minh",
    liked: true,
  },
  {
    id: 2,
    image: "https://via.placeholder.com/150",
    title: "iphone 12 ProMax 256 màu Gold mới sài 5 tháng Full",
    price: "8.500.000 đ",
    time: "1 tuần trước",
    location: "Tp Hồ Chí Minh",
    liked: false,
  },
  {
    id: 3,
    image: "https://via.placeholder.com/150",
    title: "Iphone 14 ProMax 128 tím Đẹp BH gần 6 tháng",
    price: "13.500.000 đ",
    time: "3 tuần trước",
    location: "Tp Hồ Chí Minh",
    liked: true,
  },
  // Thêm sản phẩm khác nếu cần
];

const ProfilePage = async () => {
  const [activeTab, setActiveTab] = useState("listing"); // 'listing' | 'sold'

  const listingProducts = mockProducts;
  const soldProducts = mockProducts.slice(0, 1);

  return (
    <div className="profile-page">
      <div className="container">
        {/* USER INFO CARD */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              <img
                src={"http://localhost:8080/uploads/IMG_2003.JPG"}
                alt={mockUser.name}
              />
            </div>
            <div className="user-info">
              <h2>{mockUser.name}</h2>
              <div className="rating">
                <span className="score">{mockUser.rating}</span>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.floor(mockUser.rating) ? "filled" : "empty"
                    }
                  />
                ))}
                <span className="reviews">({mockUser.reviews} đánh giá)</span>
              </div>
              <div className="followers">
                Người theo dõi: <strong>{mockUser.followers}</strong> | Đang
                theo dõi: <strong>{mockUser.following}</strong>
              </div>
              <button className="follow-btn">+ Theo dõi</button>
            </div>
            <button className="more-btn">...</button>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <FaCalendarAlt /> Đã tham gia: {mockUser.joinDate}
            </div>
            <div className="detail-item">
              <FaMapMarkerAlt /> Địa chỉ: {mockUser.location}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "listing" ? "active" : ""}`}
            onClick={() => setActiveTab("listing")}
          >
            Đang hiển thị ({listingProducts.length})
          </button>
          <button
            className={`tab ${activeTab === "sold" ? "active" : ""}`}
            onClick={() => setActiveTab("sold")}
          >
            Đã bán ({soldProducts.length})
          </button>
        </div>

        {/* PRODUCT GRID */}
        <div className="product-grid">
          {(activeTab === "listing" ? listingProducts : soldProducts).map(
            (product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="product-card"
              >
                <div className="image-wrapper">
                  <img src={product.image} alt={product.title} />
                  <button className="like-btn">
                    <FaHeart className={product.liked ? "liked" : ""} />
                  </button>
                </div>
                <h3 className="title">{product.title}</h3>
                <p className="price">{product.price}</p>
                <div className="meta">
                  <span className="time">{product.time}</span>
                  <span className="location">{product.location}</span>
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
