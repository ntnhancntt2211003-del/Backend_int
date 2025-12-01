import React, { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaEye, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Posts = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/reports?status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert(
        "Lỗi khi tải báo cáo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId, newStatus) => {
    // Nếu status là "resolved", hiển thị confirmation
    if (newStatus === "resolved") {
      setConfirmModal({ reportId, newStatus });
      return;
    }

    // Nếu không, update bình thường
    await performStatusUpdate(reportId, newStatus);
  };

  const performStatusUpdate = async (reportId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/reports/${reportId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Cập nhật trạng thái báo cáo thành công!");
      setConfirmModal(null);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating report:", error);
      alert(
        "Lỗi khi cập nhật: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const reasonMap = {
    fake_product: "Sản phẩm giả mạo",
    scam: "Lừa đảo/Mạo danh",
    inappropriate_content: "Nội dung không phù hợp",
    spam: "Spam/Quảng cáo lộn xộn",
    illegal_item: "Sản phẩm bị cấm",
    offensive_language: "Ngôn từ xúc phạm",
    other: "Khác",
  };

  const statusMap = {
    pending: "Chờ xử lý",
    reviewing: "Đang xem xét",
    resolved: "Đã giải quyết",
    dismissed: "Từ chối",
  };

  return (
    <div>
      <div className="content-header">
        <h1>Quản lý báo cáo bài đăng</h1>
        <div />
      </div>

      <div className="card">
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="pending">Chờ xử lý</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="dismissed">Từ chối</option>
            <option value="">Tất cả</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Đang tải...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            Không có báo cáo nào
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Người báo cáo</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ngày báo cáo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div>
                      <strong>{report.productId?.name || "N/A"}</strong>
                      <br />
                      <small style={{ color: "#999" }}>
                        ID: {report.productId?._id?.substring(0, 8)}...
                      </small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{report.userId?.username || "N/A"}</strong>
                      <br />
                      <small style={{ color: "#999" }}>
                        {report.userId?.email || ""}
                      </small>
                    </div>
                  </td>
                  <td>{reasonMap[report.reason] || report.reason}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          report.status === "pending"
                            ? "#fff3cd"
                            : report.status === "reviewing"
                            ? "#cfe2ff"
                            : report.status === "resolved"
                            ? "#d1e7dd"
                            : "#f8d7da",
                        color:
                          report.status === "pending"
                            ? "#997404"
                            : report.status === "reviewing"
                            ? "#084298"
                            : report.status === "resolved"
                            ? "#0f5132"
                            : "#842029",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {statusMap[report.status] || report.status}
                    </span>
                  </td>
                  <td>
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => setSelectedReport(report)}
                      title="Xem chi tiết"
                      style={{
                        padding: "6px 10px",
                        marginRight: "5px",
                        backgroundColor: "#3639f5",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <FaEye /> Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal chi tiết báo cáo */}
      {selectedReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0 }}>Chi tiết báo cáo</h2>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Sản phẩm:
              </label>
              <p style={{ margin: "0 0 8px 0" }}>
                {selectedReport.productId?.name || "N/A"}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Người báo cáo:
              </label>
              <p style={{ margin: 0 }}>
                {selectedReport.userId?.username || "N/A"} (
                {selectedReport.userId?.email})
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Lý do:
              </label>
              <p style={{ margin: 0 }}>
                {reasonMap[selectedReport.reason] || selectedReport.reason}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Mô tả:
              </label>
              <p
                style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.6" }}
              >
                {selectedReport.description}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Ngày báo cáo:
              </label>
              <p style={{ margin: 0 }}>
                {new Date(selectedReport.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Cập nhật trạng thái:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["pending", "reviewing", "resolved", "dismissed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateReportStatus(selectedReport._id, status)
                      }
                      style={{
                        padding: "8px 16px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        backgroundColor:
                          selectedReport.status === status
                            ? "#3639f5"
                            : "white",
                        color:
                          selectedReport.status === status ? "white" : "#333",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {statusMap[status]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
              ⚠️ Xác nhận ẩn sản phẩm
            </h3>
            <p
              style={{ margin: "0 0 20px 0", color: "#666", lineHeight: "1.6" }}
            >
              Bạn có chắc chắn muốn ẩn sản phẩm này? Sản phẩm sẽ không hiển thị
              trên trang chính và chỉ người bán có thể xem trong phần "Đã ẩn".
            </p>
            <p
              style={{ margin: "0 0 20px 0", color: "#999", fontSize: "14px" }}
            >
              Sản phẩm: <strong>{selectedReport?.productId?.name}</strong>
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  performStatusUpdate(confirmModal.reportId, "resolved")
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#d0021b",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Ẩn sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
