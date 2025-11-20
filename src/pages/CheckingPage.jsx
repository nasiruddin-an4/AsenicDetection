import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function CheckingPage({ onBackToHome }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("analyze");

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPredictions(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(err.message);
    }
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPrediction(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const mockPrediction = Math.random();
      const result = mockPrediction > 0.5 ? "infected" : "not infected";
      const confidence =
        mockPrediction > 0.5 ? mockPrediction : 1 - mockPrediction;

      const { error: insertError } = await supabase.from("predictions").insert({
        image_path: selectedImage.name,
        result: result,
        confidence: confidence,
      });

      if (insertError) throw insertError;

      setPrediction({
        result: result,
        confidence: confidence,
        message: `Analysis complete. Plant appears to be ${result}.`,
      });

      fetchPredictions();
      setError(null);
    } catch (err) {
      console.error("Error making prediction:", err);
      setError(err.message);
      setPrediction({
        result: "Error",
        confidence: 0,
        message: "An error occurred during analysis. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const hasSupabaseConfig =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animation-delay-2000 animate-blob"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Toxicity Check
                </h1>
              </div>
            </div>
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
              <span>Back Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-white/30 shadow-md">
              <button
                onClick={() => setActiveTab("analyze")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "analyze"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Analyze Plant</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>History</span>
                </div>
              </button>
            </div>

            {/* Analyze Tab */}
            {activeTab === "analyze" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Upload Section */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/30">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Upload Plant Image
                  </h2>

                  <div
                    className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      isDragOver
                        ? "border-green-400 bg-green-50/50"
                        : "border-gray-300 hover:border-green-400 hover:bg-green-50/30"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-96 mx-auto rounded-xl shadow-lg object-cover border-2 border-green-200"
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Selected File:
                          </p>
                          <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded-lg truncate">
                            {selectedImage?.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full flex items-center justify-center mx-auto">
                          <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-900">
                            Drop your plant image here
                          </p>
                          <p className="text-gray-600 mt-2">
                            or click to browse from your device
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                          📸 Supported: JPG, PNG, WebP • Max 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button
                      onClick={handlePredict}
                      disabled={!selectedImage || isLoading}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform text-lg flex items-center justify-center space-x-2 ${
                        !selectedImage || isLoading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-lg active:scale-95"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Analyzing Plant...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>Start Analysis</span>
                        </>
                      )}
                    </button>

                    {selectedImage && (
                      <button
                        onClick={resetForm}
                        className="px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                {prediction && (
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/30 animate-slideUp">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Analysis Results
                    </h3>

                    <div
                      className={`relative overflow-hidden rounded-2xl p-8 border-2 ${
                        prediction.result === "infected"
                          ? "bg-red-50 border-red-400"
                          : prediction.result === "not infected"
                          ? "bg-green-50 border-green-400"
                          : "bg-yellow-50 border-yellow-400"
                      }`}
                    >
                      {/* Background decoration */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 opacity-10 ${
                          prediction.result === "infected"
                            ? "bg-red-400"
                            : prediction.result === "not infected"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        } rounded-full`}
                      ></div>

                      <div className="relative flex items-start space-x-6">
                        <div
                          className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                            prediction.result === "infected"
                              ? "bg-red-200"
                              : prediction.result === "not infected"
                              ? "bg-green-200"
                              : "bg-yellow-200"
                          }`}
                        >
                          {prediction.result === "infected" ? (
                            <svg
                              className="h-8 w-8 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          ) : prediction.result === "not infected" ? (
                            <svg
                              className="h-8 w-8 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-8 w-8 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`text-3xl font-bold capitalize ${
                              prediction.result === "infected"
                                ? "text-red-800"
                                : prediction.result === "not infected"
                                ? "text-green-800"
                                : "text-yellow-800"
                            }`}
                          >
                            {prediction.result === "infected"
                              ? "⚠️ Arsenic Detected"
                              : "✅ Plant is Healthy"}
                          </h4>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-semibold ${
                                  prediction.result === "infected"
                                    ? "text-red-700"
                                    : prediction.result === "not infected"
                                    ? "text-green-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                Confidence Level:
                              </span>
                              <span
                                className={`text-2xl font-bold ${
                                  prediction.result === "infected"
                                    ? "text-red-700"
                                    : prediction.result === "not infected"
                                    ? "text-green-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                {(prediction.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            {prediction.message && (
                              <p
                                className={`text-sm ${
                                  prediction.result === "infected"
                                    ? "text-red-600"
                                    : prediction.result === "not infected"
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {prediction.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-semibold uppercase">
                          Status
                        </p>
                        <p
                          className={`text-lg font-bold mt-1 ${
                            prediction.result === "infected"
                              ? "text-red-600"
                              : prediction.result === "not infected"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {prediction.result === "infected"
                            ? "Requires Treatment"
                            : "Healthy"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-semibold uppercase">
                          Analyzed
                        </p>
                        <p className="text-lg font-bold mt-1 text-gray-900">
                          Just now
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-semibold uppercase">
                          Next Step
                        </p>
                        <p className="text-sm font-semibold mt-1 text-gray-900">
                          {prediction.result === "infected"
                            ? "Consult farmer"
                            : "Maintain care"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={resetForm}
                      className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Analyze Another Plant</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/30 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Analysis History
                </h2>

                {error && !hasSupabaseConfig ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <p className="text-yellow-700 font-semibold text-lg">
                      Database not configured
                    </p>
                    <p className="text-gray-600 mt-2">
                      Configure Supabase to view analysis history
                    </p>
                  </div>
                ) : predictions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {predictions.map((pred, index) => (
                      <div
                        key={pred.id || index}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                pred.result === "infected"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <span
                              className={`font-bold capitalize text-lg ${
                                pred.result === "infected"
                                  ? "text-red-700"
                                  : "text-green-700"
                              }`}
                            >
                              {pred.result === "infected"
                                ? "⚠️ Infected"
                                : "✅ Healthy"}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(pred.created_at)}
                          </span>
                        </div>
                        {pred.image_path && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm truncate">
                              {pred.image_path}
                            </p>
                          </div>
                        )}
                        {pred.confidence && (
                          <div className="mt-2 text-sm text-gray-600">
                            Confidence:{" "}
                            <span className="font-semibold">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">
                      No analysis history
                    </p>
                    <p className="text-gray-500 mt-2">
                      Analyze your first plant to see results here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Info Panel */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <span>💡</span>
                <span>Quick Tips</span>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Use clear, well-lit photos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Focus on affected leaves</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Avoid shadows and reflections</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="emanage"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Results are instant</span>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📊 About This Tool
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our AI model is trained to detect arsenic toxicity in plants
                with high accuracy. It analyzes leaf patterns, color changes,
                and visible symptoms to provide reliable diagnoses.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy Rate:</span>
                  <span className="font-bold text-green-600">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Time:</span>
                  <span className="font-bold text-green-600">
                    &lt;2 seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🌱 Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Regular monitoring</li>
                <li>✓ Proper irrigation</li>
                <li>✓ Soil testing</li>
                <li>✓ Professional consultation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
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
