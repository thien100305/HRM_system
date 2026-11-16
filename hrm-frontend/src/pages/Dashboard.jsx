import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardData, getSalaryStatistics } from "../services/dashboardService";

const today = () => new Intl.DateTimeFormat(
  "vi-VN",
  { dateStyle: "long" }
).format(new Date());

const compactMoney = (value) => new Intl.NumberFormat(
  "vi-VN",
  { notation: "compact", maximumFractionDigits: 1 }
).format(Number(value || 0)) + " ₫";

const fullMoney = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

function EmployeeDashboard() {
  const personalLinks = [
    ["◷", "Chấm công của tôi", "Xem lịch sử giờ vào, giờ ra", "/attendance", "#e5f8f3"],
    ["₫", "Bảng lương của tôi", "Xem chi tiết lương theo tháng", "/salaries", "#fff2dc"],
    ["☂", "Đơn nghỉ phép", "Tạo và theo dõi đơn nghỉ phép", "/leave-requests", "#ffe9ee"],
    ["✓", "Công việc của tôi", "Xem và cập nhật tiến độ công việc", "/task-assignments", "#eeeaff"]
  ];

  return <>
    <div className="dashboard-head">
      <div>
        <h1>Không gian làm việc của tôi</h1>
        <p>Theo dõi thông tin cá nhân và các nghiệp vụ của bạn.</p>
      </div>
      <div className="date-pill">Hôm nay · {today()}</div>
    </div>

    <div className="stat-grid">
      {personalLinks.map(([icon, label, description, to, tint]) => (
        <Link
          className="stat-card"
          style={{ "--tint": tint, textDecoration: "none", color: "inherit" }}
          to={to}
          key={to}
        >
          <div className="stat-icon">{icon}</div>
          <strong style={{ fontSize: "1.15rem" }}>{label}</strong>
          <span>{description}</span>
        </Link>
      ))}
    </div>
  </>;
}

function SalaryChart({ statistics }) {
  const [visibleMonths, setVisibleMonths] = useState(12);
  const visibleStatistics = statistics.slice(-visibleMonths);
  const maxSalary = Math.max(
    1,
    ...visibleStatistics.map((item) => Number(item.totalSalary || 0))
  );

  return (
    <section className="salary-chart-card">
      <div className="salary-chart-head">
        <div>
          <h3>Thống kê quỹ lương theo tháng</h3>
          <p>Mỗi cột thể hiện tổng tiền lương của một tháng.</p>
        </div>
        <div className="salary-chart-actions">
          <label htmlFor="salary-chart-range">Khoảng thời gian</label>
          <select
            id="salary-chart-range"
            value={visibleMonths}
            onChange={(event) => setVisibleMonths(Number(event.target.value))}
          >
            <option value={6}>6 tháng gần nhất</option>
            <option value={12}>12 tháng gần nhất</option>
          </select>
          <Link to="/salaries" className="salary-chart-link">Xem bảng lương →</Link>
        </div>
      </div>

      {visibleStatistics.length === 0 ? (
        <div className="salary-chart-empty">Chưa có bảng lương để thống kê.</div>
      ) : (
        <div className="salary-chart-bars">
          {visibleStatistics.map((item) => {
            const value = Number(item.totalSalary || 0);
            const height = value === 0 ? 2 : Math.max(6, (value / maxSalary) * 100);
            const period = `T${item.month}/${item.year}`;
            const tooltip = [
              `Tháng: ${item.month}/${item.year}`,
              `Thực nhận: ${fullMoney(item.totalSalary)}`,
              `Thưởng: ${fullMoney(item.totalBonus)}`,
              `Phạt: ${fullMoney(item.totalPenalty)}`,
              `Nhân viên: ${item.employeeCount}`
            ].join("\n");

            return (
              <div className="salary-bar-column" key={`${item.year}-${item.month}`} title={tooltip}>
                <span className="salary-bar-value">{compactMoney(item.totalSalary)}</span>
                <div className="salary-bar-track">
                  <div className="salary-bar-fill" style={{ height: `${height}%` }} />
                </div>
                <strong>{period}</strong>
                <small>{item.employeeCount} NV</small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function Dashboard() {
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const [data, setData] = useState(null);
  const [salaryStats, setSalaryStats] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "EMPLOYEE") {
      Promise.all([
        getDashboardData(),
        getSalaryStatistics(12)
      ])
        .then(([dashboardData, statistics]) => {
          setData(dashboardData);
          setSalaryStats(statistics);
        })
        .catch(() => setError("Không thể tải dữ liệu tổng quan. Vui lòng kiểm tra máy chủ."));
    }
  }, [role]);

  if (role === "EMPLOYEE") {
    return <EmployeeDashboard />;
  }

  if (error) return <div className="error-state">{error}</div>;
  if (!data) return <div className="loading">Đang tải dữ liệu...</div>;

  const cards = [
    ["♙", "Nhân viên", data.totalEmployees, "#eeeaff"],
    ["▤", "Phòng ban", data.totalDepartments, "#e5f8f3"],
    ["♜", "Chức vụ", data.totalPositions, "#fff2dc"],
    ["☂", "Đơn nghỉ phép", data.totalLeaveRequests, "#ffe9ee"]
  ];

  return <>
    <div className="dashboard-head">
      <div>
        <h1>Tổng quan nhân sự</h1>
        <p>Theo dõi nhanh tình hình vận hành của doanh nghiệp.</p>
      </div>
      <div className="date-pill">Hôm nay · {today()}</div>
    </div>
    <div className="stat-grid">
      {cards.map(([icon, label, value, tint]) => (
        <div className="stat-card" style={{ "--tint": tint }} key={label}>
          <div className="stat-icon">{icon}</div>
          <span>{label}</span>
          <strong>{value.toLocaleString("vi-VN")}</strong>
        </div>
      ))}
    </div>

    <SalaryChart statistics={salaryStats} />

    <div className="quick-panel">
      <div>
        <h3>Quản lý nhân sự hiệu quả hơn</h3>
        <p>Truy cập nhanh các nghiệp vụ thường dùng trong ngày.</p>
      </div>
      <div className="quick-links">
        <Link to="/employees/add">+ Thêm nhân viên</Link>
        <Link to="/attendance/add">+ Chấm công</Link>
        <Link to="/leave-requests">Duyệt nghỉ phép</Link>
      </div>
    </div>
  </>;
}
