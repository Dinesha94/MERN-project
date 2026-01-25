import { useEffect, useState, useContext, useRef } from "react";
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
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: [],
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMemberDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/tasks", {
        title: formData.title,
        description: formData.description,
      });
      
      // If members were selected, assign the task
      if (formData.assignedTo.length > 0) {
        await api.put(`/tasks/${res.data._id}`, {
          assignedTo: formData.assignedTo,
        });
      }

      // Reset form
      setFormData({ title: "", description: "", assignedTo: [] });
      
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
      const task = allTasks.find(t => t._id === taskId);
      let assignedToList = task.assignedTo || [];
      
      // Toggle assignment
      if (assignedToList.some(a => a._id === assignedToId)) {
        assignedToList = assignedToList.filter(a => a._id !== assignedToId);
      } else {
        assignedToList.push(assignedToId);
      }
      
      const res = await api.put(`/tasks/${taskId}`, { assignedTo: assignedToList });
      setAllTasks(allTasks.map((t) => (t._id === taskId ? res.data : t)));
      setAssignModal({ visible: false, taskId: null, currentAssignee: null });
      await fetchAllData();
    } catch (err) {
      setError("Failed to assign task");
    }
  };

  const handleUnassignTask = async (taskId) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { assignedTo: [] });
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

                  <div ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign To Members
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className="text-gray-700">
                        {formData.assignedTo.length === 0
                          ? "Select members (optional)"
                          : `${formData.assignedTo.length} member${formData.assignedTo.length !== 1 ? "s" : ""} selected`}
                      </span>
                      <span className={`transition ${showMemberDropdown ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    
                    {showMemberDropdown && (
                      <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="max-h-48 overflow-y-auto">
                          {allUsers.map((member) => (
                            <label
                              key={member._id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={formData.assignedTo.includes(member._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      assignedTo: [...formData.assignedTo, member._id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      assignedTo: formData.assignedTo.filter(id => id !== member._id),
                                    });
                                  }
                                }}
                                className="w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-sm">{member.name}</p>
                                <p className="text-gray-500 text-xs">{member.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
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
                              {task.assignedTo && task.assignedTo.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {task.assignedTo.map((assignee) => (
                                    <div key={assignee._id} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-purple-200">
                                      <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {getUserInitials(assignee?.name || "U")}
                                      </div>
                                      <span className="font-semibold text-gray-800 text-xs">
                                        {assignee?.name}
                                      </span>
                                    </div>
                                  ))}
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

                          <p className="text-gray-500 text-xs mb-3">
                            Created on: {formatDate(task.createdAt)}
                          </p>

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

          {/* Assignment Modal */}
          {assignModal.visible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Assign Task to Members</h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allUsers.map((user) => {
                    const task = allTasks.find(t => t._id === assignModal.taskId);
                    const isAssigned = task?.assignedTo?.some(a => a._id === user._id);
                    return (
                      <button
                        key={user._id}
                        onClick={() => handleAssignTask(assignModal.taskId, user._id)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition ${
                          isAssigned
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                            isAssigned
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}>
                            {isAssigned && <span className="text-white text-xs">✓</span>}
                          </div>
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
                    );
                  })}
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
