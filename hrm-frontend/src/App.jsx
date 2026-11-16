import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeForm from "./pages/EmployeeForm";
import EditEmployee from "./pages/EditEmployee";
import Departments from "./pages/Departments";
import DepartmentForm from "./pages/DepartmentForm";
import EditDepartment from "./pages/EditDepartment";
import Positions from "./pages/Positions";
import PositionForm from "./pages/PositionForm";
import EditPosition from "./pages/EditPosition";
import Attendance from "./pages/Attendance";
import AttendanceForm from "./pages/AttendanceForm";
import EditAttendance from "./pages/EditAttendance";
import LeaveRequests from "./pages/LeaveRequests";
import LeaveRequestForm from "./pages/LeaveRequestForm";
import EditLeaveRequest from "./pages/EditLeaveRequest";
import Salaries from "./pages/Salaries";
import SalaryForm from "./pages/SalaryForm";
import EditSalary from "./pages/EditSalary";
import Accounts from "./pages/Accounts";
import TaskAssignments from "./pages/TaskAssignments";
import TaskAssignmentForm from "./pages/TaskAssignmentForm";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const ADMIN = ["ADMIN"];
const ADMIN_HR = ["ADMIN", "HR"];
const EMPLOYEE = ["EMPLOYEE"];
const HR_EMPLOYEE = ["HR", "EMPLOYEE"];
const ALL_ROLES = ["ADMIN", "HR", "EMPLOYEE"];

const guard = (element, allowedRoles) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
        {element}
    </ProtectedRoute>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/employees" element={guard(<Employees />, ADMIN_HR)} />
                    <Route path="/employees/add" element={guard(<EmployeeForm />, ADMIN_HR)} />
                    <Route path="/employees/edit/:id" element={guard(<EditEmployee />, ADMIN_HR)} />

                    <Route path="/departments" element={guard(<Departments />, ADMIN_HR)} />
                    <Route path="/departments/add" element={guard(<DepartmentForm />, ADMIN_HR)} />
                    <Route path="/departments/edit/:id" element={guard(<EditDepartment />, ADMIN_HR)} />

                    <Route path="/positions" element={guard(<Positions />, ADMIN_HR)} />
                    <Route path="/positions/add" element={guard(<PositionForm />, ADMIN_HR)} />
                    <Route path="/positions/edit/:id" element={guard(<EditPosition />, ADMIN_HR)} />

                    <Route path="/attendance" element={guard(<Attendance />, ALL_ROLES)} />
                    <Route path="/attendance/add" element={guard(<AttendanceForm />, ADMIN_HR)} />
                    <Route path="/attendance/edit/:id" element={guard(<EditAttendance />, ADMIN_HR)} />

                    <Route path="/leave-requests" element={<LeaveRequests />} />
                    <Route path="/leave-requests/add" element={guard(<LeaveRequestForm />, EMPLOYEE)} />
                    <Route path="/leave-requests/edit/:id" element={guard(<EditLeaveRequest />, EMPLOYEE)} />

                    <Route path="/salaries" element={guard(<Salaries />, ALL_ROLES)} />
                    <Route path="/salaries/add" element={guard(<SalaryForm />, ADMIN_HR)} />
                    <Route path="/salaries/edit/:id" element={guard(<EditSalary />, ADMIN_HR)} />

                    <Route path="/accounts" element={guard(<Accounts />, ADMIN)} />

                    <Route path="/task-assignments" element={guard(<TaskAssignments />, HR_EMPLOYEE)} />
                    <Route path="/task-assignments/add" element={guard(<TaskAssignmentForm />, ["HR"])} />
                    <Route path="/task-assignments/edit/:id" element={guard(<TaskAssignmentForm />, ["HR"])} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
