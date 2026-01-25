import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/user/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompletedTasks from "./pages/admin/CompletedTasks";

function App() {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            token
              ? isAdmin
                ? <Navigate to="/admin" />
                : <Navigate to="/dashboard" />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            token
              ? isAdmin
                ? <Navigate to="/admin" />
                : <Navigate to="/dashboard" />
              : <Register />
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            token && !isAdmin
              ? <Dashboard />
              : token && isAdmin
              ? <Navigate to="/admin" />
              : <Navigate to="/login" />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            token && isAdmin
              ? <AdminDashboard />
              : token && !isAdmin
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

        {/* Completed Tasks Page */}
        <Route
          path="/admin/completed-tasks"
          element={
            token && isAdmin
              ? <CompletedTasks />
              : token && !isAdmin
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                token
                  ? isAdmin
                    ? "/admin"
                    : "/dashboard"
                  : "/login"
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
