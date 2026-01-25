import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const isAdmin = user?.role === "admin";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        <Link to={dashboardPath} className="flex items-center gap-2 hover:opacity-90">
          <h1 className="text-2xl font-bold">📋 Task Manager</h1>
        </Link>

        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <Link
            to={isAdmin ? "/admin" : "/dashboard"}
            className="hover:text-blue-100 transition font-medium"
          >
            {isAdmin ? "📊 Admin Panel" : "📝 My Tasks"}
          </Link>

          {/* User Info */}
          <div className="border-l border-blue-400 pl-6 flex items-center gap-6">
            <div>
              <p className="text-sm text-blue-100">{user.name}</p>
              <p className="text-xs text-blue-200">
                {isAdmin ? "👑 Admin" : "👤 User"}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

