import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getLeaveRequests,
    deleteLeaveRequest,
    approveLeave,
    rejectLeave
} from "../services/leaveRequestService";

function LeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [error, setError] = useState("");
    const role = localStorage.getItem("role");

    const loadLeaveRequests = useCallback(async () => {
        try {
            setError("");
            setLeaveRequests(await getLeaveRequests());
        } catch {
            setError("Không thể tải danh sách nghỉ phép");
        }
    }, []);

    useEffect(() => {
        loadLeaveRequests();
    }, [loadLeaveRequests]);

    const performAction = async (action, id) => {
        try {
            setError("");
            await action(id);
            await loadLeaveRequests();
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể xử lý đơn nghỉ phép"
            );
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa đơn nghỉ phép này?")) {
            await performAction(deleteLeaveRequest, id);
        }
    };

    const statusBadge = (status) => {
        if (status === "Pending") {
            return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
        }
        if (status === "Approved") {
            return <span className="badge bg-success">Đã duyệt</span>;
        }
        if (status === "Rejected") {
            return <span className="badge bg-danger">Từ chối</span>;
        }
        return status;
    };

    const sessionLabel = (session) => ({
        FULL_DAY: "Cả ngày",
        MORNING: "Buổi sáng",
        AFTERNOON: "Buổi chiều"
    }[session] || "Cả ngày");

    return (
        <div className="container">
            <h1>Danh sách nghỉ phép</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            {role === "EMPLOYEE" && (
                <Link to="/leave-requests/add" className="btn btn-primary mb-3">
                    Tạo đơn nghỉ phép
                </Link>
            )}

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Từ ngày</th>
                        <th>Đến ngày</th>
                        <th>Số ngày</th>
                        <th>Buổi nghỉ</th>
                        <th>Lý do</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map((item) => (
                        <tr key={item.id}>
                            <td>{item.employee?.fullName || ""}</td>
                            <td>{item.startDate}</td>
                            <td>{item.endDate}</td>
                            <td>{item.totalDays}</td>
                            <td>{sessionLabel(item.leaveSession)}</td>
                            <td>{item.reason}</td>
                            <td>{statusBadge(item.status)}</td>
                            <td>
                                {role === "EMPLOYEE" && item.status === "Pending" && (
                                    <Link
                                        to={`/leave-requests/edit/${item.id}`}
                                        className="btn btn-warning me-2"
                                    >
                                        Sửa
                                    </Link>
                                )}

                                {(role === "ADMIN" || role === "HR")
                                    && item.status === "Pending" && (
                                    <>
                                        <button
                                            className="btn btn-success me-2"
                                            onClick={() => performAction(approveLeave, item.id)}
                                        >
                                            Duyệt
                                        </button>
                                        <button
                                            className="btn btn-danger me-2"
                                            onClick={() => performAction(rejectLeave, item.id)}
                                        >
                                            Từ chối
                                        </button>
                                    </>
                                )}

                                {role === "ADMIN" && (
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Xóa
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LeaveRequests;
