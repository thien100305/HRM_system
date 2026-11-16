import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveSession } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(username, password);
            saveSession(data, username);
            navigate("/dashboard", { replace: true });
        } catch (requestError) {
            const responseData = requestError.response?.data;
            setError(
                (typeof responseData === "string" ? responseData : responseData?.message)
                || "Tên đăng nhập hoặc mật khẩu không chính xác."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <section className="login-visual">
                <div className="brand">
                    <div className="brand-mark">H</div>
                    <div>
                        <strong>HRM System</strong>
                        <small>Nền tảng quản trị nhân sự</small>
                    </div>
                </div>
                <div>
                    <h1>Con người là trung tâm của mọi tăng trưởng.</h1>
                    <p>
                        Quản lý hồ sơ, chấm công, nghỉ phép và bảng lương
                        trong một không gian trực quan, bảo mật.
                    </p>
                </div>
                <small>© 2026 HRM System</small>
            </section>

            <section className="login-form-wrap">
                <div className="login-card">
                    <h2>Chào mừng trở lại</h2>
                    <p>Đăng nhập để tiếp tục vào hệ thống quản trị.</p>

                    <form onSubmit={submit}>
                        {error && <div className="login-error">{error}</div>}

                        <div className="mb-3">
                            <label>Tên đăng nhập</label>
                            <input
                                className="form-control"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-3">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </form>

                </div>
            </section>
        </div>
    );
}
