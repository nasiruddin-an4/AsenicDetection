import React, { useState } from "react";

export default function ArsenicDetectLanding({
  onNavigateToRegister,
  onNavigateToLogin,
}) {
  const [isHovering, setIsHovering] = useState(false);

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
            <p className="text-sm text-gray-600">
              Image-based Arsenic Detection
            </p>
          </div>

          <nav>
            <ul className="flex space-x-6 text-gray-700 font-medium">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="hover:text-emerald-600"
                >
                  Home
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateToLogin}
                  className="hover:text-emerald-600 bg-none border-none cursor-pointer"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToRegister}
                  className="hover:text-emerald-600 bg-none border-none cursor-pointer"
                >
                  Register
                </button>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-600">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-600">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <h2 className="text-5xl font-bold leading-tight text-gray-900">
              Advanced{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Arsenic Detection
              </span>{" "}
              Through Image Processing
            </h2>

            <p className="text-xl text-gray-600">
              Upload your water sample image and get instant detection using our
              deep learning model.
            </p>

            <button
              className="group relative w-fit px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={onNavigateToLogin}
            >
              <div className="flex items-center space-x-2">
                <span>Get Started</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isHovering ? "translate-x-1" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Right - Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative h-72 w-full max-w-md bg-gradient-to-b from-blue-100 to-emerald-50 rounded-3xl shadow-xl border border-white/40 flex items-center justify-center">
              <img
                src="/sample-water-test.png"
                alt="Water sample"
                className="w-56 opacity-90 animate-pulse"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-8 mt-20 pt-20 border-t border-white/30">
          {[
            { number: "25K+", label: "Images Analyzed" },
            { number: "95%", label: "Model Accuracy" },
            { number: "120+", label: "User Countries" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <p className="text-lg text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative z-10 bg-white/70 backdrop-blur-md py-20 border-t border-white/20"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "📸",
                title: "Capture Image",
                text: "Take a clean photo of the water test strip.",
              },
              {
                icon: "⬆️",
                title: "Upload Image",
                text: "Upload safely to our secure server.",
              },
              {
                icon: "🧠",
                title: "AI Analysis",
                text: "Deep learning model processes the image.",
              },
              {
                icon: "📊",
                title: "Get Results",
                text: "See accurate arsenic levels instantly.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">Contact Us</h2>

          <form className="grid gap-6">
            <input
              type="text"
              placeholder="Your Name"
              className="p-4 bg-white/70 backdrop-blur rounded-xl shadow-md focus:outline-none"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="p-4 bg-white/70 backdrop-blur rounded-xl shadow-md focus:outline-none"
            />

            <textarea
              placeholder="Your Message"
              className="p-4 h-32 bg-white/70 backdrop-blur rounded-xl shadow-md focus:outline-none"
            />

            <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-white/20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-gray-600">
            © 2025 ArsenicDetect. All rights reserved.
          </p>

          <div className="flex space-x-4 text-xl text-gray-700">
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </footer>

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
