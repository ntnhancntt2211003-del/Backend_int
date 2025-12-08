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
  LineChart,
  Line,
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
  const [activeTab, setActiveTab] = useState("summary"); // summary, postings, ads, timeline

  // Date filter states
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timelineData, setTimelineData] = useState([]);
  const [filteredPostingDetails, setFilteredPostingDetails] = useState([]);
  const [filteredAdsDetails, setFilteredAdsDetails] = useState([]);

  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return date.toISOString().split("T")[0];
  }

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
          setPostingCount(totalData.postingFee.totalTransactions);
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

  // Filter data by date range
  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter posting details - use feePaidAt instead of paidAt
    const filtered1 = postingDetails.filter((item) => {
      const date = new Date(item.feePaidAt || item.paidAt);
      return date >= start && date <= end;
    });
    setFilteredPostingDetails(filtered1);

    // Filter ads details
    const filtered2 = adsDetails.filter((item) => {
      const date = new Date(item.createdAt);
      return date >= start && date <= end;
    });
    setFilteredAdsDetails(filtered2);

    // Generate timeline data
    generateTimelineData(filtered1, filtered2, start, end);
  }, [startDate, endDate, postingDetails, adsDetails]);

  const generateTimelineData = (postings, ads, start, end) => {
    const timeline = {};

    // Initialize all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0];
      timeline[dateKey] = { date: dateKey, posting: 0, ads: 0, total: 0 };
    }

    // Add posting revenue - use feePaidAt and fee
    postings.forEach((item) => {
      const dateKey = new Date(item.feePaidAt || item.paidAt)
        .toISOString()
        .split("T")[0];
      if (timeline[dateKey]) {
        timeline[dateKey].posting += item.fee || item.amount || 0;
      }
    });

    // Add ads revenue
    ads.forEach((item) => {
      const dateKey = new Date(item.createdAt).toISOString().split("T")[0];
      if (timeline[dateKey]) {
        timeline[dateKey].ads += item.price || 0;
      }
    });

    // Calculate total and format
    const data = Object.values(timeline).map((item) => ({
      ...item,
      total: item.posting + item.ads,
      date: new Date(item.date).toLocaleDateString("vi-VN"),
    }));

    setTimelineData(data);
  };

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

      {/* Date Range Filter */}
      <div className="date-filter-section">
        <div className="date-inputs">
          <div className="date-group">
            <label htmlFor="startDate">Từ ngày:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-group">
            <label htmlFor="endDate">Đến ngày:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="quick-filters">
            <button
              onClick={() => {
                const today = new Date();
                setStartDate(today.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="filter-btn"
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="filter-btn"
            >
              7 ngày
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="filter-btn"
            >
              30 ngày
            </button>
          </div>
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
            <small>{postingCount} giao dịch</small>
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
            className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            📈 Doanh Thu Theo Thời Gian
          </button>
          <button
            className={`tab-btn ${activeTab === "postings" ? "active" : ""}`}
            onClick={() => setActiveTab("postings")}
          >
            📝 Chi Tiết Đăng Tin ({filteredPostingDetails.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "ads" ? "active" : ""}`}
            onClick={() => setActiveTab("ads")}
          >
            📺 Chi Tiết Quảng Cáo ({filteredAdsDetails.length})
          </button>
        </div>

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <>
            <h3>
              Doanh Thu Theo Ngày ({startDate} - {endDate})
            </h3>
            {timelineData.length > 0 ? (
              <>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#999"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
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
                      <Line
                        type="monotone"
                        dataKey="posting"
                        stroke="#667eea"
                        name="Phí Đăng Tin"
                        strokeWidth={2}
                        dot={{ fill: "#667eea" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ads"
                        stroke="#f093fb"
                        name="Quảng Cáo"
                        strokeWidth={2}
                        dot={{ fill: "#f093fb" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#4caf50"
                        name="Tổng"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#4caf50" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="timeline-table-wrapper">
                  <table className="revenue-table">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Phí Đăng Tin</th>
                        <th>Quảng Cáo</th>
                        <th>Tổng Cộng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineData.map((item, idx) => (
                        <tr key={idx}>
                          <td className="date-cell">{item.date}</td>
                          <td className="amount">
                            {formatCurrency(item.posting)}
                          </td>
                          <td className="amount">{formatCurrency(item.ads)}</td>
                          <td className="amount highlight">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td>
                          <strong>Tổng Cộng</strong>
                        </td>
                        <td className="amount">
                          <strong>
                            {formatCurrency(
                              filteredPostingDetails.reduce(
                                (sum, item) =>
                                  sum + (item.fee || item.amount || 0),
                                0
                              )
                            )}
                          </strong>
                        </td>
                        <td className="amount">
                          <strong>
                            {formatCurrency(
                              filteredAdsDetails.reduce(
                                (sum, item) => sum + (item.price || 0),
                                0
                              )
                            )}
                          </strong>
                        </td>
                        <td className="amount highlight">
                          <strong>
                            {formatCurrency(
                              filteredPostingDetails.reduce(
                                (sum, item) =>
                                  sum + (item.fee || item.amount || 0),
                                0
                              ) +
                                filteredAdsDetails.reduce(
                                  (sum, item) => sum + (item.price || 0),
                                  0
                                )
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="no-data">
                Không có dữ liệu doanh thu trong khoảng thời gian này
              </div>
            )}
          </>
        )}

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
            <h3>
              Chi Tiết Doanh Thu Đăng Tin ({startDate} - {endDate})
            </h3>
            {filteredPostingDetails.length > 0 ? (
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
                  {filteredPostingDetails.map((detail, idx) => (
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
                        {formatCurrency(detail.fee || detail.amount)}
                      </td>
                      <td className="date">
                        {new Date(
                          detail.feePaidAt || detail.paidAt
                        ).toLocaleDateString("vi-VN")}
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
            <h3>
              Chi Tiết Doanh Thu Quảng Cáo ({startDate} - {endDate})
            </h3>
            {filteredAdsDetails.length > 0 ? (
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
                  {filteredAdsDetails.map((detail, idx) => (
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
