import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaveRequest } from "../services/leaveRequestService";

function LeaveRequestForm() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveSession, setLeaveSession] = useState("FULL_DAY");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start < today) {
            setError("Ngày bắt đầu không được nhỏ hơn ngày hiện tại");
            return;
        }

        if (end < start) {
            setError("Ngày kết thúc không được trước ngày bắt đầu");
            return;
        }

        try {
            setSaving(true);
            // Backend tự gắn hồ sơ nhân viên từ tài khoản đăng nhập.
            await createLeaveRequest({
                startDate,
                endDate: leaveSession === "FULL_DAY" ? endDate : startDate,
                leaveSession,
                reason
            });
            navigate("/leave-requests");
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể tạo đơn nghỉ phép"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container">
            <h1>Tạo đơn nghỉ phép</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <label className="form-label">Hình thức nghỉ</label>
                <select
                    className="form-select mb-3"
                    value={leaveSession}
                    onChange={(event) => setLeaveSession(event.target.value)}
                >
                    <option value="FULL_DAY">Cả ngày</option>
                    <option value="MORNING">Nửa buổi sáng</option>
                    <option value="AFTERNOON">Nửa buổi chiều</option>
                </select>

                <label className="form-label">
                    {leaveSession === "FULL_DAY" ? "Từ ngày" : "Ngày nghỉ"}
                </label>
                <input
                    type="date"
                    className="form-control mb-3"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                />

                {leaveSession === "FULL_DAY" && (
                    <>
                        <label className="form-label">Đến ngày</label>
                        <input
                            type="date"
                            className="form-control mb-3"
                            value={endDate}
                            min={startDate}
                            onChange={(event) => setEndDate(event.target.value)}
                            required
                        />
                    </>
                )}

                <label className="form-label">Lý do nghỉ</label>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Lý do nghỉ"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    required
                />

                <button className="btn btn-success" disabled={saving}>
                    {saving ? "Đang lưu..." : "Gửi đơn"}
                </button>
            </form>
        </div>
    );
}

export default LeaveRequestForm;
