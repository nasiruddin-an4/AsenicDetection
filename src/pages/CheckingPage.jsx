import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Upload, Image, AlertTriangle, CheckCircle2, Clock, LogOut, ArrowLeft,
  Leaf, Beaker, History, X, Plus, RefreshCw, Camera, Sparkles, ShieldCheck,
  Droplets, Sun
} from "lucide-react";

export default function CheckingPage({ onBackToHome }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("analyze");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name || "User");
    fetchPredictions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    onBackToHome();
  };

  const fetchPredictions = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://localhost:8000/predictions?user_id=${userId}`);
      
      let data = [];
      if (response.ok) {
        data = await response.json();
      } else {
        const res = await supabase
          .from("predictions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (res.error) throw res.error;
        data = res.data || [];
      }

      // Ensure every record has a proper filename
      const cleaned = data.map(item => ({
        ...item,
        image_path: item.image_path && item.image_path.trim() !== "" 
          ? item.image_path 
          : `plant_analysis_${new Date(item.created_at || Date.now()).toISOString().slice(0,10)}.jpg`
      }));

      setPredictions(cleaned);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load history");
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

  const handleFileChange = (e) => handleImageSelect(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageSelect(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };

  const handlePredict = async () => {
    if (!selectedImage) return;
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(`http://localhost:8000/predict?user_id=${userId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Prediction failed");
      const result = await response.json();

      const now = new Date().toISOString();

      // Save with real filename
      await supabase.from("predictions").insert({
        image_path: selectedImage.name || `image_${Date.now()}.jpg`,
        result: result.result,
        confidence: result.confidence,
        created_at: now,
      });

      setPrediction({
        result: result.result,
        confidence: result.confidence,
        message: result.message,
        checkedAt: now,
        imageName: selectedImage.name || "Uploaded Image"
      });

      fetchPredictions();
    } catch (err) {
      console.error(err);
      setError("Analysis failed");
      setPrediction({
        result: "error",
        confidence: 0,
        message: "Could not analyze image",
        checkedAt: new Date().toISOString(),
        imageName: selectedImage?.name || "Unknown"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatConfidence = (conf) => {
    const p = typeof conf === "string" ? parseFloat(conf) : conf || 0;
    return (p > 1 ? p : p * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ArsenicGuard AI
              </h1>
              <p className="text-sm text-gray-600">Hello, {userName}!</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onBackToHome} className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition">
              <ArrowLeft className="w-5 h-5" /> Back Home
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition shadow-md">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-200/50 p-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab("analyze")} className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all ${activeTab === "analyze" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Camera className="w-5 h-5" /> Analyze Plant
                </button>
                <button onClick={() => setActiveTab("history")} className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all ${activeTab === "history" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}>
                  <History className="w-5 h-5" /> History
                </button>
              </div>
            </div>

            {/* Analyze Tab */}
            {activeTab === "analyze" && (
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-200/50 p-10">
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Upload className="w-7 h-7 text-emerald-600" /> Upload Plant Image
                  </h2>

                  <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragOver ? "border-emerald-500 bg-emerald-50/70" : "border-gray-300 hover:border-emerald-400"}`}
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />

                    {previewUrl ? (
                      <div className="space-y-6">
                        <div className="relative inline-block">
                          <img src={previewUrl} alt="Preview" className="max-h-96 mx-auto rounded-2xl shadow-2xl object-cover border-4 border-emerald-200" />
                          <button onClick={resetForm} className="absolute top-4 right-4 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-lg font-medium text-gray-700 break-all">{selectedImage?.name || "image.jpg"}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full flex items-center justify-center">
                          <Image className="w-10 h-10 text-emerald-700" />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">Drop image or click to upload</p>
                        <p className="text-gray-600">JPG, PNG, WebP • Max 10MB</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button onClick={handlePredict} disabled={!selectedImage || isLoading}
                      className={`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${!selectedImage || isLoading ? "bg-gray-200 text-gray-500" : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:scale-105"}`}>
                      {isLoading ? <><RefreshCw className="w-6 h-6 animate-spin" /> Analyzing...</> : <><Sparkles className="w-6 h-6" /> Start Analysis</>}
                    </button>
                    {selectedImage && <button onClick={resetForm} className="px-8 py-5 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 flex items-center gap-3">
                      <X className="w-6 h-6" /> Clear
                    </button>}
                  </div>
                </div>

                {/* Result */}
                {prediction && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-10">
                    <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                      <Beaker className="w-8 h-8 text-emerald-600" /> Analysis Result
                    </h3>
                    <div className={`rounded-3xl p-10 border-4 ${prediction.result === "infected" ? "bg-red-50 border-red-400" : "bg-emerald-50 border-emerald-400"}`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${prediction.result === "infected" ? "bg-red-200" : "bg-emerald-200"}`}>
                          {prediction.result === "infected" ? <AlertTriangle className="w-10 h-10 text-red-600" /> : <CheckCircle2 className="w-10 h-10 text-emerald-600" />}
                        </div>
                        <div>
                          <h4 className={`text-4xl font-bold ${prediction.result === "infected" ? "text-red-800" : "text-emerald-800"}`}>
                            {prediction.result === "infected" ? "Arsenic Detected" : "Healthy Plant"}
                          </h4>
                          <p className="text-3xl font-bold mt-4 text-gray-800">
                            {formatConfidence(prediction.confidence)}% Confidence
                          </p>
                          {prediction.message && <p className="mt-4 text-lg italic text-gray-700">{prediction.message}</p>}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-300/50 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600">Checked on</p>
                          <p className="text-lg font-semibold">{formatDateTime(prediction.checkedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={resetForm} className="mt-10 w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-3">
                      <Plus className="w-6 h-6" /> Analyze Another Plant
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* History Tab - Clean & Professional */}
            {activeTab === "history" && (
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-200/50 p-8">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                  <History className="w-8 h-8 text-emerald-600" /> Analysis History
                </h2>

                {predictions.length > 0 ? (
                  <div className="space-y-5 max-h-96 overflow-y-auto">
                    {predictions.map((pred) => (
                      <div key={pred.id} className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 border transition-all">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex items-start gap-5">
                            {pred.result === "infected" ? (
                              <AlertTriangle className="w-10 h-10 text-red-500 mt-1" />
                            ) : (
                              <CheckCircle2 className="w-10 h-10 text-emerald-500 mt-1" />
                            )}
                            <div>
                              <p className="text-2xl font-bold">
                                {pred.result === "infected" ? "Arsenic Detected" : "Healthy Plant"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 break-all font-medium">
                                {pred.image_path}
                              </p>
                              <p className="text-lg font-semibold text-gray-700 mt-2">
                                {formatConfidence(pred.confidence)}% Confidence
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                              <Clock className="w-5 h-5" />
                              <span className="text-sm font-medium">Checked</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                              {formatDateTime(pred.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Clock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <p className="text-xl font-semibold text-gray-600">No history yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8" /> Pro Tips
              </h3>
              <ul className="space-y-5 text-lg">
                {["Clear, bright lighting", "Focus on leaves", "Avoid shadows", "Close-up shots work best"].map((tip, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        .animate-blob { animation: blob 20s infinite; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}