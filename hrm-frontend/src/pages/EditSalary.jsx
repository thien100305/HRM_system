import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSalaryById, updateSalary } from "../services/salaryService";

const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

function EditSalary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [salary, setSalary] = useState(null);
    const [allowance, setAllowance] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        getSalaryById(id)
            .then((data) => {
                setSalary(data);
                setAllowance(data.allowance || 0);
            })
            .catch(() => setError("Không thể tải bảng lương"));
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await updateSalary(id, { allowance });
            navigate("/salaries");
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể cập nhật bảng lương"
            );
        }
    };

    if (!salary && !error) return <div className="loading">Đang tải dữ liệu...</div>;

    return (
        <div className="container">
            <h1>Điều chỉnh phụ cấp</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            {salary && <>
                <div className="alert alert-light">
                    <div><strong>Nhân viên:</strong> {salary.employee?.fullName}</div>
                    <div><strong>Kỳ lương:</strong> {salary.month}/{salary.year}</div>
                    <div><strong>Lương cơ bản:</strong> {money(salary.basicSalary)}</div>
                    <div><strong>Ngày công:</strong> {salary.workingDays}</div>
                    <div><strong>Ngày nghỉ có phép:</strong> {salary.leaveDays}</div>
                    <div><strong>Số lần đi muộn:</strong> {salary.lateDays}</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="form-label">Phụ cấp</label>
                    <input
                        type="number"
                        min="0"
                        className="form-control mb-3"
                        value={allowance}
                        onChange={(event) => setAllowance(Number(event.target.value))}
                    />
                    <button className="btn btn-primary">Tính lại và cập nhật</button>
                </form>
            </>}
        </div>
    );
}

export default EditSalary;
