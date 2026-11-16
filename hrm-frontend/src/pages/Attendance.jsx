import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    deleteAttendance,
    downloadAttendanceTemplate,
    getAttendance,
    getAttendanceMonthlySummary,
    importAttendance
} from "../services/attendanceService";

const monthOptions = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [month, setMonth] = useState(String(currentMonth));
    const [year, setYear] = useState(String(currentYear));
    const [error, setError] = useState("");
    const [importMessage, setImportMessage] = useState("");
    const [importErrors, setImportErrors] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [monthlySummary, setMonthlySummary] = useState(null);
    const fileInputRef = useRef(null);
    const role = localStorage.getItem("role");
    const canManage = role === "ADMIN" || role === "HR";

    const loadAttendance = async () => {
        try {
            setError("");
            setAttendance(await getAttendance());
        } catch {
            setError("Không thể tải dữ liệu chấm công");
        }
    };

    useEffect(() => {
        let active = true;

        getAttendance()
            .then((data) => {
                if (active) {
                    setAttendance(data);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Không thể tải dữ liệu chấm công");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (canManage || !month || !year) {
            setMonthlySummary(null);
            return;
        }

        let active = true;
        getAttendanceMonthlySummary(Number(month), Number(year))
            .then((summary) => {
                if (active) {
                    setMonthlySummary(summary);
                }
            })
            .catch(() => {
                if (active) {
                    setMonthlySummary(null);
                }
            });

        return () => {
            active = false;
        };
    }, [canManage, month, year]);

    const availableYears = useMemo(() => {
        const years = new Set([
            currentYear,
            ...attendance
                .map((item) => Number(item.attendanceDate?.slice(0, 4)))
                .filter(Boolean)
        ]);
        return [...years].sort((first, second) => second - first);
    }, [attendance]);

    const filteredAttendance = useMemo(() => attendance.filter((item) => {
        if (!item.attendanceDate) {
            return false;
        }

        const [itemYear, itemMonth] = item.attendanceDate.split("-").map(Number);
        const matchesMonth = month === "" || itemMonth === Number(month);
        const matchesYear = year === "" || itemYear === Number(year);
        return matchesMonth && matchesYear;
    }), [attendance, month, year]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa dữ liệu chấm công này?")) {
            return;
        }

        try {
            setError("");
            await deleteAttendance(id);
            await loadAttendance();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể xóa dữ liệu chấm công"
            );
        }
    };

    const resetFilters = () => {
        setMonth("");
        setYear("");
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }

        try {
            setError("");
            setImportMessage("");
            setImportErrors([]);
            setIsImporting(true);
            const result = await importAttendance(file);
            setImportMessage(
                `Đã nhập ${result.imported}/${result.totalRows} dòng.`
                + (result.skipped ? ` Bỏ qua ${result.skipped} dòng lỗi hoặc trùng.` : "")
            );
            setImportErrors(result.errors || []);
            await loadAttendance();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể nhập dữ liệu từ file Excel"
            );
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setError("");
            await downloadAttendanceTemplate();
        } catch {
            setError("Không thể tải file Excel mẫu");
        }
    };

    return (
        <div className="container">
            <div className="department-list-head">
                <div>
                    <h1>{canManage ? "Danh sách chấm công" : "Chấm công của tôi"}</h1>
                    <p>
                        Đang hiển thị {filteredAttendance.length} / {attendance.length} bản ghi
                    </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {canManage && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="d-none"
                                onChange={handleImport}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={handleDownloadTemplate}
                            >
                                Tải file mẫu
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={isImporting}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isImporting ? "Đang nhập..." : "Nhập từ Excel"}
                            </button>
                        </>
                    )}
                    {canManage && (
                        <Link to="/attendance/add" className="btn btn-success">
                            Thêm thủ công
                        </Link>
                    )}
                </div>
            </div>

            {!canManage && (
                <p className="text-muted">
                    Bạn chỉ có thể xem dữ liệu chấm công của chính mình.
                </p>
            )}
            {!canManage && monthlySummary && (
                <div className="stat-grid mb-3">
                    <div className="stat-card" style={{ "--tint": "#e5f8f3" }}>
                        <span>Ngày làm trong tháng</span>
                        <strong>{monthlySummary.workedDays}</strong>
                    </div>
                    <div className="stat-card" style={{ "--tint": "#ffe9ee" }}>
                        <span>Số ngày đã nghỉ</span>
                        <strong>{monthlySummary.absentDays}</strong>
                    </div>
                    <div className="stat-card" style={{ "--tint": "#fff2dc" }}>
                        <span>Nghỉ phép đã duyệt</span>
                        <strong>{monthlySummary.approvedLeaveDays}</strong>
                    </div>
                </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {importMessage && (
                <div className={`alert ${importErrors.length ? "alert-warning" : "alert-success"}`}>
                    <div>{importMessage}</div>
                    {importErrors.length > 0 && (
                        <ul className="mb-0 mt-2">
                            {importErrors.slice(0, 10).map((item) => (
                                <li key={`${item.row}-${item.message}`}>
                                    Dòng {item.row}: {item.message}
                                </li>
                            ))}
                            {importErrors.length > 10 && (
                                <li>Và {importErrors.length - 10} lỗi khác.</li>
                            )}
                        </ul>
                    )}
                </div>
            )}

            <div className="list-filter-bar">
                <div className="list-filter-field">
                    <label htmlFor="attendance-month">Tháng</label>
                    <select
                        id="attendance-month"
                        className="form-select"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                    >
                        <option value="">Tất cả tháng</option>
                        {monthOptions.map((label, index) => (
                            <option key={label} value={index + 1}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="list-filter-field">
                    <label htmlFor="attendance-year">Năm</label>
                    <select
                        id="attendance-year"
                        className="form-select"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                    >
                        <option value="">Tất cả năm</option>
                        {availableYears.map((availableYear) => (
                            <option key={availableYear} value={availableYear}>
                                {availableYear}
                            </option>
                        ))}
                    </select>
                </div>

                {(month || year) && (
                    <button
                        type="button"
                        className="btn department-cancel-btn"
                        onClick={resetFilters}
                    >
                        Xem tất cả
                    </button>
                )}
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        {canManage && <th>Nhân viên</th>}
                        <th>Ngày</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Trạng thái</th>
                        {canManage && <th>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredAttendance.length > 0 ? (
                        filteredAttendance.map((item) => (
                            <tr key={item.id}>
                                {canManage && (
                                    <td>
                                        {item.employee?.employeeCode} - {item.employee?.fullName}
                                    </td>
                                )}
                                <td>{item.attendanceDate}</td>
                                <td>{item.checkIn || "-"}</td>
                                <td>{item.checkOut || "-"}</td>
                                <td>{item.status}</td>
                                {canManage && (
                                    <td>
                                        <Link
                                            to={`/attendance/edit/${item.id}`}
                                            className="btn btn-warning me-2"
                                        >
                                            Sửa
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
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={canManage ? 6 : 4}
                                className="text-center text-muted"
                            >
                                Không có dữ liệu chấm công trong thời gian đã chọn
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Attendance;
