import React from 'react';

const features = [
  {
    key: 'word-maze',
    bg: 'bg-sky-100',
    icon: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-surface-muted rounded-full p-4 mb-4 shadow-md">
          <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-sky-700 font-semibold mb-1 shadow">Travel → Journey → Adventure</div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-sky-700 font-semibold shadow">Food → Cuisine → Delicious</div>
      </div>
    ),
    title: 'Word Maze',
    subtitle: 'Your Compass Through the Language Maze',
    description: 'No more boring flashcards or word drills. Word Maze is your intelligent guide through the language jungle — helping you absorb, remember, and actually use new words. It adapts to your interests, lessons, and goals — making vocab part of your everyday voice.'
  },
  {
    key: 'progress-tracker',
    bg: 'bg-green-100',
    icon: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-surface-muted rounded-full p-4 mb-4 shadow-md">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <div className="w-40 bg-surface-muted rounded-lg px-4 py-2 mb-2 shadow">
          <div className="flex justify-between text-xs text-text-secondary font-semibold mb-1">
            <span>Vocabulary</span><span>85%</span>
          </div>
          <div className="w-full h-2 bg-green-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="w-40 bg-surface-muted rounded-lg px-4 py-2 shadow">
          <div className="flex justify-between text-xs text-text-secondary font-semibold mb-1">
            <span>Speaking</span><span>72%</span>
          </div>
          <div className="w-full h-2 bg-green-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>
    ),
    title: 'Progress Tracker',
    subtitle: 'Your Language Journey, Made Visible',
    description: 'Whether you\'re learning for work, travel, or personal growth — Progress Tracker shows you how far you\'ve come. Visual charts, milestones, and smart stats keep you on course, wherever you\'re headed.'
  },
  {
    key: 'ai-topic-generator',
    bg: 'bg-indigo-100',
    icon: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-surface-muted rounded-full p-4 mb-4 shadow-md">
          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4h-1" />
          </svg>
        </div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-indigo-700 font-semibold mb-1 shadow">
          <div>Today's Topic</div>
          <div>Sustainable Travel Tips</div>
        </div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-indigo-700 font-semibold shadow">
          <div>Based on your interest in</div>
          <div>Environment + Travel</div>
        </div>
      </div>
    ),
    title: 'AI Topic Generator',
    subtitle: 'Fresh Topics, Just for You',
    description: 'Every lesson builds on what you\'ve learned and connects to your interests, skill level, and the words you\'ve already learned. Our AI generates conversation topics that build on what came before — helping you go deeper, not just wider, on your language journey.'
  },
  {
    key: 'speaking-practice',
    bg: 'bg-orange-100',
    icon: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-surface-muted rounded-full p-4 mb-4 shadow-md">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-6m0 0V4m0 10l-3-3m3 3l3-3" />
          </svg>
        </div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-orange-700 font-semibold mb-1 shadow">Listening...</div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-green-700 font-semibold shadow">
          <div>✔ Great pronunciation!</div>
          <div>Try: "I'm excited about..."</div>
        </div>
      </div>
    ),
    title: 'Speaking Practice & AI Feedback Loop',
    subtitle: 'Talk Smarter, Not Just More',
    description: 'Every time you speak, Xpeak listens — and learns with you. Our AI gives real-time, actionable feedback on pronunciation, grammar, pacing, and fluency — so you\'re not just practicing, you\'re improving. Combine that with expert coaching to turn every mistake into momentum.'
  },
  {
    key: 'language-coach',
    bg: 'bg-pink-100',
    icon: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-surface-muted rounded-full p-4 mb-4 shadow-md">
          <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4l-3-3m3 3l3-3" />
          </svg>
        </div>
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Coach" className="w-12 h-12 rounded-full border-2 border-pink-400 mb-2 shadow" />
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-pink-700 font-semibold mb-1 shadow">
          <div>Your Coach: Sarah</div>
          <div className="font-normal">Next session: Tomorrow 9PM</div>
        </div>
        <div className="bg-surface-muted rounded-lg px-4 py-2 text-xs text-green-700 font-semibold shadow">"Great job this week!" 🎉</div>
      </div>
    ),
    title: 'Language Coach',
    subtitle: 'From Native Speaker to Trusted Guide',
    description: 'Speaking with a native speaker is one thing — growing with a real coach is another. At Xpeak, our coaches help you stay motivated, focused, and confident. They don\'t just chat — they guide, cheer you on, and build a journey with you. Because real progress happens when you\'re supported every step of the way.'
  }
];

export default function MasterySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-2">
            Next-Gen Language Mastery
          </h2>
          <p className="text-lg text-text-muted">
            AI-Optimized, Human-Guided, Real-World Ready
          </p>
          <p className="text-md text-text-muted mt-2">
            Learn faster and stay motivated through smart tools + real coaching.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((item) => (
            <div key={item.key} className={`rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch ${item.bg} p-8 md:p-10`}>
              {/* Visual/Icon Side */}
              <div className="flex-shrink-0 flex items-center justify-center md:w-1/3 mb-6 md:mb-0 md:mr-8">
                {item.icon}
              </div>
              {/* Text Side */}
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-text mb-1">{item.title}</h3>
                <p className="text-text-secondary text-base leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
  