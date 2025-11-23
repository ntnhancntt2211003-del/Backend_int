// src/admin/pages/PostingFee.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const PostingFee = () => {
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });

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

  useEffect(() => {
    fetchFee();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.amount || formData.amount < 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        "http://localhost:8080/api/posting-fee",
        {
          amount: parseInt(formData.amount),
          description: formData.description,
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
    </div>
  );
};

export default PostingFee;
