import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ tasks = [] }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const isAdmin = user?.role === "admin";

  // Calculate stats
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCompletedClick = (e) => {
    e.preventDefault();
    setShowCompletedOnly(!showCompletedOnly);
    window.localStorage.setItem("showCompleted", !showCompletedOnly);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 shadow-lg flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">📋 Task Manager</h2>
          <p className="text-gray-400 text-sm">
            {isAdmin ? "Admin Panel" : "Organize your work"}
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-400 mb-1">Logged in as</p>
          <p className="font-semibold text-white text-sm">{user?.name}</p>
          <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
          <span className="inline-block text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 px-2 py-1 rounded">
            {isAdmin ? "👑 Administrator" : "👤 Regular User"}
          </span>
        </div>

        {/* Navigation Section */}
        <div className="border-t border-gray-700 pt-4 mb-6">
          <p className="text-gray-400 text-xs uppercase font-semibold mb-4">Navigation</p>
          <div className="space-y-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
                >
                  📊 Admin Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition text-sm text-gray-400"
                >
                  📈 All Tasks
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
                >
                  📝 My Tasks
                </Link>
                <button
                  onClick={handleCompletedClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition text-sm ${
                    showCompletedOnly
                      ? "bg-green-600 text-white font-medium"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  ✅ Completed Tasks
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {!isAdmin && (
          <div className="border-t border-gray-700 pt-4 mb-6">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-4">Quick Stats</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Tasks:</span>
                <span className="font-semibold text-blue-400 bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
                  {totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Active:</span>
                <span className="font-semibold text-orange-400 bg-orange-900 bg-opacity-30 px-2 py-1 rounded">
                  {activeTasks}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Completed:</span>
                <span className="font-semibold text-green-400 bg-green-900 bg-opacity-30 px-2 py-1 rounded">
                  {completedTasks}
                </span>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="border-t border-gray-700 pt-4 mb-6">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-4">Admin Stats</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Tasks:</span>
                <span className="font-semibold text-blue-400 bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
                  {totalTasks}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Active Users:</span>
                <span className="font-semibold text-purple-400 bg-purple-900 bg-opacity-30 px-2 py-1 rounded">0</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section - Logout Button */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}


