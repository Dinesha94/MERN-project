import api from "../api";
import { useState } from "react";

function TaskList({ tasks, fetchTasks }) {
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting task");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      await api.put(`/tasks/${id}`, { completed: !completed });
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || "Error updating task");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Tasks</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No tasks yet. Create one to get started! 🚀
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 rounded-lg border-l-4 transition ${
                task.completed
                  ? "bg-gray-50 border-green-500 opacity-75"
                  : "bg-blue-50 border-blue-500"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => handleToggle(task._id, task.completed)}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-lg ${
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task._id)}
                  disabled={deleting === task._id}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {deleting === task._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
