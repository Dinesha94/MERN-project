import { useEffect, useState, useContext } from "react";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
  });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalUsers: 0,
  });
  const [assignModal, setAssignModal] = useState({
    visible: false,
    taskId: null,
    currentAssignee: null,
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all tasks
      const tasksRes = await api.get("/tasks");
      setAllTasks(tasksRes.data);

      // Fetch all users
      const usersRes = await api.get("/users");
      setAllUsers(usersRes.data);

      // Separate completed tasks
      const completed = tasksRes.data.filter((t) => t.completed);
      setCompletedTasks(completed);

      // Calculate stats
      const completedCount = completed.length;
      setStats({
        totalTasks: tasksRes.data.length,
        completedTasks: completedCount,
        totalUsers: usersRes.data.length,
      });

      setError("");
    } catch (err) {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/tasks", {
        title: formData.title,
        description: formData.description,
      });
      
      // If a member was selected, assign the task
      if (formData.assignedTo) {
        await api.put(`/tasks/${res.data._id}`, {
          assignedTo: formData.assignedTo,
        });
      }

      // Reset form
      setFormData({ title: "", description: "", assignedTo: "" });
      
      // Refresh tasks
      await fetchAllData();
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setAllTasks(allTasks.filter((t) => t._id !== taskId));
        await fetchAllData();
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const handleAssignTask = async (taskId, assignedToId) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { assignedTo: assignedToId });
      setAllTasks(allTasks.map((t) => (t._id === taskId ? res.data : t)));
      setAssignModal({ visible: false, taskId: null, currentAssignee: null });
      await fetchAllData();
    } catch (err) {
      setError("Failed to assign task");
    }
  };

  const handleUnassignTask = async (taskId) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { assignedTo: null });
      setAllTasks(allTasks.map((t) => (t._id === taskId ? res.data : t)));
      setAssignModal({ visible: false, taskId: null, currentAssignee: null });
      await fetchAllData();
    } catch (err) {
      setError("Failed to unassign task");
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Logged in as <span className="font-semibold text-blue-600">👑 {user?.name}</span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Tasks</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalTasks}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Tasks</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Task</h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter task title"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter task description"
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign To Member
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedTo: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select a member (optional)</option>
                      {allUsers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Add Task
                  </button>
                </form>
              </div>
            </div>

            {/* Middle Column - All Tasks */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">All Tasks</h2>
                {loading ? (
                  <p className="text-center text-gray-600 py-8">Loading tasks...</p>
                ) : allTasks.filter((t) => !t.completed).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending tasks</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allTasks
                      .filter((t) => !t.completed)
                      .map((task) => (
                        <div
                          key={task._id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {task.title}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {task.description || "No description"}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              ⏳ Pending
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Created By</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {getUserInitials(task.user?.name || "U")}
                                </div>
                                <span className="font-semibold text-gray-800">
                                  {task.user?.name}
                                </span>
                              </div>
                            </div>

                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-gray-600 text-xs">Assigned To</p>
                              {task.assignedTo ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {getUserInitials(task.assignedTo?.name || "U")}
                                  </div>
                                  <span className="font-semibold text-gray-800">
                                    {task.assignedTo?.name}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-xs mt-1">Unassigned</p>
                              )}
                            </div>
                          </div>

                          {task.assignedDate && (
                            <p className="text-gray-500 text-xs mb-3">
                              Assigned on: {formatDate(task.assignedDate)}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setAssignModal({
                                  visible: true,
                                  taskId: task._id,
                                  currentAssignee: task.assignedTo?._id,
                                })
                              }
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completed Tasks Section */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ✅ Completed Tasks ({completedTasks.length})
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No completed tasks yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 border border-green-200 bg-green-50 rounded-lg"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {task.description || "No description"}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Completed By</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {getUserInitials(task.user?.name || "U")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {task.user?.name}
                            </p>
                            <p className="text-gray-500 text-xs">{task.user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {task.assignedTo && (
                        <div>
                          <p className="text-gray-600 text-xs">Assigned To</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {getUserInitials(task.assignedTo?.name || "U")}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {task.assignedTo?.name}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {formatDate(task.assignedDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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

          {/* Assignment Modal */}
          {assignModal.visible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Assign Task</h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleAssignTask(assignModal.taskId, user._id)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition ${
                        assignModal.currentAssignee === user._id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                          {getUserInitials(user.name)}
                        </div>
                        <div>
                          <span className="block font-semibold text-gray-800">
                            {user.name}
                          </span>
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  {assignModal.currentAssignee && (
                    <button
                      onClick={() => handleUnassignTask(assignModal.taskId)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Unassign
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setAssignModal({ visible: false, taskId: null, currentAssignee: null })
                    }
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
