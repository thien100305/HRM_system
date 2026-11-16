function Navbar() {

    const logout = () => {

        localStorage.removeItem("token");

        window.location.href = "/";
    };

    return (

        <nav className="navbar navbar-dark bg-dark">

            <div className="container-fluid">

                <span className="navbar-brand">

                    HRM Management

                </span>

                <button
                    className="btn btn-danger"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;