import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateMonthlySalaries } from "../services/salaryService";

const previousMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
};

function SalaryForm() {
    const navigate = useNavigate();
    const initialPeriod = previousMonth();
    const [month, setMonth] = useState(initialPeriod.month);
    const [year, setYear] = useState(initialPeriod.year);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setLoading(true);
            const salaries = await generateMonthlySalaries(month, year);
            alert(`Đã tính/cập nhật lương cho ${salaries.length} nhân viên tháng ${month}/${year}`);
            navigate("/salaries");
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.message
                || "Không thể tính lương"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Tính lương</h1>
            <p className="text-muted">
                Hệ thống lấy lương cơ bản từ hồ sơ nhân viên và tính ngày công,
                nghỉ phép đã duyệt, thưởng chuyên cần và phạt đi muộn.
            </p>

            <div className="alert alert-info">
                <strong>Công thức:</strong> (Lương cơ bản / 26 × ngày được trả lương)
                + phụ cấp + thưởng chuyên cần − phạt đi muộn.
                Thưởng 500.000đ khi đủ 26 ngày công và không đi muộn;
                phạt 100.000đ cho mỗi lần đi muộn.
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <label className="form-label">Tháng</label>
                <input
                    type="number"
                    min="1"
                    max="12"
                    className="form-control mb-3"
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                    required
                />

                <label className="form-label">Năm</label>
                <input
                    type="number"
                    min="2000"
                    max="2100"
                    className="form-control mb-3"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                    required
                />

                <button className="btn btn-success" disabled={loading}>
                    {loading ? "Đang tính lương..." : "Tính lương cho toàn bộ nhân viên"}
                </button>
            </form>
        </div>
    );
}

export default SalaryForm;
