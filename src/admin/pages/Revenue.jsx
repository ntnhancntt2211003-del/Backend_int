import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import "./Revenue.css";

const Revenue = () => {
  const { token } = useAuth();
  const [revenueData, setRevenueData] = useState([]);
  const [postingFeeRevenue, setPostingFeeRevenue] = useState(0);
  const [adsRevenue, setAdsRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [postingCount, setPostingCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);
  const [postingDetails, setPostingDetails] = useState([]);
  const [adsDetails, setAdsDetails] = useState([]);
  const [activeTab, setActiveTab] = useState("summary"); // summary, postings, ads

  // Fetch revenue data from backend
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);

        // Fetch total revenue (posting + ads)
        const totalRes = await axios.get(
          "http://localhost:8080/api/dashboard/revenue",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const totalData = totalRes.data?.data;
        if (totalData) {
          setPostingFeeRevenue(totalData.postingFee.revenue);
          setAdsRevenue(totalData.ads.revenue);
          setTotalRevenue(totalData.total);
          setPostingCount(totalData.postingFee.totalProducts);
          setAdsCount(totalData.ads.totalAds);
        }

        // Fetch detailed breakdown
        const breakdownRes = await axios.get(
          "http://localhost:8080/api/dashboard/revenue/breakdown",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (breakdownRes.data?.data) {
          setBreakdown(breakdownRes.data.data);
        }

        // Format data for charts (pie chart data)
        const chartData = [
          {
            name: "Phí Đăng Tin",
            value: totalData.postingFee.revenue,
            icon: "📝",
          },
          {
            name: "Quảng Cáo",
            value: totalData.ads.revenue,
            icon: "📺",
          },
        ];
        setRevenueData(chartData);

        // Fetch posting revenue details
        const postingDetailsRes = await axios.get(
          "http://localhost:8080/api/dashboard/revenue/postings/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (postingDetailsRes.data?.data) {
          setPostingDetails(postingDetailsRes.data.data);
        }

        // Fetch ads revenue details
        const adsDetailsRes = await axios.get(
          "http://localhost:8080/api/dashboard/revenue/ads/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (adsDetailsRes.data?.data) {
          setAdsDetails(adsDetailsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRevenueData();
    }
  }, [token]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="revenue-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="revenue-container">
      <div className="revenue-header">
        <div className="header-content">
          <h1>📊 Doanh Thu (Đăng Tin + Quảng Cáo)</h1>
          <p>Theo dõi doanh thu từ phí đăng tin và quảng cáo</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Tổng Doanh Thu</h3>
            <p className="stat-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Phí Đăng Tin</h3>
            <p className="stat-value">{formatCurrency(postingFeeRevenue)}</p>
            <small>{postingCount} sản phẩm</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📺</div>
          <div className="stat-content">
            <h3>Doanh Thu Quảng Cáo</h3>
            <p className="stat-value">{formatCurrency(adsRevenue)}</p>
            <small>{adsCount} quảng cáo</small>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label>Biểu Đồ Phân Tích Doanh Thu Theo Nguồn:</label>
        </div>
      </div>

      {/* Pie Chart for Revenue Distribution */}
      <div className="chart-container">
        {revenueData.length > 0 && totalRevenue > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#667eea"
                radius={[8, 8, 0, 0]}
                name="Doanh Thu"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">Chưa có dữ liệu doanh thu</div>
        )}
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            📊 Tóm Tắt
          </button>
          <button
            className={`tab-btn ${activeTab === "postings" ? "active" : ""}`}
            onClick={() => setActiveTab("postings")}
          >
            📝 Chi Tiết Đăng Tin ({postingDetails.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "ads" ? "active" : ""}`}
            onClick={() => setActiveTab("ads")}
          >
            📺 Chi Tiết Quảng Cáo ({adsDetails.length})
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <>
            <h3>Thống Kê Tóm Tắt</h3>
            {breakdown && (
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th>Loại Doanh Thu</th>
                    <th>Tổng Doanh Thu</th>
                    <th>Số Lượng</th>
                    <th>Tối Thiểu</th>
                    <th>Tối Đa</th>
                    <th>Trung Bình</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>📝 Phí Đăng Tin</strong>
                    </td>
                    <td className="amount">
                      {formatCurrency(breakdown.postingFee.revenue)}
                    </td>
                    <td>{breakdown.postingFee.count}</td>
                    <td>{formatCurrency(breakdown.postingFee.minFee)}</td>
                    <td>{formatCurrency(breakdown.postingFee.maxFee)}</td>
                    <td>{formatCurrency(breakdown.postingFee.avgFee)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>📺 Quảng Cáo</strong>
                    </td>
                    <td className="amount">
                      {formatCurrency(breakdown.ads.revenue)}
                    </td>
                    <td>{breakdown.ads.count}</td>
                    <td>{formatCurrency(breakdown.ads.minPrice)}</td>
                    <td>{formatCurrency(breakdown.ads.maxPrice)}</td>
                    <td>{formatCurrency(breakdown.ads.avgPrice)}</td>
                  </tr>
                  <tr className="total-row">
                    <td>
                      <strong>💰 Tổng Cộng</strong>
                    </td>
                    <td className="amount">
                      <strong>{formatCurrency(breakdown.totalRevenue)}</strong>
                    </td>
                    <td>
                      <strong>
                        {breakdown.postingFee.count + breakdown.ads.count}
                      </strong>
                    </td>
                    <td colSpan="3" className="text-center">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Postings Details Tab */}
        {activeTab === "postings" && (
          <>
            <h3>Chi Tiết Doanh Thu Đăng Tin</h3>
            {postingDetails.length > 0 ? (
              <table className="revenue-table details-table">
                <thead>
                  <tr>
                    <th>Người Bán</th>
                    <th>Email</th>
                    <th>Điện Thoại</th>
                    <th>Sản Phẩm</th>
                    <th>Giá Sản Phẩm</th>
                    <th>Phí Thanh Toán</th>
                    <th>Ngày Thanh Toán</th>
                  </tr>
                </thead>
                <tbody>
                  {postingDetails.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="seller-name">
                        {detail.ownerName || "N/A"}
                      </td>
                      <td className="text-small">
                        {detail.ownerEmail || "N/A"}
                      </td>
                      <td className="text-small">
                        {detail.ownerPhone || "N/A"}
                      </td>
                      <td className="product-name">{detail.productName}</td>
                      <td className="amount">
                        {formatCurrency(detail.productPrice)}
                      </td>
                      <td className="amount highlight">
                        {formatCurrency(detail.amount)}
                      </td>
                      <td className="date">
                        {new Date(detail.paidAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">Chưa có giao dịch đăng tin nào</div>
            )}
          </>
        )}

        {/* Ads Details Tab */}
        {activeTab === "ads" && (
          <>
            <h3>Chi Tiết Doanh Thu Quảng Cáo</h3>
            {adsDetails.length > 0 ? (
              <table className="revenue-table details-table">
                <thead>
                  <tr>
                    <th>Người Tạo</th>
                    <th>Email</th>
                    <th>Điện Thoại</th>
                    <th>Loại</th>
                    <th>Caption</th>
                    <th>Giá Quảng Cáo</th>
                    <th>Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {adsDetails.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="seller-name">
                        {detail.creatorName || "N/A"}
                      </td>
                      <td className="text-small">
                        {detail.creatorEmail || "N/A"}
                      </td>
                      <td className="text-small">
                        {detail.creatorPhone || "N/A"}
                      </td>
                      <td className="type-badge">
                        {detail.type === "image" ? "🖼️ Ảnh" : "🎥 Video"}
                      </td>
                      <td className="caption-text">
                        {detail.caption?.substring(0, 50) || "N/A"}
                        {detail.caption?.length > 50 ? "..." : ""}
                      </td>
                      <td className="amount highlight">
                        {formatCurrency(detail.price)}
                      </td>
                      <td className="date">
                        {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">Chưa có quảng cáo nào với giá</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Revenue;
