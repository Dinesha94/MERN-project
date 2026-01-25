import { useEffect, useState } from "react";
import api from "../../api";
import Sidebar from "../../components/Sidebar";
import TaskTable from "../../components/TaskTable";
import TaskForm from "../../components/TaskForm";

export default function UserDashboard() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex">
      <Sidebar role="user" />

      <div className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>

        <TaskForm fetchTasks={fetchTasks} />
        <TaskTable tasks={tasks} userActions fetchTasks={fetchTasks} />
      </div>
    </div>
  );
}
