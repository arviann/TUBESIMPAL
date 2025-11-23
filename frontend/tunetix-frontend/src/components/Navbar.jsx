import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <nav className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-xl font-bold hover:text-white/80 transition-colors"
        >
         🎵 TuneTix
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-3">
          {!token ? (
            <>
              {/* Sebelum Login */}
              <Link
                to="/auth/login"
                className="px-3 py-1 rounded-lg bg-white text-pink-600 font-semibold hover:bg-white/90 transition-colors"
              >
                Login
              </Link>

              <Link
                to="/auth/register"
                className="px-3 py-1 rounded-lg bg-white text-pink-600 font-semibold hover:bg-white/90 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {/* Setelah Login */}
              <span className="hidden sm:inline-block mr-3">
                👋 Hi, <b>{user.name}</b>
              </span>

              <Link
                to="/me/orders"
                className="px-3 py-1 rounded-lg bg-white text-pink-600 font-semibold hover:bg-white/90 transition-colors"
              >
                My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg bg-white text-pink-600 font-semibold hover:bg-white/90 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
