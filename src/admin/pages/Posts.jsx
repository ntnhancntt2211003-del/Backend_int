import React, { useState } from "react";
import { FaTrash, FaCheck, FaEye } from "react-icons/fa";

const initialPosts = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    title: "Bán giày Nike Air",
    type: "image",
    media: ["/images/hero/sp1.jpg"],
    reports: 2,
    status: "pending",
  },
  {
    id: 2,
    user: "Trần Thị B",
    title: "Cho thuê địa điểm sự kiện",
    type: "video",
    media: ["/videos/sample.mp4"],
    reports: 0,
    status: "approved",
  },
];

const Posts = () => {
  const [posts, setPosts] = useState(initialPosts);

  const approve = (id) => {
    setPosts((p) =>
      p.map((x) => (x.id === id ? { ...x, status: "approved" } : x))
    );
    // TODO: call backend API to approve
  };

  const remove = (id) => {
    // use window.confirm to avoid ESLint `no-restricted-globals` rule
    if (!window.confirm("Xóa bài đăng này?")) return;
    setPosts((p) => p.filter((x) => x.id !== id));
    // TODO: call backend API to delete
  };

  const viewReports = (id) => {
    const post = posts.find((p) => p.id === id);
    alert(`Báo cáo cho bài ${post.title}: ${post.reports} lượt`);
    // Could open a modal showing detailed reports
  };

  return (
    <div>
      <div className="content-header">
        <h1>Quản lý bài đăng</h1>
        <div />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người đăng</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Báo cáo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.user}</td>
                <td>{p.title}</td>
                <td>{p.type}</td>
                <td>
                  {p.reports}{" "}
                  <button onClick={() => viewReports(p.id)} title="Xem báo cáo">
                    <FaEye />
                  </button>
                </td>
                <td>{p.status}</td>
                <td className="actions">
                  {p.status !== "approved" && (
                    <button onClick={() => approve(p.id)} title="Duyệt">
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => remove(p.id)}
                    className="danger"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Posts;
