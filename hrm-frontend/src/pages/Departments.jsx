import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartments, deleteDepartment } from "../services/departmentService";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const loadDepartments = async () => {
        try {
            setError("");
            setDepartments(await getDepartments());
        } catch {
            setError("Không thể tải danh sách phòng ban");
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleDelete = async (department) => {
        const confirmed = window.confirm(
            `Xóa phòng ban “${department.name}”? Nhân viên thuộc phòng này sẽ được chuyển sang trạng thái chưa có phòng ban.`
        );

        if (!confirmed) return;

        try {
            setDeletingId(department.id);
            setError("");
            await deleteDepartment(department.id);
            await loadDepartments();
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể xóa phòng ban"
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container">
            <div className="department-list-head">
                <div>
                    <h1>Quản lý phòng ban</h1>
                    <p>Tổ chức và cập nhật cơ cấu các đơn vị trong doanh nghiệp.</p>
                </div>
                <Link to="/departments/add" className="btn btn-success">
                    + Thêm phòng ban
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Mã PB</th>
                        <th>Tên phòng ban</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.length > 0 ? departments.map((department) => (
                        <tr key={department.id}>
                            <td><span className="department-code-badge">{department.departmentCode}</span></td>
                            <td><strong>{department.name}</strong></td>
                            <td>{department.description || <span className="text-muted">Chưa có mô tả</span>}</td>
                            <td>
                                <Link
                                    to={`/departments/edit/${department.id}`}
                                    className="btn btn-warning me-2"
                                >
                                    Sửa
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    disabled={deletingId === department.id}
                                    onClick={() => handleDelete(department)}
                                >
                                    {deletingId === department.id ? "Đang xóa..." : "Xóa"}
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">
                                Chưa có phòng ban nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Departments;
