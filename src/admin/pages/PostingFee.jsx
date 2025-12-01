// src/admin/pages/PostingFee.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const PostingFee = () => {
  const { token } = useAuth();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });

  // Product pricing state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productPricingData, setProductPricingData] = useState({});
  const [savingProduct, setSavingProduct] = useState(null);
  const [searchProduct, setSearchProduct] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch current posting fee
  const fetchFee = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/posting-fee");
      if (response.data.success) {
        setFee(response.data.data);
        setFormData({
          amount: response.data.data.amount.toString(),
          description: response.data.data.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching fee:", error);
      alert("Lỗi khi tải thông tin phí đăng tin");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get("http://localhost:8080/api/products");
      const productsList = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchFee();
    fetchProducts();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle product pricing change
  const handleProductPricingChange = (productId, amount) => {
    setProductPricingData((prev) => ({
      ...prev,
      [productId]: amount,
    }));
  };

  // Save product pricing
  const handleSaveProductPricing = async (productId) => {
    const amount = productPricingData[productId];
    if (!amount || amount < 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!token) {
      alert("Token không tồn tại. Vui lòng đăng nhập lại!");
      return;
    }

    setSavingProduct(productId);
    try {
      console.log("Sending token:", token); // Debug
      const response = await axios.patch(
        `http://localhost:8080/api/products/${productId}`,
        {
          postingFee: parseInt(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success || response.data.message) {
        alert("Cập nhật giá đăng thành công!");
        setEditingProductId(null);
        // Update local product
        const updatedProducts = products.map((p) =>
          p._id === productId ? { ...p, postingFee: parseInt(amount) } : p
        );
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error("Error updating product pricing:", error);
      alert(
        "Lỗi khi cập nhật giá: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSavingProduct(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.amount || formData.amount < 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!token) {
      alert("Token không tồn tại. Vui lòng đăng nhập lại!");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        "http://localhost:8080/api/posting-fee",
        {
          amount: parseInt(formData.amount),
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFee(response.data.data);
        setEditing(false);
        alert("Cập nhật phí đăng tin thành công!");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      alert(
        "Lỗi khi cập nhật phí: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({
      amount: fee.amount.toString(),
      description: fee.description || "",
    });
    setEditing(false);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="posting-fee-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="posting-fee-page">
      <div className="page-header">
        <h1>Quản lý phí đăng tin</h1>
        <p>Cài đặt giá phí đăng tin cho tất cả sản phẩm</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Thông tin phí đăng tin</h3>
          {!editing && (
            <button className="btn-edit" onClick={() => setEditing(true)}>
              ✏️ Chỉnh sửa
            </button>
          )}
        </div>

        <div className="card-body">
          {!editing ? (
            // View mode
            <div className="fee-display">
              <div className="fee-item">
                <label>Tên phí:</label>
                <span>{fee?.name || "Phí đăng tin"}</span>
              </div>

              <div className="fee-item">
                <label>Giá hiện tại:</label>
                <span className="fee-amount">
                  {formatPrice(fee?.amount || 0)}
                </span>
              </div>

              <div className="fee-item">
                <label>Mô tả:</label>
                <span>{fee?.description || "Không có mô tả"}</span>
              </div>

              <div className="fee-item">
                <label>Cập nhật lần cuối:</label>
                <span>{new Date(fee?.updatedAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          ) : (
            // Edit mode
            <div className="fee-form">
              <div className="form-group">
                <label htmlFor="amount">Giá phí (VNĐ) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="form-control"
                  placeholder="Nhập giá phí..."
                />
                <small>Giá phí này sẽ áp dụng cho tất cả tin đăng mới</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Mô tả về phí đăng tin..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview section */}
      <div className="card">
        <div className="card-header">
          <h3>Xem trước</h3>
        </div>
        <div className="card-body">
          <div className="preview-notice">
            <div className="notice-icon">💰</div>
            <div className="notice-content">
              <h4>Phí đăng tin</h4>
              <p>
                Để đăng tin, bạn cần thanh toán phí:{" "}
                <strong>
                  {formatPrice(parseInt(formData.amount) || fee?.amount || 0)}
                </strong>
              </p>
              <p className="notice-description">
                {formData.description ||
                  fee?.description ||
                  "Phí đăng tin sản phẩm"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Pricing Management Section */}
      <div className="card">
        <div className="card-header">
          <h3>Quản lý giá đăng theo sản phẩm</h3>
          <p style={{ margin: "10px 0 0 0", fontSize: "13px", color: "#666" }}>
            Cài đặt giá đăng riêng cho từng sản phẩm (nếu không cài đặt sẽ dùng
            giá mặc định ở trên)
          </p>
        </div>

        <div className="card-body">
          {/* Filters */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minWidth: "150px",
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="sold">Đã bán</option>
            </select>
          </div>

          {/* Products Table */}
          {loadingProducts ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Đang tải danh sách sản phẩm...
            </div>
          ) : products.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              Không có sản phẩm nào
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "15px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #ddd",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <th style={{ padding: "12px", textAlign: "left" }}>STT</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Tên sản phẩm
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Giá bán
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Giá đăng hiện tại
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => {
                    const matchSearch = p.name
                      .toLowerCase()
                      .includes(searchProduct.toLowerCase());
                    const matchStatus =
                      filterStatus === "all" || p.status === filterStatus;
                    return matchSearch && matchStatus;
                  })
                  .map((product, index) => (
                    <tr
                      key={product._id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px" }}>{index + 1}</td>
                      <td style={{ padding: "12px" }}>
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small style={{ color: "#999" }}>
                            ID: {product._id.substring(0, 8)}...
                          </small>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {formatPrice(product.price)}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {editingProductId === product._id ? (
                          <input
                            type="number"
                            value={
                              productPricingData[product._id] !== undefined
                                ? productPricingData[product._id]
                                : product.postingFee || fee?.amount || ""
                            }
                            onChange={(e) =>
                              handleProductPricingChange(
                                product._id,
                                e.target.value
                              )
                            }
                            min="0"
                            step="1000"
                            style={{
                              width: "100%",
                              padding: "6px",
                              border: "1px solid #3639f5",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          formatPrice(product.postingFee || fee?.amount || 0)
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              product.status === "active"
                                ? "#e8f5e9"
                                : "#ffebee",
                            color:
                              product.status === "active"
                                ? "#2e7d32"
                                : "#c62828",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {product.status === "active"
                            ? "✓ Hoạt động"
                            : "✗ Đã bán"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostingFee;
