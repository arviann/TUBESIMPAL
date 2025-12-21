import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ SAFE USER PARSING (ANTI PUTIH)
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50">
      {/* BACKGROUND */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">

        {/* GLOW */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-pink-400 blur-3xl opacity-40" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400 blur-3xl opacity-40" />

        {/* GLASS */}
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="px-10 h-20 flex items-center">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 text-2xl font-black tracking-wide text-white hover:scale-105 transition"
            >
              <span className="text-3xl animate-pulse">🎵</span>
              <span className="drop-shadow-lg">TuneTix</span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-4 ml-auto">

              {!user ? (
                <>
                  <NavPrimary to="/auth/login">Login</NavPrimary>
                  <NavPrimary to="/auth/register">Register</NavPrimary>
                </>
              ) : (
                <>
                  {/* ACCOUNT (HI + AVATAR) */}
                  <button
                    onClick={() => navigate("/profile")}
                    className="
                      flex items-center gap-2
                      px-4 py-2 rounded-full
                      bg-white/20 border border-white/30
                      text-white text-sm font-semibold
                      hover:bg-white/30 hover:scale-105
                      transition
                    "
                  >
                    <div className="
                      w-8 h-8 rounded-full
                      bg-gradient-to-br from-pink-400 to-cyan-400
                      flex items-center justify-center
                      text-black font-bold text-xs
                    ">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="hidden lg:inline">
                      Hi, {user.name}
                    </span>
                  </button>

                  {/* MY TICKETS */}
                  <button
                    onClick={() => navigate("/me/orders")}
                    className="
                      px-4 py-2 rounded-full
                      bg-white/15 border border-white/30
                      text-white text-sm font-semibold
                      hover:bg-white/25 hover:scale-105
                      transition
                    "
                  >
                    🎟 My Tickets
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="
                      px-4 py-2 rounded-full
                      bg-red-500 text-white text-sm font-bold
                      hover:bg-red-600 hover:scale-105
                      transition
                    "
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-3xl text-white ml-auto"
            >
              ☰
            </button>
          </div>

          {/* MOBILE MENU */}
          {open && (
            <div className="md:hidden px-8 py-6 space-y-4 bg-white/10 backdrop-blur-xl">
              {!user ? (
                <>
                  <MobileNav to="/auth/login">Login</MobileNav>
                  <MobileNav to="/auth/register">Register</MobileNav>
                </>
              ) : (
                <>
                  <MobileNav to="/profile">👤 My Account</MobileNav>
                  <MobileNav to="/me/orders">🎟 My Tickets</MobileNav>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl bg-red-500 text-white text-base font-bold"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ================= BUTTONS ================= */

function NavPrimary({ to, children }) {
  return (
    <Link
      to={to}
      className="
        px-5 py-2 rounded-full
        bg-white/20 hover:bg-white/30
        text-white text-sm font-bold
        transition
      "
    >
      {children}
    </Link>
  );
}

function MobileNav({ to, children }) {
  return (
    <Link
      to={to}
      className="
        block w-full py-3 rounded-xl
        text-center bg-white/20
        text-white text-base font-semibold
        hover:bg-white/30
        transition
      "
    >
      {children}
    </Link>
  );
}
