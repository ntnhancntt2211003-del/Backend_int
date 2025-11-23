import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.scss";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactionInfo, setTransactionInfo] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [quickFormData, setQuickFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const orderId = urlParams.get("orderId");
        const resultCode = urlParams.get("resultCode");
        const transId = urlParams.get("transId");
        const amount = urlParams.get("amount");

        if (!orderId) {
          setError("Không tìm thấy thông tin giao dịch");
          setLoading(false);
          return;
        }

        // Set transaction info from URL
        setTransactionInfo({
          orderId,
          transId,
          amount: parseInt(amount),
          resultCode: parseInt(resultCode),
          status: resultCode === "0" ? "success" : "failed",
          timestamp: new Date().toLocaleString("vi-VN"),
        });

        if (resultCode === "0") {
          // Payment successful - create product
          const savedData = localStorage.getItem("pendingPostAd");

          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              console.log("Found localStorage data:", parsedData);
              console.log("Looking for orderId:", orderId);

              if (parsedData && parsedData.orderId === orderId) {
                await createProductAfterPayment(orderId, parsedData);
              } else {
                console.warn("OrderId mismatch:", {
                  expected: orderId,
                  found: parsedData?.orderId,
                });
                // Still try to create with available data if it exists
                if (parsedData && parsedData.formData) {
                  console.log(
                    "Using available form data despite orderId mismatch"
                  );
                  await createProductAfterPayment(orderId, parsedData);
                } else {
                  setError(
                    "Thanh toán thành công nhưng không tìm thấy thông tin sản phẩm. Vui lòng đăng tin lại."
                  );
                }
              }
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
              setError("Dữ liệu đăng tin bị lỗi. Vui lòng đăng tin lại.");
            }
          } else {
            console.warn("No localStorage data found");
            // Instead of showing error, show quick create form
            setShowCreateForm(true);
          }
        } else {
          console.log("Payment failed with resultCode:", resultCode);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error processing payment result:", error);
        setError("Có lỗi xảy ra khi xử lý kết quả thanh toán");
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [location.search]);

  const handleQuickFormChange = (e) => {
    const { name, value } = e.target;
    setQuickFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();

    if (
      !quickFormData.title ||
      !quickFormData.description ||
      !quickFormData.price ||
      !quickFormData.category
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const orderId = transactionInfo?.orderId;

      const formData = {
        title: quickFormData.title,
        description: quickFormData.description,
        price: quickFormData.price,
        category: quickFormData.category,
        condition: "new",
        location: quickFormData.location || "",
        contactName: "",
        contactPhone: "",
        coverImage: null,
        images: [],
      };

      const savedData = { formData, orderId };
      await createProductAfterPayment(orderId, savedData);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error in quick submit:", error);
      setError("Có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const createProductAfterPayment = async (orderId, savedData) => {
    try {
      const { formData } = savedData;

      // Create product
      console.log("Creating product after payment...");
      const productData = {
        name: formData.title, // API expects 'name' not 'title'
        description: formData.description,
        price: parseInt(formData.price, 10),
        category: formData.category,
        address: formData.location || "", // API expects 'address' not 'location'
        condition: formData.condition || "new",
        contactName: formData.contactName || "",
        contactPhone: formData.contactPhone || "",
      };

      console.log("Sending product data:", productData);

      const productResponse = await axios.post(
        "http://localhost:8080/api/products",
        productData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Product creation response:", productResponse.data);

      // Handle both possible response formats
      let productId;
      if (productResponse.data.product && productResponse.data.product._id) {
        productId = productResponse.data.product._id;
      } else if (productResponse.data.productId) {
        productId = productResponse.data.productId;
      } else {
        console.error("Unexpected response format:", productResponse.data);
        throw new Error("Không nhận được ID sản phẩm từ server");
      }

      setProductInfo({
        id: productId,
        title: formData.title,
        price: formData.price,
      });

      // Upload images if any
      if (
        formData.coverImage ||
        (formData.images && formData.images.length > 0)
      ) {
        console.log("Uploading images...");
        const imageData = new FormData();

        if (formData.coverImage) {
          imageData.append("coverImage", formData.coverImage);
        }

        if (formData.images && formData.images.length > 0) {
          formData.images.forEach((image) => {
            imageData.append("additionalImages", image);
          });
        }

        try {
          await axios.post(
            `http://localhost:8080/api/images/${productId}/upload`,
            imageData,
            {
              timeout: 30000,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Images uploaded successfully");
        } catch (imageError) {
          console.warn("Image upload failed but product created:", imageError);
          // Don't throw error for image upload failure - product is already created
        }
      }

      // Link product to payment
      try {
        await axios.post("http://localhost:8080/api/payment/link-product", {
          orderId,
          productId,
        });
        console.log("Product linked to payment successfully");
      } catch (linkError) {
        console.warn("Failed to link product to payment:", linkError);
        // Don't throw error for linking failure - product is already created
      }

      // Clear temporary data
      localStorage.removeItem("pendingPostAd");

      console.log("Product created successfully:", productId);
    } catch (error) {
      console.error("Detailed error creating product after payment:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        setError(
          `Lỗi tạo tin đăng: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        setError(`Lỗi tạo tin đăng: ${error.message}`);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewProduct = () => {
    if (productInfo?.id) {
      navigate(`/products/chi-tiet/${productInfo.id}`);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <h2>Đang xử lý kết quả thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-page">
        <div className="container">
          <div className="error-section">
            <div className="error-icon">❌</div>
            <h2>Có lỗi xảy ra</h2>
            <p>{error}</p>
            <div className="action-buttons">
              <button className="btn-home" onClick={handleBackToHome}>
                Quay về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <div className="container">
        <div className="success-content">
          {transactionInfo?.status === "success" ? (
            <>
              {/* Success Header */}
              <div className="success-header">
                <div className="success-icon">✅</div>
                <h1>Cảm ơn quý khách!</h1>
                <p>Thanh toán thành công và tin đăng đã được tạo</p>
              </div>

              {/* Transaction Info */}
              <div className="transaction-info">
                <h3>Thông tin giao dịch</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mã đơn hàng:</label>
                    <span>{transactionInfo.orderId}</span>
                  </div>
                  <div className="info-item">
                    <label>Mã giao dịch MoMo:</label>
                    <span>{transactionInfo.transId}</span>
                  </div>
                  <div className="info-item">
                    <label>Số tiền:</label>
                    <span className="amount">
                      {formatCurrency(transactionInfo.amount)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Thời gian:</label>
                    <span>{transactionInfo.timestamp}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span className="status success">Thành công</span>
                  </div>
                </div>
              </div>

              {/* Quick Create Form - show when no localStorage data */}
              {showCreateForm && (
                <div className="quick-create-form">
                  <h3>Tạo tin đăng nhanh</h3>
                  <p>Vui lòng nhập thông tin sản phẩm để hoàn tất đăng tin:</p>

                  <form onSubmit={handleQuickSubmit}>
                    <div className="form-group">
                      <label>Tiêu đề sản phẩm *</label>
                      <input
                        type="text"
                        name="title"
                        value={quickFormData.title}
                        onChange={handleQuickFormChange}
                        placeholder="Nhập tiêu đề sản phẩm"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Danh mục *</label>
                        <select
                          name="category"
                          value={quickFormData.category}
                          onChange={handleQuickFormChange}
                          required
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Giá bán (VNĐ) *</label>
                        <input
                          type="number"
                          name="price"
                          value={quickFormData.price}
                          onChange={handleQuickFormChange}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Mô tả *</label>
                      <textarea
                        name="description"
                        value={quickFormData.description}
                        onChange={handleQuickFormChange}
                        placeholder="Mô tả chi tiết sản phẩm"
                        rows="4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="location"
                        value={quickFormData.location}
                        onChange={handleQuickFormChange}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    <div className="form-buttons">
                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                      >
                        {loading ? "Đang tạo..." : "Tạo tin đăng"}
                      </button>
                      <button
                        type="button"
                        className="btn-skip"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Bỏ qua
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Product Info */}
              {productInfo ? (
                <div className="product-info">
                  <h3>Tin đăng đã được tạo</h3>
                  <div className="product-summary">
                    <h4>{productInfo.title}</h4>
                    <p className="product-price">
                      {formatCurrency(productInfo.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="product-info">
                  <h3>Đang xử lý tin đăng</h3>
                  <div className="product-summary">
                    <p>
                      Tin đăng của bạn đang được xử lý. Nếu không thấy tin đăng
                      sau vài phút, vui lòng liên hệ hỗ trợ hoặc tạo tin đăng
                      mới.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                {productInfo ? (
                  <button
                    className="btn-view-product"
                    onClick={handleViewProduct}
                  >
                    <i className="fas fa-eye"></i>
                    Xem sản phẩm đã đăng
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-retry"
                      onClick={() => navigate("/post-ad")}
                    >
                      <i className="fas fa-plus"></i>
                      Đăng tin mới
                    </button>
                    <button
                      className="btn-view-product"
                      onClick={() => navigate("/products")}
                    >
                      <i className="fas fa-list"></i>
                      Xem tất cả sản phẩm
                    </button>
                  </>
                )}
                <button className="btn-home" onClick={handleBackToHome}>
                  <i className="fas fa-home"></i>
                  Quay về trang chủ
                </button>
              </div>
            </>
          ) : (
            /* Payment Failed */
            <div className="failed-section">
              <div className="failed-icon">❌</div>
              <h2>Thanh toán không thành công</h2>
              <p>Giao dịch của bạn đã bị hủy hoặc không thể hoàn thành</p>

              <div className="transaction-info">
                <h3>Thông tin giao dịch</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Mã đơn hàng:</label>
                    <span>{transactionInfo.orderId}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span className="status failed">Thất bại</span>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-retry"
                  onClick={() => navigate("/post-ad")}
                >
                  <i className="fas fa-redo"></i>
                  Thử lại
                </button>
                <button className="btn-home" onClick={handleBackToHome}>
                  <i className="fas fa-home"></i>
                  Quay về trang chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
