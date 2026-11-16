import { useEffect, useState } from "react";
import { getSalaries, deleteSalary } from "../services/salaryService";
import { Link } from "react-router-dom";

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

function Salaries() {
    const [salaries, setSalaries] = useState([]);
    const [error, setError] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const role = localStorage.getItem("role");
    const canManage = role === "ADMIN" || role === "HR";

    const loadSalaries = async () => {
        try {
            setError("");
            const data = await getSalaries();
            setSalaries(data);

            const periodKeys = [...new Set(data.map(
                (item) => `${item.year}-${String(item.month).padStart(2, "0")}`
            ))].sort().reverse();

            setSelectedPeriod((current) =>
                current && (current === "all" || periodKeys.includes(current))
                    ? current
                    : periodKeys[0] || "all"
            );
        } catch {
            setError("Không thể tải dữ liệu bảng lương");
        }
    };

    useEffect(() => {
        loadSalaries();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Xóa bảng lương này?")) {
            await deleteSalary(id);
            await loadSalaries();
        }
    };

    const periods = [...new Map(
        salaries
            .map((item) => ({
                key: `${item.year}-${String(item.month).padStart(2, "0")}`,
                label: `${String(item.month).padStart(2, "0")}/${item.year}`,
                sortValue: item.year * 100 + item.month
            }))
            .sort((a, b) => b.sortValue - a.sortValue)
            .map((period) => [period.key, period])
    ).values()];

    const employees = [...new Map(
        salaries
            .filter((item) => item.employee?.id)
            .map((item) => [item.employee.id, item.employee])
    ).values()].sort((first, second) =>
        first.fullName.localeCompare(second.fullName, "vi")
    );

    const periodSalaries = selectedPeriod === "all" || !selectedPeriod
        ? salaries
        : salaries.filter((item) =>
            `${item.year}-${String(item.month).padStart(2, "0")}` === selectedPeriod
        );

    const visibleSalaries = selectedEmployee === "all" || !canManage
        ? periodSalaries
        : periodSalaries.filter((item) =>
            String(item.employee?.id) === selectedEmployee
        );

    const periodTotal = visibleSalaries.reduce(
        (total, item) => total + Number(item.totalSalary || 0),
        0
    );

    return (
        <div className="container">
            <h1>{canManage ? "Quản lý lương" : "Bảng lương của tôi"}</h1>
            {!canManage && (
                <p className="text-muted">Bạn chỉ có thể xem bảng lương của chính mình.</p>
            )}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="salary-period-toolbar">
                <div className="salary-period-select">
                    <label htmlFor="salary-period">Kỳ lương</label>
                    <select
                        id="salary-period"
                        className="form-select"
                        value={selectedPeriod}
                        onChange={(event) => setSelectedPeriod(event.target.value)}
                    >
                        {periods.map((period) => (
                            <option value={period.key} key={period.key}>
                                {period.label}
                            </option>
                        ))}
                        <option value="all">Tất cả kỳ lương</option>
                    </select>
                </div>

                {canManage && (
                    <div className="salary-period-select">
                        <label htmlFor="salary-employee">Nhân viên</label>
                        <select
                            id="salary-employee"
                            className="form-select"
                            value={selectedEmployee}
                            onChange={(event) => setSelectedEmployee(event.target.value)}
                        >
                            <option value="all">Tất cả nhân viên</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.employeeCode} - {employee.fullName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="salary-period-total">
                    <span>Tổng thực nhận</span>
                    <strong>{formatMoney(periodTotal)}</strong>
                </div>

                {canManage && (
                    <Link to="/salaries/add" className="btn btn-success">
                        Tính lương
                    </Link>
                )}
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        {canManage && <th>Nhân viên</th>}
                        <th>Kỳ lương</th>
                        <th>Ngày công</th>
                        <th>Nghỉ có phép</th>
                        <th>Đi muộn</th>
                        <th>Lương cơ bản</th>
                        <th>Phụ cấp</th>
                        <th>Thưởng chuyên cần</th>
                        <th>Phạt đi muộn</th>
                        <th>Thực nhận</th>
                        {canManage && <th>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {visibleSalaries.map((item) => (
                        <tr key={item.id}>
                            {canManage && <td>{item.employee?.fullName}</td>}
                            <td>{item.month}/{item.year}</td>
                            <td>{item.workingDays}</td>
                            <td>{item.leaveDays}</td>
                            <td>{item.lateDays}</td>
                            <td>{formatMoney(item.basicSalary)}</td>
                            <td>{formatMoney(item.allowance)}</td>
                            <td className="text-success">+ {formatMoney(item.attendanceBonus)}</td>
                            <td className="text-danger">- {formatMoney(item.latePenalty)}</td>
                            <td><strong>{formatMoney(item.totalSalary)}</strong></td>
                            {canManage && (
                                <td>
                                    <Link
                                        to={`/salaries/edit/${item.id}`}
                                        className="btn btn-warning me-2"
                                    >
                                        Phụ cấp
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {!error && visibleSalaries.length === 0 && (
                <div className="text-muted">Chưa có dữ liệu cho kỳ lương đã chọn.</div>
            )}
        </div>
    );
}

export default Salaries;
