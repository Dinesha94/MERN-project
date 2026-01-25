import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function CompletedTasks() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCompletedTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      const completed = res.data.filter((t) => t.completed);
      setCompletedTasks(completed);
      setError("");
    } catch (err) {
      setError("Failed to load completed tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setCompletedTasks(completedTasks.filter((t) => t._id !== taskId));
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">✅ Completed Tasks</h1>
                <p className="text-gray-600 mt-2">
                  Total completed: <span className="font-semibold text-green-600">{completedTasks.length}</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/admin")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Back to Admin Dashboard
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Loading completed tasks...</p>
              </div>
            ) : completedTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">No completed tasks yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-6 border border-green-200 bg-green-50 rounded-lg hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {task.description || "No description"}
                    </p>

                    <div className="space-y-3 text-sm border-t border-green-200 pt-3">
                      {/* Created By */}
                      <div>
                        <p className="text-gray-600 text-xs font-semibold mb-1">Completed By</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {getUserInitials(task.user?.name || "U")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs">
                              {task.user?.name}
                            </p>
                            <p className="text-gray-500 text-xs">{task.user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assigned To */}
                      {task.assignedTo && task.assignedTo.length > 0 ? (
                        <div>
                          <p className="text-gray-600 text-xs font-semibold mb-1">Assigned To</p>
                          <div className="flex flex-wrap gap-2">
                            {task.assignedTo.map((assignee) => (
                              <div
                                key={assignee._id}
                                className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-purple-200"
                              >
                                <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {getUserInitials(assignee?.name || "U")}
                                </div>
                                <span className="font-semibold text-gray-800 text-xs">
                                  {assignee?.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Dates */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Created: {formatDate(task.createdAt)}</span>
                        {task.assignedDate && <span>Assigned: {formatDate(task.assignedDate)}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletedTasks;
