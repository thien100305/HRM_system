import { useEffect, useState } from "react";

import {
useNavigate,
useParams
} from "react-router-dom";

import {
getEmployeeById,
updateEmployee
} from "../services/employeeService";

import {
getDepartments
} from "../services/departmentService";

import {
getPositions
} from "../services/positionService";

function EditEmployee() {

const { id } = useParams();

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

        const empData =
            await getEmployeeById(id);

        setDepartments(deptData);

        setPositions(posData);

        setEmployee({

            fullName:
                empData.fullName || "",

            gender:
                empData.gender,

            dob:
                empData.dob || "",

            phone:
                empData.phone || "",

            email:
                empData.email || "",

            address:
                empData.address || "",

            salary:
                empData.salary || "",

            hireDate:
                empData.hireDate || "",

            status:
                empData.status || "Đang làm việc",

            departmentId:
                empData.department?.id || "",

            positionId:
                empData.position?.id || ""
        });

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

            await updateEmployee(
                id,
                {

                    fullName:
                        employee.fullName,

                    gender:
                        employee.gender === true ||
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
                }
            );

            alert(
                "Cập nhật thành công"
            );

            navigate(
                "/employees"
            );

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.detail
                || error.response?.data?.message
                || "Không thể cập nhật nhân viên. Vui lòng kiểm tra lại dữ liệu."
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
            Sửa nhân viên
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
                value={employee.fullName}
                onChange={handleChange}
                className="form-control mb-3"
            />

            <select
                name="gender"
                value={employee.gender}
                onChange={handleChange}
                className="form-control mb-3"
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
                value={employee.dob}
                onChange={handleChange}
                className="form-control mb-3"
            />

            <input
                type="text"
                name="phone"
                value={employee.phone}
                onChange={handleChange}
                className="form-control mb-3"
                autoComplete="tel"
            />

            <input
                type="email"
                name="email"
                value={employee.email}
                onChange={handleChange}
                className="form-control mb-3"
                autoComplete="email"
            />

            <input
                type="text"
                name="address"
                value={employee.address}
                onChange={handleChange}
                className="form-control mb-3"
            />

            <select
                name="departmentId"
                value={employee.departmentId}
                onChange={handleChange}
                className="form-control mb-3"
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
                value={employee.positionId}
                onChange={handleChange}
                className="form-control mb-3"
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
                value={employee.hireDate}
                onChange={handleChange}
                className="form-control mb-3"
            />

            <input
                type="number"
                name="salary"
                value={employee.salary}
                onChange={handleChange}
                className="form-control mb-3"
            />

            <select
                name="status"
                value={employee.status}
                onChange={handleChange}
                className="form-control mb-3"
            >

                <option value="Đang làm việc">
                    Đang làm việc
                </option>

                <option value="Tạm nghỉ">
                    Tạm nghỉ
                </option>

                <option value="Nghỉ việc">
                    Nghỉ việc
                </option>

            </select>

            <button
                type="submit"
                className="btn btn-warning"
                disabled={saving}
            >
                {saving ? "Đang cập nhật..." : "Cập nhật"}
            </button>

        </form>

    </div>
);

}

export default EditEmployee;
