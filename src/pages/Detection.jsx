import React, { useState, useEffect } from "react";

export default function Detection({ onBackToHome }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [trainingStats, setTrainingStats] = useState(null);

  // Load user email and analysis history on mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email || "User");

    const saved = localStorage.getItem("arsenicAnalysisHistory");
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse analysis history:", e);
        setAnalysisHistory([]);
      }
    }

    // Fetch training stats
    fetchTrainingStats();
  }, []);

  const fetchTrainingStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/training-stats");
      const data = await response.json();
      setTrainingStats(data);
    } catch (err) {
      console.error("Error fetching training stats:", err);
    }
  };

  // Save analysis history to localStorage (without image data)
  const saveToLocalStorage = (newAnalysis) => {
    // Create a version without the imageUrl to save space
    const analysisToStore = {
      id: newAnalysis.id,
      timestamp: newAnalysis.timestamp,
      fileName: newAnalysis.fileName,
      result: newAnalysis.result,
      confidence: newAnalysis.confidence,
      message: newAnalysis.message,
      recommendation: newAnalysis.recommendation,
    };
    
    const updated = [newAnalysis, ...analysisHistory]; // Keep full data in memory
    setAnalysisHistory(updated);
    
    // Keep only last 20 analyses in localStorage to avoid quota issues
    const storedAnalyses = updated.slice(0, 20).map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      fileName: a.fileName,
      result: a.result,
      confidence: a.confidence,
      message: a.message,
      recommendation: a.recommendation,
    }));
    
    try {
      localStorage.setItem("arsenicAnalysisHistory", JSON.stringify(storedAnalyses));
    } catch (e) {
      console.warn("LocalStorage quota exceeded, clearing old data");
      localStorage.removeItem("arsenicAnalysisHistory");
      localStorage.setItem("arsenicAnalysisHistory", JSON.stringify(storedAnalyses.slice(0, 10)));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      
      const analysis = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name,
        imageUrl: preview,
        result: data.result,
        confidence: data.confidence,
        message: data.message,
        recommendation: data.recommendation,
      };

      setResult(analysis);
      saveToLocalStorage(analysis);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || "Failed to analyze image. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    onBackToHome();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              ArsenicDetect
            </h1>
            <p className="text-sm text-gray-600">Image-based Arsenic Detection</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">👤 {userEmail}</span>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Recent Analyses - Moved to top */}
        {analysisHistory.length > 0 && (
          <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Recent Analyses</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {analysisHistory.slice(0, 8).map((analysis) => (
                <div
                  key={analysis.id}
                  className={`rounded-xl p-4 border ${
                    analysis.result === "infected"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className="text-xs text-gray-600 mb-2">
                    {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mb-3 truncate font-medium">{analysis.fileName}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      analysis.result === "infected"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {analysis.result === "infected" ? "⚠️ INFECTED" : "✅ HEALTHY"}
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    {analysis.confidence}% confidence
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Stats */}
        {trainingStats && (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-sm font-medium">Model Status</p>
              <p className={`text-lg font-bold mt-2 ${trainingStats.model_ready ? 'text-green-600' : 'text-yellow-600'}`}>
                {trainingStats.model_ready ? '✅ Ready' : '⚠️ Training'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {trainingStats.total_training_images} training images
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-sm font-medium">Infected Samples</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{trainingStats.infected_count}</p>
            </div>

            <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-lg rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-sm font-medium">Healthy Samples</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{trainingStats.healthy_count}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Sample Image
            </h2>
            <p className="text-gray-600 mb-6">
              Upload a water sample image to check if it's infected with arsenic
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* File Upload Area */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-emerald-300 rounded-2xl cursor-pointer hover:border-emerald-500 transition bg-white/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-12 h-12 text-emerald-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-xl border border-white/30"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>

          {/* Results Section */}
          <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Analysis Result</h2>

            {result ? (
              <div className="space-y-4">
                {/* Result Badge */}
                <div
                  className={`p-8 rounded-2xl border-2 text-center ${
                    result.result === "infected"
                      ? "bg-red-50 border-red-300"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  <p className="text-6xl font-bold mb-3">
                    {result.result === "infected" ? "⚠️" : "✅"}
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      result.result === "infected"
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {result.result === "infected" ? "INFECTED" : "NOT INFECTED"}
                  </p>
                </div>

                {/* Confidence */}
                <div className="bg-white/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Confidence Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.confidence}%
                  </p>
                </div>

                {/* Confidence Bar */}
                <div className="bg-white/50 p-4 rounded-xl">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        result.result === "infected"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-white/50 p-4 rounded-xl">
                  <p className="text-gray-900 font-medium text-lg">{result.message}</p>
                </div>

                {/* Recommendation */}
                <div className="bg-white/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Recommendation</p>
                  <p className="text-gray-900 font-medium">
                    {result.recommendation}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500">
                  Analyzed: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                <p className="text-center">Upload an image to see analysis results</p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-8 mt-12">
            {/* This section is now at the top - left empty */}
          </div>
        )}
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
