import { useEffect, useState } from "react";
import api from "../../api";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Listen for sidebar toggle (completed tasks)
  useEffect(() => {
    const handleStorageChange = () => {
      const completed =
        window.localStorage.getItem("showCompleted") === "true";
      setShowCompleted(completed);
    };

    handleStorageChange(); // initial sync
    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  const displayedTasks = showCompleted
    ? tasks.filter((task) => task.completed)
    : tasks;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {error && (
        <div className="px-6 mt-4">
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Loading your tasks...</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 px-6 ${
            showCompleted
              ? "grid-cols-[260px_1fr]"
              : "grid-cols-[260px_1fr_1fr]"
          }`}
        >
          {/* Sidebar (always aligned to top) */}
          <Sidebar tasks={tasks} />

          {/* Task Form (hidden on completed tasks page) */}
          {!showCompleted && (
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <TaskForm fetchTasks={fetchTasks} />
            </div>
          )}

          {/* Task List */}
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <TaskList
              tasks={displayedTasks}
              fetchTasks={fetchTasks}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
