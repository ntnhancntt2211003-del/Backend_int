import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/get-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const usersList = response.data?.data || response.data || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Lỗi tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      !searchTerm ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.numberPhone?.includes(searchTerm);

    const matchRole =
      filterRole === "all" ||
      (filterRole === "admin" && user.role === "admin") ||
      (filterRole === "user" && user.role !== "admin");

    return matchSearch && matchRole;
  });

  return (
    <div className="users-page">
      <div className="content-header">
        <h1>Quản lý tài khoản người dùng</h1>
        <p>Tổng số tài khoản: {users.length}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="card">
        {/* Filters */}
        <div className="users-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={fetchUsers} className="btn-refresh">
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-spinner">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>
              {searchTerm || filterRole !== "all"
                ? "Không tìm thấy tài khoản phù hợp"
                : "Chưa có tài khoản nào"}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Tên tài khoản</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="user-row">
                    <td className="user-name">
                      <div className="avatar-info">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="user-avatar"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/40?text=" +
                                user.username.charAt(0);
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="username">{user.username}</span>
                      </div>
                    </td>
                    <td className="user-email">{user.email || "N/A"}</td>
                    <td className="user-phone">{user.numberPhone || "N/A"}</td>
                    <td className="user-role">
                      <span
                        className={`role-badge role-${
                          user.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "Người dùng"}
                      </span>
                    </td>
                    <td className="user-created">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                    <td className="user-status">
                      <span className="status-badge status-active">
                        <i className="fas fa-check-circle"></i> Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {filteredUsers.length > 0 && (
          <div className="users-stats">
            <div className="stat-item">
              <label>Tổng kết quả tìm kiếm:</label>
              <span>{filteredUsers.length}</span>
            </div>
            <div className="stat-item">
              <label>Admin:</label>
              <span>
                {filteredUsers.filter((u) => u.role === "admin").length}
              </span>
            </div>
            <div className="stat-item">
              <label>Người dùng:</label>
              <span>
                {filteredUsers.filter((u) => u.role !== "admin").length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
