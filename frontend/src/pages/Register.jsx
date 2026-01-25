import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
      console.log("Register response:", res.data);
      // After successful registration, redirect to login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-xl shadow-2xl w-96"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6">Join Task Manager</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          required
        />

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Your Role
          </label>
          <div className="space-y-3">
            {/* User Role */}
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" 
                   style={{borderColor: formData.role === "user" ? "#3b82f6" : "#e5e7eb"}}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={formData.role === "user"}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="ml-3">
                <span className="block font-semibold text-gray-800">👤 Regular User</span>
                <span className="text-sm text-gray-600">Create and manage your tasks</span>
              </span>
            </label>

            {/* Admin Role */}
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition hover:bg-purple-50"
                   style={{borderColor: formData.role === "admin" ? "#a855f7" : "#e5e7eb"}}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 cursor-pointer"
              />
              <span className="ml-3">
                <span className="block font-semibold text-gray-800">👑 Administrator</span>
                <span className="text-sm text-gray-600">Manage all users and tasks</span>
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
