import React from 'react'

export default function BulkAddSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-text mb-3">
          Learned a bunch of words? Add them all at once.
        </h2>
        <p className="text-text-muted text-sm mb-4">
          Paste one word per line—or separate them with commas. We'll check spelling and save the rest.
        </p>
        <textarea
          rows={4}
          className="bg-white border border-border rounded-lg p-4 w-full mb-4 focus:outline-none focus:ring focus:border-primary"
          placeholder={`serendipity\nubiquitous\nephemeral`}
        />
        <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-3 px-6 font-semibold shadow-token">
          + Add Words to My Maze
        </button>
        <button className="w-full bg-white border border-primary text-primary rounded-lg py-3 px-6 font-semibold mt-2 shadow-token hover:bg-primary/5">
          Add to Word Maze
        </button>
      </div>
    </section>
  )
} 