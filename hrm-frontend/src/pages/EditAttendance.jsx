import { useEffect, useState } from "react";

import {
getAttendanceById,
updateAttendance
} from "../services/AttendanceService";

import {
getEmployees
} from "../services/EmployeeService";

import {
useNavigate,
useParams
} from "react-router-dom";

function EditAttendance() {

const { id } =
    useParams();

const navigate =
    useNavigate();

const [employees,
    setEmployees] =
    useState([]);

const [employeeId,
    setEmployeeId] =
    useState("");

const [attendanceDate,
    setAttendanceDate] =
    useState("");

const [checkIn,
    setCheckIn] =
    useState("");

const [checkOut,
    setCheckOut] =
    useState("");

useEffect(() => {

    loadEmployees();

    loadAttendance();

}, []);

const loadEmployees =
    async () => {

        try {

            const data =
                await getEmployees();

            setEmployees(data);

        } catch (error) {

            console.error(error);
        }
    };

const loadAttendance =
    async () => {

        try {

            const data =
                await getAttendanceById(id);

            setAttendanceDate(
                data.attendanceDate
            );

            setCheckIn(
                data.checkIn
            );

            setCheckOut(
                data.checkOut
            );

            setEmployeeId(
                data.employee?.id
            );

        } catch (error) {

            console.error(error);
        }
    };

const handleSubmit =
    async (e) => {

        e.preventDefault();

        try {

            await updateAttendance(
                id,
                {
                    attendanceDate,

                    checkIn,

                    checkOut,

                    employee: {
                        id: employeeId
                    }
                }
            );

            alert(
                "Cập nhật thành công"
            );

            navigate(
                "/attendance"
            );

        } catch (error) {

            console.error(error);

            alert(
                "Cập nhật thất bại"
            );
        }
    };

return (

    <div className="container">

        <h1>
            Sửa chấm công
        </h1>

        <form
            onSubmit={
                handleSubmit
            }
        >

            <select
                className="form-control mb-3"
                value={employeeId}
                onChange={(e) =>
                    setEmployeeId(
                        e.target.value
                    )
                }
                required
            >

                <option value="">
                    Chọn nhân viên
                </option>

                {
                    employees.map(
                        emp => (

                            <option
                                key={emp.id}
                                value={emp.id}
                            >
                                {emp.employeeCode}
                                {" - "}
                                {emp.fullName}
                            </option>

                        )
                    )
                }

            </select>

            <input
                type="date"
                className="form-control mb-3"
                value={attendanceDate}
                onChange={(e) =>
                    setAttendanceDate(
                        e.target.value
                    )
                }
                required
            />

            <input
                type="time"
                className="form-control mb-3"
                value={checkIn}
                onChange={(e) =>
                    setCheckIn(
                        e.target.value
                    )
                }
                required
            />

            <input
                type="time"
                className="form-control mb-3"
                value={checkOut}
                onChange={(e) =>
                    setCheckOut(
                        e.target.value
                    )
                }
                required
            />

            <button
                className="btn btn-primary"
            >
                Cập nhật
            </button>

        </form>

    </div>
);

}

export default EditAttendance;