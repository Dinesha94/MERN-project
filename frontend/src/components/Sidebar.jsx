import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ tasks = [] }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  // Sync state with localStorage (important)
  useEffect(() => {
    const syncState = () => {
      setShowCompletedOnly(
        window.localStorage.getItem("showCompleted") === "true"
      );
    };

    syncState();
    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  // Task stats
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Completed Tasks toggle
  const handleCompletedClick = () => {
    const newValue = !showCompletedOnly;
    setShowCompletedOnly(newValue);
    window.localStorage.setItem("showCompleted", newValue);
    window.dispatchEvent(new Event("storage"));
  };

  // ✅ My Tasks → back to dashboard + reset completed state
  const handleMyTasksClick = () => {
    setShowCompletedOnly(false);
    window.localStorage.setItem("showCompleted", "false");
    window.dispatchEvent(new Event("storage"));
    navigate("/dashboard");
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

        {/* User Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-400 mb-1">Logged in as</p>
          <p className="font-semibold text-white text-sm">{user?.name}</p>
          <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
          <span className="inline-block text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 px-2 py-1 rounded">
            {isAdmin ? "👑 Administrator" : "👤 Regular User"}
          </span>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-700 pt-4 mb-6">
          <p className="text-gray-400 text-xs uppercase font-semibold mb-4">
            Navigation
          </p>

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
                  to="/admin/completed-tasks"
                  className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition text-sm text-gray-400"
                >
                  ✅ Completed Tasks
                </Link>
              </>
            ) : (
              <>
                {/* ✅ My Tasks */}
                <button
                  onClick={handleMyTasksClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium ${
                    !showCompletedOnly
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  📝 My Tasks
                </button>

                {/* ✅ Completed Tasks */}
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

        {/* Stats */}
        {!isAdmin && (
          <div className="border-t border-gray-700 pt-4 mb-6">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-4">
              Quick Stats
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Tasks:</span>
                <span className="font-semibold text-blue-400 bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
                  {totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active:</span>
                <span className="font-semibold text-orange-400 bg-orange-900 bg-opacity-30 px-2 py-1 rounded">
                  {activeTasks}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completed:</span>
                <span className="font-semibold text-green-400 bg-green-900 bg-opacity-30 px-2 py-1 rounded">
                  {completedTasks}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
