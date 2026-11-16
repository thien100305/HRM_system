import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div
            style={{
                width: "250px",
                height: "100vh",
                background: "#343a40",
                color: "white",
                padding: "20px"
            }}
        >

            <h3>HRM System</h3>

            <hr />

            <ul style={{ listStyle: "none", padding: 0 }}>

                <li>
                    <Link
                        to="/dashboard"
                        style={{ color: "white" }}
                    >
                        Dashboard
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/employees"
                        style={{ color: "white" }}
                    >
                        Nhân viên
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/departments"
                        style={{ color: "white" }}
                    >
                        Phòng ban
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/positions"
                        style={{ color: "white" }}
                    >
                        Chức vụ
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/attendance"
                        style={{ color: "white" }}
                    >
                        Chấm công
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/leave-requests"
                        style={{ color: "white" }}
                    >
                        Nghỉ phép
                    </Link>
                </li>

                <br />

                <li>
                    <Link
                        to="/salaries"
                        style={{ color: "white" }}
                    >
                        Lương
                    </Link>
                </li>

            </ul>

        </div>
    );
}

export default Sidebar;