import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formater } from "utils/formater";
import "./SellersPage.scss";

const SellersPage = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("Toàn quốc");

  // Vietnam provinces and cities
  const locations = [
    "Toàn quốc",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Cần Thơ",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP. Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/sellers-with-products"
      );

      if (response.data.success) {
        // Remove duplicates based on seller._id
        const uniqueSellers = Array.from(
          new Map(response.data.data.map((item) => [item._id, item])).values()
        );
        setSellers(uniqueSellers);
        setFilteredSellers(uniqueSellers);
      } else {
        setError("Không thể tải danh sách tài khoản");
      }
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setError("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterSellers(query, selectedLocation);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    filterSellers(searchQuery, location);
  };

  const filterSellers = (query, location) => {
    if (!sellers || sellers.length === 0) {
      setFilteredSellers([]);
      return;
    }

    let filtered = sellers.filter((seller) => {
      // Filter by search query
      const matchesQuery =
        !query.trim() ||
        seller.username.toLowerCase().includes(query.toLowerCase()) ||
        seller.email.toLowerCase().includes(query.toLowerCase()) ||
        (seller.address &&
          seller.address.toLowerCase().includes(query.toLowerCase())) ||
        (seller.uniqueAddresses &&
          seller.uniqueAddresses.some((addr) =>
            addr.toLowerCase().includes(query.toLowerCase())
          ));

      // Filter by location
      let matchesLocation = location === "Toàn quốc";
      if (!matchesLocation) {
        const sellerAddress = seller.address
          ? seller.address.toLowerCase()
          : seller.uniqueAddresses && seller.uniqueAddresses.length > 0
          ? seller.uniqueAddresses[0].toLowerCase()
          : "";
        matchesLocation =
          sellerAddress.includes(location.toLowerCase()) ||
          (seller.products &&
            seller.products.some((product) =>
              product.address?.toLowerCase().includes(location.toLowerCase())
            ));
      }

      return matchesQuery && matchesLocation;
    });

    // Remove duplicates
    const uniqueFiltered = Array.from(
      new Map(filtered.map((item) => [item._id, item])).values()
    );

    setFilteredSellers(uniqueFiltered);
  };

  const handleSellerClick = (sellerId) => {
    navigate(`/users/profile/${sellerId}`);
  };

  if (loading) {
    return (
      <div className="sellers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sellers-page">
      <div className="sellers-container">
        {/* Header */}
        <div className="sellers-header">
          <h1>Tìm Tài Khoản Có Sản Phẩm</h1>
          <p>
            Khám phá các tài khoản có sản phẩm hay từ cộng đồng của chúng tôi
          </p>
        </div>

        {/* Search Bar */}
        <div className="sellers-search">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc địa chỉ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Location Filter */}
        <div className="location-filter">
          <label className="filter-label">📍 Lọc theo địa điểm:</label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="location-select"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="sellers-stats">
          <span className="stat-item">
            Tổng cộng: <strong>{filteredSellers.length}</strong> tài khoản
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Sellers List */}
        {filteredSellers.length > 0 ? (
          <div className="sellers-grid">
            {filteredSellers.map((seller) => (
              <div
                key={seller._id}
                className="seller-card"
                onClick={() => handleSellerClick(seller._id)}
              >
                {/* Avatar */}
                <div className="seller-avatar-container">
                  <img
                    src={seller.avatar || "/avatar/default.webp"}
                    alt={seller.username}
                    className="seller-avatar"
                  />
                  <div className="product-badge">
                    {seller.productCount} sản phẩm
                  </div>
                </div>

                {/* Seller Info */}
                <div className="seller-info">
                  <h3 className="seller-name">{seller.username}</h3>
                  <p className="seller-email">{seller.email}</p>
                  {seller.uniqueAddresses &&
                  seller.uniqueAddresses.length > 0 ? (
                    <p className="seller-address">
                      📍 {seller.uniqueAddresses[0]}
                    </p>
                  ) : seller.address ? (
                    <p className="seller-address">📍 {seller.address}</p>
                  ) : seller.products && seller.products.length > 0 ? (
                    <p className="seller-address">
                      📍 {seller.products[0]?.address || "Chưa cập nhật"}
                    </p>
                  ) : null}
                  {seller.numberPhone && (
                    <p className="seller-phone">📞 {seller.numberPhone}</p>
                  )}
                </div>

                {/* Products Preview */}
                {seller.products && seller.products.length > 0 && (
                  <div className="products-preview">
                    <p className="preview-title">Sản phẩm gần đây:</p>
                    <ul className="products-list">
                      {seller.products.slice(0, 3).map((product) => (
                        <li key={product._id} className="product-item">
                          <span className="product-name">
                            {product.name.substring(0, 25)}...
                          </span>
                          <span className="product-price">
                            {formater(product.price)}đ
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button className="view-profile-btn">Xem Trang Cá Nhân</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">📦</div>
            <h2>Không tìm thấy tài khoản</h2>
            <p>
              {searchQuery
                ? `Không có tài khoản nào phù hợp với từ khóa "${searchQuery}"`
                : "Hiện không có tài khoản nào có sản phẩm"}
            </p>
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => handleSearch("")}
              >
                Xóa Tìm Kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellersPage;
