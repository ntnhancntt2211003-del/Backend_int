import React from "react";

const mockOrders = [
  { id: 1001, total: "1.200.000 đ", status: "processing" },
  { id: 1002, total: "2.500.000 đ", status: "shipped" },
];

const Orders = () => {
  return (
    <div>
      <div className="content-header">
        <h1>Đơn hàng</h1>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.total}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
