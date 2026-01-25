import api from "../api";

export default function TaskTable({ tasks, userActions, fetchTasks }) {
  return (
    <table className="w-full bg-white rounded shadow mt-4">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-3 text-left">Title</th>
          <th>Status</th>
          {userActions && <th>Actions</th>}
        </tr>
      </thead>

      <tbody>
        {tasks.map((task) => (
          <tr key={task._id} className="border-t">
            <td className="p-3">{task.title}</td>
            <td>{task.completed ? "✅ Done" : "⏳ Pending"}</td>

            {userActions && (
              <td>
                <button
                  onClick={async () => {
                    await api.put(`/tasks/${task._id}`);
                    fetchTasks();
                  }}
                >
                  Toggle
                </button>

                <button
                  onClick={async () => {
                    await api.delete(`/tasks/${task._id}`);
                    fetchTasks();
                  }}
                  className="ml-2 text-red-600"
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
