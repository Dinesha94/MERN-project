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
      console.log("Fetching tasks...");
      const res = await api.get("/tasks");
      console.log("Tasks received:", res.data);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Listen for storage changes from sidebar
  useEffect(() => {
    const handleStorageChange = () => {
      const completed = window.localStorage.getItem("showCompleted") === "true";
      setShowCompleted(completed);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Filter tasks based on completion status
  const displayedTasks = showCompleted
    ? tasks.filter((task) => task.completed)
    : tasks;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar tasks={tasks} />
        <div className="flex-1 px-6 py-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {showCompleted ? "✅ Completed Tasks" : "📝 My Tasks"}
              </h1>
              {showCompleted && (
                <button
                  onClick={() => {
                    setShowCompleted(false);
                    window.localStorage.setItem("showCompleted", false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Back to All Tasks
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Loading your tasks...</p>
              </div>
            ) : (
              <>
                {!showCompleted && <TaskForm fetchTasks={fetchTasks} />}
                <TaskList tasks={displayedTasks} fetchTasks={fetchTasks} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
