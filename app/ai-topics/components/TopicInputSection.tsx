import React from 'react';

export default function TopicInputSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-2">
          <span role="img" aria-label="target">🎯</span> Design Your Perfect Lesson Topic — Powered by AI
        </h2>
        <p className="text-lg text-text-muted">
          Learning on Xpeak starts with you. Create a topic tailored to your goals, life, or curiosity — and we'll turn it into your next smart session.
        </p>
      </div>

      {/* Co‐Create Input Layout: Chat + Options */}
      <div className="max-w-5xl mx-auto space-y-12 mb-12">
        {/* 1. Chat & Generate (full width) */}
        <div className="bg-white rounded-token shadow-token p-6">
          <h3 className="font-semibold text-text mb-4">💬 Chat & Generate</h3>
          <textarea
            rows={5}
            placeholder="Type or chat here to co-create your lesson topic…"
            className="w-full bg-white border border-border rounded-lg p-4 focus:outline-none focus:ring focus:border-primary mb-4"
          />
          <button className="px-5 py-2 bg-primary text-white rounded-lg shadow-token w-full">
            🔍 Generate Topic
          </button>
        </div>

        {/* 3. Option Cards (upload, link, speak) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Upload File */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
              <i className="fas fa-file-image text-2xl text-blue-500"></i>
            </div>
            <h4 className="font-bold text-text mb-2">🖼️ Upload a File</h4>
            <p className="text-text-muted text-sm mb-6">
              Menu, homework, guide — turn it into a conversation.
            </p>
            <button className="w-full py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-semibold transition">
              Upload File
            </button>
          </div>

          {/* Add a Website Link */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
              <i className="fas fa-link text-2xl text-green-500"></i>
            </div>
            <h4 className="font-bold text-text mb-2">🔗 Add a Website Link</h4>
            <p className="text-text-muted text-sm mb-6">
              Paste any URL — we'll build a speaking session around it.
            </p>
            <button className="w-full py-2 bg-green-400 hover:bg-green-500 text-white rounded-lg font-semibold transition">
              Paste Link
            </button>
          </div>

          {/* Speak About Your Day */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-purple-100">
              <i className="fas fa-microphone text-2xl text-purple-500"></i>
            </div>
            <h4 className="font-bold text-text mb-2">🗣️ Speak About Your Day</h4>
            <p className="text-text-muted text-sm mb-6">
              Use your voice or type it out. We'll help you express it naturally.
            </p>
            <button className="w-full py-2 bg-purple-400 hover:bg-purple-500 text-white rounded-lg font-semibold transition">
              Start Recording
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 