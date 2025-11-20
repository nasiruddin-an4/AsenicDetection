import React, { useState, useEffect } from "react";

export default function AdminDashboard({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [trainingStats, setTrainingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
      let statsData = null;
      try {
        const statsRes = await fetch("http://localhost:8000/stats");
        if (statsRes.ok) {
          statsData = await statsRes.json();
        }
      } catch (e) {
        console.warn("Stats fetch failed:", e);
      }

      // Fetch users
      let usersData = [];
      try {
        const usersRes = await fetch("http://localhost:8000/users");
        if (usersRes.ok) {
          usersData = await usersRes.json();
        }
      } catch (e) {
        console.warn("Users fetch failed:", e);
      }

      // Fetch predictions
      let predictionsData = [];
      try {
        const predictionsRes = await fetch("http://localhost:8000/predictions");
        if (predictionsRes.ok) {
          predictionsData = await predictionsRes.json();
        }
      } catch (e) {
        console.warn("Predictions fetch failed:", e);
      }

      // Fetch training stats
      let trainingData = null;
      try {
        const trainingRes = await fetch("http://localhost:8000/training-stats");
        if (trainingRes.ok) {
          trainingData = await trainingRes.json();
        }
      } catch (e) {
        console.warn("Training stats fetch failed:", e);
      }

      setStats(statsData);
      setUsers(usersData || []);
      setPredictions(predictionsData || []);
      setTrainingStats(trainingData);
      
      if (!statsData && !usersData.length && !predictionsData.length && !trainingData) {
        setError("Unable to connect to server. Make sure the backend is running on http://localhost:8000");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatConfidence = (conf) => {
    return typeof conf === "number" ? (conf * 100).toFixed(1) : (conf).toFixed(1);
  };

  const handleRetrain = async () => {
    try {
      const response = await fetch("http://localhost:8000/retrain", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        alert("Model retrained successfully!");
        fetchAllData();
      }
    } catch (err) {
      alert("Error retraining model: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    onBackToHome();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animation-delay-2000 animate-blob"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-white/30 shadow-md mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "📊 Overview", icon: "overview" },
            { id: "users", label: "👥 Users", icon: "users" },
            { id: "predictions", label: "📋 All Predictions", icon: "predictions" },
            { id: "training", label: "🧠 Model & Training", icon: "training" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-3 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Connection Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchAllData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                >
                  🔄 Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Total Users</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                <p className="text-sm text-gray-500 mt-2">Registered users</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Total Predictions</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total_predictions}</p>
                <p className="text-sm text-gray-500 mt-2">Analysis performed</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Infected Samples</h3>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v1m-9-14h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">{stats.infected_count}</p>
                <p className="text-sm text-gray-500 mt-2">Positive results</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Infection Rate</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12a4 4 0 11-8 0 4 4 0 018 0zM0 8C0 3.58 3.58 0 8 0s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.infection_rate}%</p>
                <p className="text-sm text-gray-500 mt-2">Of all predictions</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Healthy Samples</span>
                  <span className="text-lg font-bold text-green-600">{stats.healthy_count}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Average per User</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats.total_users > 0 ? (stats.total_predictions / stats.total_users).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Model Status</span>
                  <span className="text-lg font-bold text-emerald-600">✓ Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Users</h2>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Predictions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userPredictionCount = predictions.filter((p) => p.user_id === user.id).length;
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-900">{user.id}</td>
                          <td className="py-3 px-4 text-gray-900 font-medium">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(user.created_at)}</td>
                          <td className="py-3 px-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {userPredictionCount}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No users registered yet</p>
              </div>
            )}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === "predictions" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Predictions</h2>
            {predictions.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {predictions.map((pred, index) => (
                  <div
                    key={pred.id || index}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Result</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              pred.result === "infected" ? "bg-red-500" : "bg-green-500"
                            }`}
                          ></div>
                          <p
                            className={`font-bold capitalize ${
                              pred.result === "infected" ? "text-red-700" : "text-green-700"
                            }`}
                          >
                            {pred.result === "infected" ? "⚠️ Infected" : "✅ Healthy"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Confidence</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatConfidence(pred.confidence)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">User ID</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {pred.user_id || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">File</p>
                        <p className="text-sm font-mono text-gray-700 mt-1 truncate">
                          {pred.filename}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">Timestamp</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(pred.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No predictions yet</p>
              </div>
            )}
          </div>
        )}

        {/* Training & Model Tab */}
        {activeTab === "training" && trainingStats && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Infected Training Images</h3>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">{trainingStats.infected_count}</p>
                <p className="text-sm text-gray-500 mt-2">Images in training set</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Healthy Training Images</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{trainingStats.healthy_count}</p>
                <p className="text-sm text-gray-500 mt-2">Images in training set</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Total Training Data</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">{trainingStats.total_training_images}</p>
                <p className="text-sm text-gray-500 mt-2">Total images</p>
              </div>
            </div>

            {/* Model Status */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Model Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div>
                    <p className="text-lg font-bold text-green-700">✓ Model Ready</p>
                    <p className="text-sm text-green-600">
                      {trainingStats.model_ready
                        ? "All required training data is available"
                        : "Additional training data needed"}
                    </p>
                  </div>
                  <div className="text-3xl">{trainingStats.model_ready ? "✅" : "⚠️"}</div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 font-semibold mb-2">Training Distribution:</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600">Infected Class:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${
                                trainingStats.total_training_images > 0
                                  ? (trainingStats.infected_count / trainingStats.total_training_images) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-blue-700 font-bold">
                          {trainingStats.total_training_images > 0
                            ? ((trainingStats.infected_count / trainingStats.total_training_images) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600">Healthy Class:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                trainingStats.total_training_images > 0
                                  ? (trainingStats.healthy_count / trainingStats.total_training_images) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-blue-700 font-bold">
                          {trainingStats.total_training_images > 0
                            ? ((trainingStats.healthy_count / trainingStats.total_training_images) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRetrain}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Retrain Model</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
