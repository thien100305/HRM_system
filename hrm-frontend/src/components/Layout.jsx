import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LeaveNotifications from "./LeaveNotifications";
import { logout } from "../services/authService";
import CompanyChat from "./CompanyChat";

const links = [
  ["/dashboard", "◦", "Tổng quan", ["ADMIN", "HR", "EMPLOYEE"]],
  ["/employees", "♙", "Nhân viên", ["ADMIN", "HR"]],
  ["/accounts", "⚿", "Tài khoản", ["ADMIN"]],
  ["/departments", "▤", "Phòng ban", ["ADMIN", "HR"]],
  ["/positions", "♜", "Chức vụ", ["ADMIN", "HR"]],
  ["/attendance", "◷", "Chấm công", ["ADMIN", "HR", "EMPLOYEE"]],
  ["/salaries", "₫", "Bảng lương", ["ADMIN", "HR", "EMPLOYEE"]],
  ["/leave-requests", "☂", "Nghỉ phép", ["ADMIN", "HR", "EMPLOYEE"]],
  ["/task-assignments", "✓", "Công việc", ["HR", "EMPLOYEE"]]
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Người dùng";
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const visibleLinks = links.filter(([, , , roles]) => roles.includes(role));
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return <div className="app-shell">
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark">H</div><div><strong>HRM System</strong><small>Quản trị nhân sự</small></div></div>
      <div className="nav-label">ĐIỀU HƯỚNG</div>
      <nav className="side-nav">{visibleLinks.map(([to, icon, label]) =>
        <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
          <span className="nav-icon">{icon}</span>{label}
        </NavLink>)}</nav>
      <div className="sidebar-footer"><button className="logout-btn" onClick={handleLogout}>↪ &nbsp; Đăng xuất</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setOpen(!open)}>☰</button>
        <span className="topbar-title">Không gian quản trị nhân sự</span>
        <div className="topbar-account">
          {role === "EMPLOYEE" && <LeaveNotifications username={username} />}
          <div className="user-chip">
            <div className="avatar">{username[0]?.toUpperCase()}</div>
            <div><strong>{username}</strong><small>{role.replace("ROLE_", "")}</small></div>
          </div>
        </div>
      </header>
      <section className="content"><Outlet /></section>
    </main>
    <CompanyChat username={username} role={role} />
  </div>;
}
