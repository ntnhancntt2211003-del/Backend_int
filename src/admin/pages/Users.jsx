import React from "react";

const mockUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "a@example.com" },
  { id: 2, name: "Trần Thị B", email: "b@example.com" },
];

const Users = () => {
  return (
    <div>
      <div className="content-header">
        <h1>Quản lý người dùng</h1>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
