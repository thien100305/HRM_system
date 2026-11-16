import { useEffect, useMemo, useState } from "react";
import {
    createAccount,
    deleteAccount,
    getAccounts,
    updateAccount
} from "../services/accountService";
import { getEmployees } from "../services/employeeService";

const emptyForm = {
    username: "",
    password: "",
    role: "EMPLOYEE",
    employeeId: ""
};

const roleLabels = {
    ADMIN: "Quản trị viên",
    HR: "Nhân sự",
    EMPLOYEE: "Nhân viên"
};

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const currentUsername = localStorage.getItem("username");

    const loadData = async () => {
        const [accountData, employeeData] = await Promise.all([
            getAccounts(),
            getEmployees()
        ]);
        setAccounts(accountData);
        setEmployees(employeeData);
    };

    useEffect(() => {
        let active = true;

        Promise.all([getAccounts(), getEmployees()])
            .then(([accountData, employeeData]) => {
                if (active) {
                    setAccounts(accountData);
                    setEmployees(employeeData);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Không thể tải dữ liệu tài khoản");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const availableEmployees = useMemo(() => employees.filter((employee) => {
        const linkedAccount = accounts.find(
            (account) => account.employeeId === employee.id
        );
        return !linkedAccount || linkedAccount.id === editingId;
    }), [accounts, editingId, employees]);

    const filteredAccounts = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) {
            return accounts;
        }
        return accounts.filter((account) => [
            account.username,
            account.role,
            account.employeeCode,
            account.employeeName
        ].join(" ").toLowerCase().includes(keyword));
    }, [accounts, search]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "role" && value !== "EMPLOYEE" ? { employeeId: "" } : {})
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    };

    const startEdit = (account) => {
        setEditingId(account.id);
        setForm({
            username: account.username,
            password: "",
            role: account.role,
            employeeId: account.employeeId ? String(account.employeeId) : ""
        });
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setSaving(true);
            const payload = {
                ...form,
                employeeId: form.employeeId ? Number(form.employeeId) : null
            };

            if (editingId) {
                await updateAccount(editingId, payload);
            } else {
                await createAccount(payload);
            }

            await loadData();
            resetForm();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể lưu tài khoản"
            );
        } finally {
            setSaving(false);
        }
    };

    const remove = async (account) => {
        if (!window.confirm(`Xóa tài khoản "${account.username}"?`)) {
            return;
        }

        try {
            setError("");
            await deleteAccount(account.id);
            await loadData();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message
                || "Không thể xóa tài khoản"
            );
        }
    };

    return (
        <div className="container account-page">
            <div className="department-list-head">
                <div>
                    <h1>Quản lý tài khoản</h1>
                    <p>Tạo tài khoản, phân quyền và liên kết hồ sơ nhân viên.</p>
                </div>
            </div>

            <form className="account-form" onSubmit={submit}>
                <div className="account-form-head">
                    <strong>{editingId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}</strong>
                    {editingId && (
                        <button type="button" className="btn department-cancel-btn" onClick={resetForm}>
                            Hủy chỉnh sửa
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <div className="account-form-grid">
                    <div className="register-field">
                        <label>Tên đăng nhập <span>*</span></label>
                        <input
                            name="username"
                            className="form-control"
                            value={form.username}
                            onChange={updateField}
                            minLength={4}
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label>
                            Mật khẩu {!editingId && <span>*</span>}
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={form.password}
                            onChange={updateField}
                            minLength={6}
                            required={!editingId}
                            placeholder={editingId ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"}
                        />
                    </div>

                    <div className="register-field">
                        <label>Vai trò <span>*</span></label>
                        <select
                            name="role"
                            className="form-select"
                            value={form.role}
                            onChange={updateField}
                        >
                            <option value="EMPLOYEE">Nhân viên</option>
                            <option value="HR">Nhân sự</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>

                    {form.role === "EMPLOYEE" && (
                        <div className="register-field">
                            <label>Hồ sơ nhân viên <span>*</span></label>
                            <select
                                name="employeeId"
                                className="form-select"
                                value={form.employeeId}
                                onChange={updateField}
                                required
                            >
                                <option value="">Chọn nhân viên</option>
                                {availableEmployees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.employeeCode} - {employee.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button className="btn btn-primary" disabled={saving}>
                    {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo tài khoản"}
                </button>
            </form>

            <div className="list-filter-bar account-search">
                <div className="list-filter-field list-search-field">
                    <label htmlFor="account-search">Tìm kiếm tài khoản</label>
                    <input
                        id="account-search"
                        type="search"
                        className="form-control"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tên đăng nhập, vai trò hoặc nhân viên..."
                    />
                </div>
            </div>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Tên đăng nhập</th>
                        <th>Vai trò</th>
                        <th>Nhân viên liên kết</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAccounts.map((account) => (
                        <tr key={account.id}>
                            <td>
                                {account.username}
                                {account.username === currentUsername && (
                                    <span className="badge bg-info text-dark ms-2">Đang dùng</span>
                                )}
                            </td>
                            <td>{roleLabels[account.role] || account.role}</td>
                            <td>
                                {account.employeeId
                                    ? `${account.employeeCode} - ${account.employeeName}`
                                    : "-"}
                            </td>
                            <td>
                                <button
                                    className="btn btn-warning me-2"
                                    onClick={() => startEdit(account)}
                                >
                                    Sửa
                                </button>
                                <button
                                    className="btn btn-danger"
                                    disabled={account.username === currentUsername}
                                    onClick={() => remove(account)}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">
                                Không tìm thấy tài khoản
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Accounts;
