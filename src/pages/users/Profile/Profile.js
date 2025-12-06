import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { formater } from "utils/formater";
import FollowButton from "../../../components/FollowButton";
import "./Profile.scss";

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id: sellerId } = useParams();
  const [avatar, setAvatar] = useState(user?.avatar || "/avatar/default.webp");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [activeTab, setActiveTab] = useState("posted");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [showHiddenReasonModal, setShowHiddenReasonModal] = useState(false);
  const [selectedHiddenProduct, setSelectedHiddenProduct] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server (you need to setup a file upload endpoint)
      // For now, we'll use a base64 approach or image CDN
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const avatarUrl = event.target.result; // Base64 or URL

          // Send to backend
          const response = await fetch(
            `http://localhost:8080/api/user/${user.id}/avatar`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                avatarUrl: avatarUrl,
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setAvatar(avatarUrl);
            setSuccess("Cập nhật ảnh đại diện thành công!");
          } else {
            setError(data.message || "Lỗi cập nhật ảnh đại diện");
          }
        } catch (err) {
          setError("Lỗi: " + err.message);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("Lỗi upload: " + err.message);
      setUploading(false);
    }
  };

  // Fetch seller info if viewing someone else's profile
  useEffect(() => {
    if (sellerId) {
      axios
        .get(`http://localhost:8080/api/users/${sellerId}/profile`)
        .then((res) => {
          setSellerInfo(res.data?.data || res.data);
          setIsOwnProfile(false);
          // Fetch follow stats
          fetchFollowStats(sellerId);
        })
        .catch((err) => {
          console.error("Error fetching seller info:", err);
          setError("Không tìm thấy người bán");
        });
    } else {
      setIsOwnProfile(true);
      setSellerInfo(null);
      if (user?.id) {
        fetchFollowStats(user.id);
      }
    }
  }, [sellerId, user?.id]);

  // Fetch followers and following counts
  const fetchFollowStats = async (userId) => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/users/${userId}/followers`),
        axios.get(`http://localhost:8080/api/users/${userId}/following`),
      ]);
      setFollowerCount(followersRes.data?.followerCount || 0);
      setFollowingCount(followingRes.data?.followingCount || 0);
    } catch (err) {
      console.error("Error fetching follow stats:", err);
    }
  };

  // Fetch user products
  useEffect(() => {
    const fetchProducts = async () => {
      // Use sellerId if viewing someone else's profile, otherwise use current user's id
      const ownerId = sellerId || user?.id;
      if (!ownerId) return;

      setLoadingProducts(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products?idOwner=${ownerId}`
        );

        // Handle both response formats
        const productData = response.data?.data || response.data || [];

        console.log("=== PROFILE FETCH PRODUCTS ===");
        console.log("Raw API response:", response.data);
        console.log("Product data extracted:", productData);
        console.log("Sample product:", productData[0]);

        if (productData && productData.length > 0) {
          setProducts(productData);
          console.log("DEBUG: Full user object:", user);
          console.log("DEBUG: user.id:", user?.id);
          console.log("DEBUG: Products loaded:", productData);
          console.log("DEBUG: First product IdOnwer:", productData[0]?.IdOnwer);
          console.log(
            "DEBUG: Hidden products:",
            productData.filter((p) => p.isHidden)
          );
          console.log("DEBUG: Product fields sample:", {
            id: productData[0]?._id,
            isHidden: productData[0]?.isHidden,
            hiddenReason: productData[0]?.hiddenReason,
            status: productData[0]?.status,
          });

          // Fetch images for each product
          const imagePromises = productData.map((product) =>
            axios
              .get(`http://localhost:8080/api/images/${product._id}`)
              .then((res) => ({
                productId: product._id,
                data: res.data?.data,
              }))
              .catch(() => ({ productId: product._id, data: null }))
          );

          const imageResults = await Promise.all(imagePromises);
          const imagesMap = {};
          imageResults.forEach(({ productId, data }) => {
            if (data) {
              imagesMap[productId] = data;
            }
          });
          setProductImages(imagesMap);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Lỗi tải sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user, sellerId]);

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      try {
        setDeleting(productId);
        await axios.delete(`http://localhost:8080/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(products.filter((p) => p._id !== productId));
        setSuccess("Xóa sản phẩm thành công!");
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Lỗi xóa sản phẩm");
      } finally {
        setDeleting(null);
      }
    }
  };

  // Handle mark as sold
  const handleMarkSold = async (productId) => {
    try {
      setDeleting(productId);
      await axios.patch(
        `http://localhost:8080/api/products/${productId}`,
        { status: "sold" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(
        products.map((p) =>
          p._id === productId ? { ...p, status: "sold" } : p
        )
      );
      setSuccess("Đánh dấu bán thành công!");
    } catch (err) {
      console.error("Error marking sold:", err);
      setError("Lỗi khi đánh dấu bán");
    } finally {
      setDeleting(null);
    }
  };

  // Handle mark as active
  const handleMarkActive = async (productId) => {
    try {
      setDeleting(productId);
      await axios.patch(
        `http://localhost:8080/api/products/${productId}`,
        { status: "active" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(
        products.map((p) =>
          p._id === productId ? { ...p, status: "active" } : p
        )
      );
      setSuccess("Đánh dấu hoạt động thành công!");
    } catch (err) {
      console.error("Error marking active:", err);
      setError("Lỗi khi đánh dấu hoạt động");
    } finally {
      setDeleting(null);
    }
  };

  // Check if current user is the owner of the product
  // Translate hidden reason to Vietnamese
  const translateHiddenReason = (reason) => {
    const reasonMap = {
      fake_product: "Sản phẩm giả mạo",
      scam: "Gian lận, lừa đảo",
      inappropriate_content: "Nội dung không phù hợp",
      spam: "Spam",
      illegal_item: "Sản phẩm bất hợp pháp",
      offensive_language: "Ngôn ngữ xúc phạm",
      other: "Lý do khác",
    };

    // Check if reason contains "Báo cáo vi phạm:" format
    if (reason && reason.includes("Báo cáo vi phạm:")) {
      const reasonKey = reason.replace("Báo cáo vi phạm: ", "").trim();
      return reasonMap[reasonKey] || reason;
    }

    return reason;
  };

  // Fetch user ratings from all their products
  const fetchUserRatings = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/products?owner=${userId}`
      );
      const userProducts = response.data?.data || [];

      // Fetch comments for each product
      let allComments = [];
      for (const product of userProducts) {
        try {
          const commentsRes = await axios.get(
            `http://localhost:8080/api/comments?productId=${product._id}`
          );
          if (commentsRes.data?.data) {
            allComments = [...allComments, ...commentsRes.data.data];
          }
        } catch (err) {
          console.error("Error fetching comments for product:", err);
        }
      }

      // Calculate average rating
      if (allComments.length > 0) {
        const avgRating =
          allComments.reduce((sum, c) => sum + (c.rating || 5), 0) /
          allComments.length;
        setAverageRating(Math.round(avgRating * 10) / 10); // Round to 1 decimal
        setTotalRatings(allComments.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  // Fetch ratings when component mounts or profile changes
  useEffect(() => {
    const userId = sellerId || user?.id;
    if (userId) {
      fetchUserRatings(userId);
    }
  }, [sellerId, user?.id]);

  const renderStars = (rating) => {
    return (
      <>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(rating) ? "filled" : ""}
          >
            ★
          </span>
        ))}
      </>
    );
  };

  const isProductOwner = (product) => {
    if (!user || !product) {
      console.log("DEBUG isProductOwner: user or product missing", {
        user,
        product,
      });
      return false;
    }

    // Handle both string ID and object (populated) cases
    const productOwnerId =
      typeof product.IdOnwer === "string"
        ? product.IdOnwer
        : product.IdOnwer?._id;

    const isOwner = productOwnerId === user.id || product.IdOwner === user.id;
    console.log("DEBUG isProductOwner:", {
      userId: user.id,
      productOwnerId,
      product_IdOnwer: product.IdOnwer,
      product_IdOwner: product.IdOwner,
      isOwner,
    });

    return isOwner;
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* LEFT SIDEBAR - SELLER CARD */}
        <div className="profile-sidebar">
          <div className="seller-card">
            {/* Avatar Section */}
            <div className="seller-avatar-wrapper">
              <img
                src={avatar}
                alt="Avatar"
                className="seller-avatar"
                onError={(e) => {
                  e.target.src = "/avatar/default.webp";
                }}
              />
              {isOwnProfile && (
                <>
                  <label
                    htmlFor="avatar-input"
                    className="avatar-upload-overlay"
                  >
                    <i className="fas fa-camera"></i>
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </>
              )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Seller Info */}
            {(user || sellerInfo) && (
              <div className="seller-info">
                <h3 className="seller-name">
                  {sellerInfo?.username || user?.username}
                </h3>
                <div className="seller-rating">
                  <span className="rating-score">{averageRating || "0"}</span>
                  <div className="rating-stars">
                    {renderStars(averageRating)}
                  </div>
                  <span className="rating-count">
                    ({totalRatings} đánh giá)
                  </span>
                </div>

                <div className="seller-stats">
                  <div className="stat-item">
                    <Link
                      to={`/users/following/${
                        sellerId || user?.id
                      }?tab=followers`}
                      className="stat-link"
                    >
                      <span className="stat-label">Người theo dõi:</span>
                      <span className="stat-value">{followerCount}</span>
                    </Link>
                  </div>
                  <div className="stat-item">
                    <Link
                      to={`/users/following/${
                        sellerId || user?.id
                      }?tab=following`}
                      className="stat-link"
                    >
                      <span className="stat-label">Đang theo dõi:</span>
                      <span className="stat-value">{followingCount}</span>
                    </Link>
                  </div>
                </div>

                <FollowButton
                  userId={sellerId || user?.id}
                  currentUserId={user?.id}
                  onFollowChange={(data) => {
                    setFollowerCount(data.followerCount || followerCount);
                    fetchFollowStats(sellerId || user?.id);
                  }}
                />

                <div className="seller-details">
                  <div className="detail-item">
                    <span className="detail-icon">💬</span>
                    <span className="detail-text">
                      Phản hồi chat: 90% (Phản hồi chậm)
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">
                      Đã tham gia: 8 năm 8 tháng
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">✓</span>
                    <span className="detail-text">Đã xác thực: ✓</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">
                      Địa chỉ:{" "}
                      {(sellerInfo || user)?.address || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="profile-content">
          {/* Alerts */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Products Section */}
          <div className="products-card">
            <div className="products-header">
              <h3>
                {isOwnProfile
                  ? "Bài đăng của tôi"
                  : `Bài đăng của ${sellerInfo?.username || "người bán"}`}
              </h3>
              <div className="products-tabs">
                <button
                  className={`tab ${activeTab === "posted" ? "active" : ""}`}
                  onClick={() => setActiveTab("posted")}
                >
                  Đang hiển thị (
                  {
                    products.filter((p) => p.status !== "sold" && !p.isHidden)
                      .length
                  }
                  )
                </button>
                <button
                  className={`tab ${activeTab === "sold" ? "active" : ""}`}
                  onClick={() => setActiveTab("sold")}
                >
                  Đã bán ({products.filter((p) => p.status === "sold").length})
                </button>
                <button
                  className={`tab ${activeTab === "hidden" ? "active" : ""}`}
                  onClick={() => setActiveTab("hidden")}
                >
                  Đã ẩn ({products.filter((p) => p.isHidden).length})
                </button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="loading">Đang tải sản phẩm...</div>
            ) : (
              <div className="products-grid">
                {products && products.length > 0 ? (
                  products
                    .filter((p) =>
                      activeTab === "posted"
                        ? p.status !== "sold" && !p.isHidden
                        : activeTab === "sold"
                        ? p.status === "sold"
                        : p.isHidden
                    )
                    .map((product) => (
                      <div key={product._id} className="product-card-wrapper">
                        {activeTab === "hidden" ? (
                          <div
                            className="product-card-link"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedHiddenProduct(product);
                              setShowHiddenReasonModal(true);
                            }}
                          >
                            <div className="product-card">
                              <div className="product-image">
                                <img
                                  src={
                                    productImages[product._id]?.mainImageUrl ||
                                    "/images/hero/sp1.jpg"
                                  }
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.src = "/images/hero/sp1.jpg";
                                  }}
                                />
                                {product.isHidden && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: "rgba(0,0,0,0.6)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    ĐANG ẨN
                                  </div>
                                )}
                              </div>
                              <div className="product-info">
                                <h4 className="product-name">{product.name}</h4>
                                <p className="product-price">
                                  {formater(product.price)}
                                </p>
                                <p className="product-location">
                                  {product.address}
                                </p>
                                {product.isHidden && product.hiddenReason && (
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#d0021b",
                                      margin: "4px 0 0 0",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Lý do:{" "}
                                    {translateHiddenReason(
                                      product.hiddenReason
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/products/chi-tiet/${product._id}`}
                            className="product-card-link"
                          >
                            <div className="product-card">
                              <div className="product-image">
                                <img
                                  src={
                                    productImages[product._id]?.mainImageUrl ||
                                    "/images/hero/sp1.jpg"
                                  }
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.src = "/images/hero/sp1.jpg";
                                  }}
                                />
                                {product.isHidden && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: "rgba(0,0,0,0.6)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontSize: "14px",
                                      fontWeight: "600",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    ĐANG ẨN
                                  </div>
                                )}
                              </div>
                              <div className="product-info">
                                <h4 className="product-name">{product.name}</h4>
                                <p className="product-price">
                                  {formater(product.price)}
                                </p>
                                <p className="product-location">
                                  {product.address}
                                </p>
                                {product.isHidden && product.hiddenReason && (
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#d0021b",
                                      margin: "4px 0 0 0",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Lý do:{" "}
                                    {translateHiddenReason(
                                      product.hiddenReason
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        )}

                        {/* Action Buttons - Only show if current user is the owner and not in hidden tab */}
                        {isProductOwner(product) && activeTab !== "hidden" && (
                          <div className="product-actions">
                            <button
                              className="btn-edit"
                              onClick={() =>
                                navigate(`/users/post-ad?edit=${product._id}`)
                              }
                              disabled={deleting === product._id}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>

                            {product.status === "active" ? (
                              <button
                                className="btn-sold"
                                onClick={() => handleMarkSold(product._id)}
                                disabled={deleting === product._id}
                                title="Đánh dấu đã bán"
                              >
                                ✓ Bán
                              </button>
                            ) : (
                              <button
                                className="btn-active"
                                onClick={() => handleMarkActive(product._id)}
                                disabled={deleting === product._id}
                                title="Đánh dấu hoạt động"
                              >
                                ↺ Hoạt động
                              </button>
                            )}

                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteProduct(product._id)}
                              disabled={deleting === product._id}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="no-products">
                    {activeTab === "posted"
                      ? "Chưa có sản phẩm nào"
                      : activeTab === "sold"
                      ? "Chưa bán sản phẩm nào"
                      : "Chưa có sản phẩm bị ẩn"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Reason Modal */}
      {showHiddenReasonModal && selectedHiddenProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                ⚠️ Sản phẩm bị ẩn
              </h2>
              <button
                onClick={() => setShowHiddenReasonModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                <strong>Sản phẩm:</strong> {selectedHiddenProduct.name}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "15px",
                }}
              >
                <strong>Giá:</strong> {formater(selectedHiddenProduct.price)}
              </p>
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: "4px",
                  padding: "15px",
                  marginBottom: "15px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "12px",
                    color: "#856404",
                    fontWeight: "600",
                  }}
                >
                  LÝ DO CẢNH BÁO:
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#d0021b",
                    fontWeight: "500",
                  }}
                >
                  {translateHiddenReason(selectedHiddenProduct.hiddenReason)}
                </p>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#999",
                  marginBottom: 0,
                }}
              >
                Sản phẩm của bạn đã bị ẩn do vi phạm chính sách của nền tảng.
                Vui lòng kiểm tra lại thông tin sản phẩm.
              </p>
            </div>

            <button
              onClick={() => setShowHiddenReasonModal(false)}
              style={{
                width: "100%",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
