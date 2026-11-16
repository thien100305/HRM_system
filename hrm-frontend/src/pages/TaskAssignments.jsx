import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    deleteTaskAssignment,
    downloadTaskAttachment,
    getTaskAssignments,
    updateTaskStatus
} from "../services/taskAssignmentService";

const statusLabels = {
    TODO: "Chưa bắt đầu",
    IN_PROGRESS: "Đang thực hiện",
    COMPLETED: "Hoàn thành"
};

const priorityLabels = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao"
};

function TaskAssignments() {
    const role = localStorage.getItem("role");
    const canManage = role === "HR";
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [completionId, setCompletionId] = useState(null);
    const [completionFile, setCompletionFile] = useState(null);

    const loadAssignments = async () => {
        setAssignments(await getTaskAssignments());
    };

    useEffect(() => {
        let active = true;

        getTaskAssignments()
            .then((data) => {
                if (active) {
                    setAssignments(data);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Không thể tải danh sách công việc");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const filteredAssignments = useMemo(
        () => statusFilter
            ? assignments.filter((assignment) => assignment.status === statusFilter)
            : assignments,
        [assignments, statusFilter]
    );

    const changeStatus = async (assignment, status) => {
        if (!canManage && status === "COMPLETED" && !assignment.hasAttachment) {
            setCompletionId(assignment.id);
            setCompletionFile(null);
            return;
        }

        try {
            setUpdatingId(assignment.id);
            setError("");
            await updateTaskStatus(assignment.id, status);
            await loadAssignments();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể cập nhật trạng thái công việc"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const completeAssignment = async (assignment) => {
        if (!completionFile) {
            setError("Vui lòng chọn file minh chứng trước khi hoàn thành công việc");
            return;
        }

        try {
            setUpdatingId(assignment.id);
            setError("");
            await updateTaskStatus(assignment.id, "COMPLETED", completionFile);
            setCompletionId(null);
            setCompletionFile(null);
            await loadAssignments();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể gửi file minh chứng"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const downloadAttachment = async (assignment) => {
        try {
            setError("");
            await downloadTaskAttachment(assignment);
        } catch {
            setError("Không thể tải file minh chứng");
        }
    };

    const remove = async (assignment) => {
        if (!window.confirm(`Xóa công việc "${assignment.title}"?`)) {
            return;
        }
        try {
            setError("");
            await deleteTaskAssignment(assignment.id);
            await loadAssignments();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể xóa công việc"
            );
        }
    };

    const statusBadge = (status) => {
        const className = status === "COMPLETED"
            ? "bg-success"
            : status === "IN_PROGRESS"
                ? "bg-warning text-dark"
                : "bg-secondary";
        return <span className={`badge ${className}`}>{statusLabels[status]}</span>;
    };

    const priorityBadge = (priority) => {
        const className = priority === "HIGH"
            ? "task-priority-high"
            : priority === "LOW"
                ? "task-priority-low"
                : "task-priority-medium";
        return <span className={`task-priority ${className}`}>{priorityLabels[priority]}</span>;
    };

    return (
        <div className="container">
            <div className="department-list-head">
                <div>
                    <h1>{canManage ? "Phân công công việc" : "Công việc của tôi"}</h1>
                    <p>
                        {canManage
                            ? "Giao việc và theo dõi tiến độ của nhân viên."
                            : "Theo dõi công việc được giao và cập nhật tiến độ."}
                    </p>
                </div>
                {canManage && (
                    <Link to="/task-assignments/add" className="btn btn-success">
                        Giao việc mới
                    </Link>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="list-filter-bar">
                <div className="list-filter-field">
                    <label htmlFor="task-status-filter">Trạng thái</label>
                    <select
                        id="task-status-filter"
                        className="form-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="TODO">Chưa bắt đầu</option>
                        <option value="IN_PROGRESS">Đang thực hiện</option>
                        <option value="COMPLETED">Hoàn thành</option>
                    </select>
                </div>
                <span className="task-result-count">
                    {filteredAssignments.length} công việc
                </span>
            </div>

            <div className="task-grid">
                {filteredAssignments.map((assignment) => (
                    <article className="task-card" key={assignment.id}>
                        <div className="task-card-head">
                            {priorityBadge(assignment.priority)}
                            {statusBadge(assignment.status)}
                        </div>
                        <h3>{assignment.title}</h3>
                        <p>{assignment.description || "Không có mô tả."}</p>

                        <dl className="task-meta">
                            {canManage && (
                                <>
                                    <dt>Nhân viên</dt>
                                    <dd>
                                        {assignment.employee?.employeeCode}
                                        {" - "}
                                        {assignment.employee?.fullName}
                                    </dd>
                                </>
                            )}
                            <dt>Thời gian</dt>
                            <dd>{assignment.startDate} → {assignment.dueDate}</dd>
                            <dt>Người giao</dt>
                            <dd>{assignment.assignedBy || "HR"}</dd>
                            {assignment.hasAttachment && (
                                <>
                                    <dt>File hoàn thành</dt>
                                    <dd>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => downloadAttachment(assignment)}
                                        >
                                            Tải {assignment.attachmentName}
                                        </button>
                                    </dd>
                                </>
                            )}
                        </dl>

                        {!canManage && completionId === assignment.id && (
                            <div className="alert alert-info">
                                <label className="form-label">
                                    File minh chứng hoàn thành (tối đa 10 MB)
                                </label>
                                <input
                                    type="file"
                                    className="form-control mb-2"
                                    onChange={(event) => setCompletionFile(event.target.files?.[0] || null)}
                                />
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        disabled={!completionFile || updatingId === assignment.id}
                                        onClick={() => completeAssignment(assignment)}
                                    >
                                        {updatingId === assignment.id ? "Đang gửi..." : "Xác nhận hoàn thành"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn department-cancel-btn"
                                        onClick={() => {
                                            setCompletionId(null);
                                            setCompletionFile(null);
                                        }}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="task-card-actions">
                            {!canManage && (
                                <select
                                    className="form-select"
                                    value={assignment.status}
                                    disabled={updatingId === assignment.id}
                                    onChange={(event) =>
                                        changeStatus(assignment, event.target.value)
                                    }
                                >
                                    <option value="TODO">Chưa bắt đầu</option>
                                    <option value="IN_PROGRESS">Đang thực hiện</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                </select>
                            )}

                            {canManage && (
                                <>
                                    <Link
                                        to={`/task-assignments/edit/${assignment.id}`}
                                        className="btn btn-warning"
                                    >
                                        Sửa
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => remove(assignment)}
                                    >
                                        Xóa
                                    </button>
                                </>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {filteredAssignments.length === 0 && (
                <div className="task-empty">
                    Chưa có công việc phù hợp với bộ lọc.
                </div>
            )}
        </div>
    );
}

export default TaskAssignments;
