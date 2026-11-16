import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteEmployee, getEmployees } from "../services/employeeService";

const normalizeSearchText = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const loadEmployees = async () => {
        try {
            setError("");
            setEmployees(await getEmployees());
        } catch {
            setError("Không thể tải danh sách nhân viên");
        }
    };

    useEffect(() => {
        let active = true;

        getEmployees()
            .then((data) => {
                if (active) {
                    setEmployees(data);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Không thể tải danh sách nhân viên");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const filteredEmployees = useMemo(() => {
        const keyword = normalizeSearchText(search);
        if (!keyword) {
            return employees;
        }

        return employees.filter((employee) => normalizeSearchText([
            employee.employeeCode,
            employee.fullName,
            employee.department?.departmentCode,
            employee.department?.name,
            employee.position?.positionCode,
            employee.position?.name,
            employee.phone,
            employee.email,
            employee.status
        ].join(" ")).includes(keyword));
    }, [employees, search]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");
            await deleteEmployee(id);
            await loadEmployees();
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể xóa nhân viên"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const statusBadge = (status) => {
        if (status === "Đang làm việc") {
            return <span className="badge bg-success">{status}</span>;
        }
        if (status === "Tạm nghỉ") {
            return <span className="badge bg-warning text-dark">{status}</span>;
        }
        if (status === "Chờ duyệt") {
            return <span className="badge bg-info text-dark">{status}</span>;
        }
        return <span className="badge bg-danger">{status || "Chưa cập nhật"}</span>;
    };

    return (
        <div className="container">
            <div className="department-list-head">
                <div>
                    <h1>Danh sách nhân viên</h1>
                    <p>
                        Hiển thị {filteredEmployees.length} / {employees.length} nhân viên
                    </p>
                </div>
                <Link to="/employees/add" className="btn btn-success">
                    Thêm nhân viên
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="list-filter-bar">
                <div className="list-filter-field list-search-field">
                    <label htmlFor="employee-search">Tìm kiếm nhân viên</label>
                    <input
                        id="employee-search"
                        type="search"
                        className="form-control"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Mã NV, họ tên, email, phòng ban..."
                    />
                </div>

                {search && (
                    <button
                        type="button"
                        className="btn department-cancel-btn"
                        onClick={() => setSearch("")}
                    >
                        Xóa tìm kiếm
                    </button>
                )}
            </div>

            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Họ tên</th>
                        <th>Phòng ban</th>
                        <th>Chức vụ</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.employeeCode}</td>
                                <td>{employee.fullName}</td>
                                <td>{employee.department?.departmentCode || "-"}</td>
                                <td>{employee.position?.positionCode || "-"}</td>
                                <td>{employee.phone || "-"}</td>
                                <td>{employee.email || "-"}</td>
                                <td>{statusBadge(employee.status)}</td>
                                <td>
                                    <Link
                                        to={`/employees/edit/${employee.id}`}
                                        className="btn btn-warning me-2"
                                    >
                                        Sửa
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        disabled={deletingId === employee.id}
                                        onClick={() => handleDelete(employee.id)}
                                    >
                                        {deletingId === employee.id ? "Đang xóa..." : "Xóa"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center text-muted">
                                {search
                                    ? "Không tìm thấy nhân viên phù hợp"
                                    : "Không có dữ liệu nhân viên"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Employees;
