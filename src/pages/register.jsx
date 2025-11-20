import React, { useState } from "react";

export default function Register({ onBackToHome, onNavigateToLogin, onNavigateToDetection }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch(
        `http://localhost:8000/register?email=${formData.email}&password=${formData.password}&name=${formData.name}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (response.ok) {
        // Save user info to localStorage
        localStorage.setItem("userName", formData.name);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("isAdmin", false);
        onNavigateToDetection();
      } else {
        setErrorMsg(data.detail || "Registration failed");
      }
    } catch (error) {
      setErrorMsg("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 relative">

      {/* background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Create Account
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Register to start detecting arsenic levels using AI.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-gray-700 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-2 p-4 bg-white/80 backdrop-blur rounded-xl shadow-md focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 p-4 bg-white/80 backdrop-blur rounded-xl shadow-md focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-2 p-4 bg-white/80 backdrop-blur rounded-xl shadow-md focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Already have an account?
          <button
            onClick={onNavigateToLogin}
            className="text-emerald-600 font-semibold ml-1 hover:underline bg-none border-none cursor-pointer"
          >
            Login
          </button>
        </p>

        <button
          onClick={onBackToHome}
          className="w-full mt-4 py-2 text-gray-600 font-medium rounded-xl hover:bg-white/50 transition bg-none border-none cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>
    </div>
  );
}
