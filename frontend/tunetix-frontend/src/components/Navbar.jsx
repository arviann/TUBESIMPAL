import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // Cek login dari localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <nav
      style={{
        padding: 16,
        background: "#222",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        Events
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {!token ? (
          // ===============================
          //   NAVBAR SEBELUM LOGIN
          // ===============================
          <>
            <Link
              to="/auth/login"
              style={{ color: "white", textDecoration: "none" }}
            >
              Login
            </Link>

            <Link
              to="/auth/register"
              style={{
                color: "#222",
                background: "white",
                padding: "6px 12px",
                borderRadius: 4,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </>
        ) : (
          // ===============================
          //   NAVBAR SETELAH LOGIN
          // ===============================
          <>
            <span style={{ marginRight: 12 }}>
              👋 Hi, <b>{user.name}</b>
            </span>

            <Link
              to="/me/orders"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid white",
              }}
            >
              My Orders
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: "red",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
