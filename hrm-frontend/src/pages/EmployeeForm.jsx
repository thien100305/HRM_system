import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
createEmployee
} from "../services/employeeService";

import {
getDepartments
} from "../services/departmentService";

import {
getPositions
} from "../services/positionService";

function EmployeeForm() {

const navigate = useNavigate();

const [departments, setDepartments] =
    useState([]);

const [positions, setPositions] =
    useState([]);

const [error, setError] = useState("");

const [saving, setSaving] = useState(false);

const [employee, setEmployee] =
    useState({

        fullName: "",

        gender: true,

        dob: "",

        phone: "",

        email: "",

        address: "",

        salary: "",

        hireDate: "",

        status: "Đang làm việc",

        departmentId: "",

        positionId: ""
    });

useEffect(() => {

    loadData();

}, []);

const loadData = async () => {

    try {

        const deptData =
            await getDepartments();

        const posData =
            await getPositions();

        setDepartments(deptData);

        setPositions(posData);

    } catch (error) {

        console.error(error);

    }
};

const handleChange = (e) => {

    setEmployee({

        ...employee,

        [e.target.name]:
            e.target.value
    });
};

const handleSubmit =
    async (e) => {

        e.preventDefault();

        setError("");
        setSaving(true);

        try {

            await createEmployee({

                fullName:
                    employee.fullName,

                gender:
                    employee.gender === "true",

                dob:
                    employee.dob,

                phone:
                    employee.phone.trim(),

                email:
                    employee.email.trim(),

                address:
                    employee.address,

                salary:
                    employee.salary,

                hireDate:
                    employee.hireDate,

                status:
                    employee.status,

                department: {
                    id:
                        employee.departmentId
                },

                position: {
                    id:
                        employee.positionId
                }
            });

            alert(
                "Thêm nhân viên thành công"
            );

            navigate(
                "/employees"
            );

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.detail
                || error.response?.data?.message
                || "Không thể thêm nhân viên. Vui lòng kiểm tra lại dữ liệu."
            );
        } finally {
            setSaving(false);
        }
    };

return (

    <div
        className="container"
    >

        <h1>
            Thêm nhân viên
        </h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form
            onSubmit={
                handleSubmit
            }
        >

            <input
                type="text"
                name="fullName"
                placeholder="Họ tên"
                className="form-control mb-3"
                onChange={handleChange}
                required
            />

            <select
                name="gender"
                className="form-control mb-3"
                onChange={handleChange}
            >

                <option value="true">
                    Nam
                </option>

                <option value="false">
                    Nữ
                </option>

            </select>

            <input
                type="date"
                name="dob"
                className="form-control mb-3"
                onChange={handleChange}
            />

            <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                className="form-control mb-3"
                onChange={handleChange}
                autoComplete="tel"
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                className="form-control mb-3"
                onChange={handleChange}
                autoComplete="email"
            />

            <input
                type="text"
                name="address"
                placeholder="Địa chỉ"
                className="form-control mb-3"
                onChange={handleChange}
            />

            <select
                name="departmentId"
                className="form-control mb-3"
                onChange={handleChange}
                required
            >

                <option value="">
                    Chọn phòng ban
                </option>

                {
                    departments.map(
                        dept => (

                            <option
                                key={dept.id}
                                value={dept.id}
                            >
                                {dept.name}
                            </option>
                        )
                    )
                }

            </select>

            <select
                name="positionId"
                className="form-control mb-3"
                onChange={handleChange}
                required
            >

                <option value="">
                    Chọn chức vụ
                </option>

                {
                    positions.map(
                        pos => (

                            <option
                                key={pos.id}
                                value={pos.id}
                            >
                                {pos.name}
                            </option>
                        )
                    )
                }

            </select>

            <input
                type="date"
                name="hireDate"
                className="form-control mb-3"
                onChange={handleChange}
            />

            <input
                type="number"
                name="salary"
                placeholder="Lương cơ bản"
                className="form-control mb-3"
                onChange={handleChange}
            />

            <select
                name="status"
                className="form-control mb-3"
                onChange={handleChange}
            >

                <option
                    value="Đang làm việc"
                >
                    Đang làm việc
                </option>

                <option
                    value="Tạm nghỉ"
                >
                    Tạm nghỉ
                </option>

                <option
                    value="Nghỉ việc"
                >
                    Nghỉ việc
                </option>

            </select>

            <button
                type="submit"
                className="btn btn-success"
                disabled={saving}
            >
                {saving ? "Đang lưu..." : "Lưu"}
            </button>

        </form>

    </div>
);

}

export default EmployeeForm;
