import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployees } from "../services/employeeService";
import {
    createTaskAssignment,
    getTaskAssignmentById,
    updateTaskAssignment
} from "../services/taskAssignmentService";

const initialForm = {
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "TODO",
    employeeId: ""
};

function TaskAssignmentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        const requests = [getEmployees()];
        if (editing) {
            requests.push(getTaskAssignmentById(id));
        }

        Promise.all(requests)
            .then(([employeeData, assignment]) => {
                if (!active) {
                    return;
                }
                setEmployees(employeeData);
                if (assignment) {
                    setForm({
                        title: assignment.title || "",
                        description: assignment.description || "",
                        startDate: assignment.startDate || "",
                        dueDate: assignment.dueDate || "",
                        priority: assignment.priority || "MEDIUM",
                        status: assignment.status || "TODO",
                        employeeId: assignment.employee?.id
                            ? String(assignment.employee.id)
                            : ""
                    });
                }
            })
            .catch(() => {
                if (active) {
                    setError("Không thể tải dữ liệu phân công");
                }
            });

        return () => {
            active = false;
        };
    }, [editing, id]);

    const updateField = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setSaving(true);
            const payload = {
                title: form.title,
                description: form.description,
                startDate: form.startDate,
                dueDate: form.dueDate,
                priority: form.priority,
                status: form.status,
                employee: { id: Number(form.employeeId) }
            };

            if (editing) {
                await updateTaskAssignment(id, payload);
            } else {
                await createTaskAssignment(payload);
            }
            navigate("/task-assignments");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể lưu phân công công việc"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container task-form-page">
            <div className="form-page-heading">
                <div className="form-page-icon">✓</div>
                <div>
                    <span className="form-eyebrow">PHÂN CÔNG</span>
                    <h1>{editing ? "Cập nhật công việc" : "Giao việc mới"}</h1>
                    <p>Thiết lập nội dung, thời hạn và nhân viên phụ trách.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form className="task-form-card" onSubmit={submit}>
                <div className="task-form-grid">
                    <div className="register-field full-width">
                        <label>Tên công việc <span>*</span></label>
                        <input
                            name="title"
                            className="form-control"
                            value={form.title}
                            onChange={updateField}
                            maxLength={200}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="register-field full-width">
                        <label>Mô tả</label>
                        <textarea
                            name="description"
                            className="form-control"
                            value={form.description}
                            onChange={updateField}
                            rows={5}
                        />
                    </div>

                    <div className="register-field">
                        <label>Nhân viên nhận việc <span>*</span></label>
                        <select
                            name="employeeId"
                            className="form-select"
                            value={form.employeeId}
                            onChange={updateField}
                            required
                        >
                            <option value="">Chọn nhân viên</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.employeeCode} - {employee.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="register-field">
                        <label>Mức ưu tiên <span>*</span></label>
                        <select
                            name="priority"
                            className="form-select"
                            value={form.priority}
                            onChange={updateField}
                        >
                            <option value="LOW">Thấp</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HIGH">Cao</option>
                        </select>
                    </div>

                    <div className="register-field">
                        <label>Ngày bắt đầu <span>*</span></label>
                        <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={form.startDate}
                            onChange={updateField}
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label>Hạn hoàn thành <span>*</span></label>
                        <input
                            type="date"
                            name="dueDate"
                            className="form-control"
                            value={form.dueDate}
                            min={form.startDate}
                            onChange={updateField}
                            required
                        />
                    </div>

                    {editing && (
                        <div className="register-field">
                            <label>Trạng thái</label>
                            <select
                                name="status"
                                className="form-select"
                                value={form.status}
                                onChange={updateField}
                            >
                                <option value="TODO">Chưa bắt đầu</option>
                                <option value="IN_PROGRESS">Đang thực hiện</option>
                                <option value="COMPLETED">Hoàn thành</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="task-form-actions">
                    <button
                        type="button"
                        className="btn department-cancel-btn"
                        onClick={() => navigate("/task-assignments")}
                    >
                        Hủy
                    </button>
                    <button className="btn btn-primary" disabled={saving}>
                        {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Giao việc"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskAssignmentForm;
