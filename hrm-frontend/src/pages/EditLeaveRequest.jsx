import { useEffect, useState } from "react";
import { getLeaveRequestById, updateLeaveRequest } from "../services/leaveRequestService";
import { useParams, useNavigate } from "react-router-dom";

function EditLeaveRequest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveSession, setLeaveSession] = useState("FULL_DAY");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        getLeaveRequestById(id)
            .then((data) => {
                setStartDate(data.startDate);
                setEndDate(data.endDate);
                setLeaveSession(data.leaveSession || "FULL_DAY");
                setReason(data.reason);
            })
            .catch(() => setError("Không thể tải đơn nghỉ phép"));
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            await updateLeaveRequest(id, {
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
                || "Không thể cập nhật đơn nghỉ phép"
            );
        }
    };

    return (
        <div className="container">
            <h1>Sửa đơn nghỉ phép</h1>
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
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    required
                />
                <button className="btn btn-primary">Cập nhật</button>
            </form>
        </div>
    );
}

export default EditLeaveRequest;
