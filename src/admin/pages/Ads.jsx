import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Ads.css";

const Ads = () => {
  const { token } = useAuth();
  const [type, setType] = useState("image");
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [imagePrice, setImagePrice] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [videoPrice, setVideoPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch ads from backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/ads/admin/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAds(response.data?.data || []);
      } catch (error) {
        console.error(
          "Error fetching ads:",
          error.response?.data || error.message
        );
      }
    };

    if (token) {
      fetchAds();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (type === "image" && imageFiles.length > 0) {
        // Upload multiple images
        for (let i = 0; i < imageFiles.length; i++) {
          const formData = new FormData();
          formData.append("type", "image");
          formData.append("image", imageFiles[i]);
          formData.append("caption", captions[i] || `Quảng cáo ${i + 1}`);
          formData.append("price", imagePrice || 0);

          await axios.post("http://localhost:8080/api/ads", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }
        setMessage("✅ Đăng tất cả quảng cáo ảnh thành công!");
        setImageFiles([]);
        setCaptions([]);
        setImagePrice("");
      } else if (type === "video" && videoFile) {
        const formData = new FormData();
        formData.append("type", "video");
        formData.append("video", videoFile);
        formData.append("caption", videoCaption);
        formData.append("price", videoPrice || 0);

        const response = await axios.post(
          "http://localhost:8080/api/ads",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data?.success) {
          setMessage("✅ Đăng quảng cáo video thành công!");
          setVideoFile(null);
          setVideoCaption("");
          setVideoPrice("");
        }
      } else {
        setMessage("❌ Vui lòng chọn tệp!");
        setLoading(false);
        return;
      }

      // Refresh ads list
      const adsResponse = await axios.get(
        "http://localhost:8080/api/ads/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAds(adsResponse.data?.data || []);
    } catch (error) {
      setMessage(
        "❌ " + (error.response?.data?.message || "Lỗi đăng quảng cáo")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa quảng cáo này?")) {
      try {
        await axios.delete(`http://localhost:8080/api/ads/${adId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAds(ads.filter((ad) => ad._id !== adId));
        setMessage("✅ Xóa quảng cáo thành công!");
      } catch (error) {
        setMessage("❌ Lỗi xóa quảng cáo");
      }
    }
  };

  return (
    <div className="ads-container">
      <div className="ads-header">
        <h1>📺 Quản Lý Quảng Cáo</h1>
        <p>Đăng quảng cáo hình ảnh hoặc video trên trang chủ</p>
      </div>

      {message && (
        <div
          className={`message ${message.includes("✅") ? "success" : "error"}`}
        >
          {message}
        </div>
      )}

      <div className="ads-content">
        {/* Form */}
        <div className="ads-form-card">
          <h2>Tạo Quảng Cáo Mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="type-selector">
              <label
                className={`type-option ${type === "image" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="image"
                  checked={type === "image"}
                  onChange={() => setType("image")}
                />
                <span>🖼️ Quảng Cáo Hình Ảnh</span>
              </label>
              <label
                className={`type-option ${type === "video" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="video"
                  checked={type === "video"}
                  onChange={() => setType("video")}
                />
                <span>🎬 Quảng Cáo Video (Hiển Thị Container Video)</span>
              </label>
            </div>

            {type === "image" && (
              <div className="form-group">
                <label>Tải Ảnh Quảng Cáo (Chọn nhiều ảnh cùng lúc)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    setImageFiles(Array.from(e.target.files || []));
                    setCaptions(Array(e.target.files?.length || 0).fill(""));
                  }}
                  className="file-input"
                />
                {imageFiles.length > 0 && (
                  <div className="file-list">
                    <p>📁 {imageFiles.length} ảnh được chọn:</p>
                    {imageFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span>{file.name}</span>
                        <textarea
                          placeholder={`Caption ảnh ${index + 1}...`}
                          value={captions[index] || ""}
                          onChange={(e) => {
                            const newCaptions = [...captions];
                            newCaptions[index] = e.target.value;
                            setCaptions(newCaptions);
                          }}
                          className="textarea-small"
                          rows="2"
                        />
                      </div>
                    ))}
                    <input
                      type="number"
                      placeholder="Giá tiền quảng cáo ảnh (VND)"
                      value={imagePrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) > 0) {
                          setImagePrice(value);
                        }
                      }}
                      className="price-input"
                      min="1"
                      onBlur={(e) => {
                        if (!e.target.value || Number(e.target.value) <= 0) {
                          setImagePrice("");
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {type === "video" && (
              <div className="form-group">
                <label>Tải Video Quảng Cáo</label>
                <p className="info-text">
                  💡 Video sẽ được hiển thị ở section "container__video" trên
                  trang chủ
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="file-input"
                />
                {videoFile && (
                  <div className="file-preview">🎥 {videoFile.name}</div>
                )}
                <textarea
                  placeholder="Caption cho video quảng cáo (tối đa 500 ký tự)..."
                  value={videoCaption}
                  onChange={(e) =>
                    setVideoCaption(e.target.value.slice(0, 500))
                  }
                  className="textarea"
                  rows="4"
                  maxLength="500"
                />
                <div className="char-count">
                  {videoCaption.length}/500 ký tự
                </div>
                <input
                  type="number"
                  placeholder="Giá tiền quảng cáo video (VND)"
                  value={videoPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || Number(value) > 0) {
                      setVideoPrice(value);
                    }
                  }}
                  className="price-input"
                  min="1"
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) <= 0) {
                      setVideoPrice("");
                    }
                  }}
                />
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "⏳ Đang tải..." : "✅ Đăng Quảng Cáo"}
            </button>
          </form>
        </div>

        {/* Ads List */}
        <div className="ads-list-card">
          <h2>Quảng Cáo Đã Đăng ({ads.length})</h2>
          {ads.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có quảng cáo nào</p>
            </div>
          ) : (
            <div className="ads-grid">
              {ads.map((ad) => (
                <div key={ad._id} className="ad-item">
                  <div className="ad-badge">
                    {ad.type === "image" ? "🖼️" : "🎥"}
                  </div>
                  {ad.type === "image" && ad.imageUrl && (
                    <img
                      src={`http://localhost:8080${ad.imageUrl}`}
                      alt="Ad"
                      className="ad-image"
                    />
                  )}
                  {ad.type === "video" && ad.videoUrl && (
                    <video width="100%" height="200" className="ad-video">
                      <source
                        src={`http://localhost:8080${ad.videoUrl}`}
                        type="video/mp4"
                      />
                    </video>
                  )}
                  <div className="ad-info">
                    <p className="ad-caption">
                      {ad.caption || "Không có caption"}
                    </p>
                    <p className="ad-price">
                      💰 {ad.price?.toLocaleString("vi-VN") || 0} VND
                    </p>
                    <small className="ad-date">
                      {new Date(ad.createdAt).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="btn-delete"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ads;
