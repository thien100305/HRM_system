import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAttendance } from "../services/attendanceService";
import { getEmployees } from "../services/employeeService";

const currentDate = new Date();
const today = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0")
].join("-");

function AttendanceForm() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getEmployees()
            .then(setEmployees)
            .catch(() => setError("Không thể tải danh sách nhân viên."));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setSaving(true);
            const attendance = {
                attendanceDate,
                checkIn,
                checkOut: checkOut || null
            };

            attendance.employee = { id: Number(employeeId) };
            await createAttendance(attendance);
            navigate("/attendance");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể lưu dữ liệu chấm công."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container">
            <h1>Thêm chấm công</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <select
                    className="form-select mb-3"
                    value={employeeId}
                    onChange={(event) => setEmployeeId(event.target.value)}
                    required
                >
                    <option value="">Chọn nhân viên</option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.employeeCode} - {employee.fullName}
                        </option>
                    ))}
                </select>

                <label className="form-label">Ngày chấm công</label>
                <input
                    type="date"
                    className="form-control mb-3"
                    value={attendanceDate}
                    max={today}
                    onChange={(event) => setAttendanceDate(event.target.value)}
                    required
                />

                <label className="form-label">Giờ vào</label>
                <input
                    type="time"
                    className="form-control mb-3"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    required
                />

                <label className="form-label">Giờ ra (không bắt buộc)</label>
                <input
                    type="time"
                    className="form-control mb-3"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                />

                <button className="btn btn-success" disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu chấm công"}
                </button>
            </form>
        </div>
    );
}

export default AttendanceForm;
