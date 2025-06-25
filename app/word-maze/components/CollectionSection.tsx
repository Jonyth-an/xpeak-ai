import React from 'react'

const sampleWords = [
  { word: 'Serendipity', when: '3 days ago', def: 'The occurrence of events by chance in a happy way.', example: 'Finding this café was true serendipity.', tag: 'Personal' },
  { word: 'Ubiquitous', when: '1 week ago', def: 'Present, appearing, or found everywhere.', example: 'Smartphones are ubiquitous in modern life.', tag: 'Technology' },
  { word: 'Ephemeral', when: '2 weeks ago', def: 'Lasting for a very short time.', example: 'Cherry blossoms are ephemeral.', tag: 'Nature' },
]

export default function CollectionSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl font-semibold text-text mb-4">
        📚 Your Personal Word Collection
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Organized, visual, and always growing—powered by AI context.
      </p>
      <div className="flex justify-center gap-4 mb-8">
        {['Latest Added','Alphabetical','By Topic','Show All'].map((f) => (
          <button key={f} className="px-4 py-2 rounded-full font-medium bg-white border border-border hover:bg-primary-50">
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleWords.map((w) => (
          <div key={w.word} className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xl font-semibold text-text">{w.word}</h4>
              <span className="text-text-secondary text-xs">Added {w.when}</span>
            </div>
            <p className="text-text-secondary text-sm mb-2"><strong>Definition:</strong> {w.def}</p>
            <p className="italic text-text-secondary text-sm mb-3">"{w.example}"</p>
            <span className="bg-primary-100 text-primary rounded-full px-2 py-0.5 text-xs">{w.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
} 