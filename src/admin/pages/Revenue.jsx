import React, { useEffect, useRef } from "react";

// Simple revenue chart using Chart.js if available. If Chart.js isn't installed,
// this component will render a plain table as fallback.

const Revenue = () => {
  const canvasRef = useRef(null);

  // Mock data: date -> revenue (computed from lượt đẩy tin)
  const data = [
    { label: "2025-11-10", rev: 120000 },
    { label: "2025-11-11", rev: 240000 },
    { label: "2025-11-12", rev: 180000 },
    { label: "2025-11-13", rev: 300000 },
    { label: "2025-11-14", rev: 420000 },
  ];

  useEffect(() => {
    let ChartModule;
    try {
      // dynamic require to avoid bundler error if Chart.js missing
      // eslint-disable-next-line global-require
      ChartModule = require("chart.js/auto");
    } catch (e) {
      console.warn("Chart.js not found — showing tabular fallback.");
      return;
    }

    // Some bundlers return the constructor as default; handle both cases
    const ChartConstructor =
      (ChartModule && ChartModule.default) || ChartModule;
    if (!ChartConstructor || typeof ChartConstructor !== "function") {
      console.warn(
        "Chart.js import did not return a constructor. Falling back to table."
      );
      return;
    }

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const chart = new ChartConstructor(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Doanh thu (VNĐ)",
            data: data.map((d) => d.rev),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.2)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <div>
      <div className="content-header">
        <h1>Doanh thu</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ maxWidth: 800 }}>
          <canvas ref={canvasRef} />
        </div>
        <div style={{ marginTop: 12 }}>
          <h4>Bảng doanh thu (mẫu)</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>{d.rev.toLocaleString("vi-VN")} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
