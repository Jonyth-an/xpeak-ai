// app/home/components/WhatMakesDifferent.tsx

export default function WhatMakesDifferent() {
    const features = [
      {
        title: "AI-Powered, Not AI-Only",
        emoji: "💡",
        bg: "bg-indigo-100",
        description:
          "Xpeak's AI listens, learns, and evolves with you. Because the best language adventure isn't off-the-shelf — it's handpicked for who you are.",
      },
      {
        title: "Your Language Coach, Not Just a Native Speaker",
        emoji: "🎓",
        bg: "bg-accent-light",
        description:
          "Our tutors are mentors, motivators, and your personal guide. They bring empathy and real-world experience to every session — making your learning journey more human.",
      },
      {
        title: "🧭 Word Maze: The Smart Learning Engine",
        emoji: "🧭",
        bg: "bg-sky-100",
        description:
          "Find your way through language. More than a word list — it's your AI-powered compass. Every lesson, every word connects back to your learning journey.",
      },
      {
        title: "Chart Your Journey. Celebrate Your Growth.",
        emoji: "📈",
        bg: "bg-green-100",
        description:
          "Your learning path is no longer a mystery. Every session moves you forward — from new words to big wins. Track your path, earn flags, and watch your skills unfold like a living map.",
      },
      {
        title: "Speak the Language of Now",
        emoji: "💬",
        bg: "bg-rose-100",
        description:
          "No more outdated dialogues. Xpeak brings you timely, trending topics — from global news to local slang. Learn the words people are using today.",
      },
    ];
  
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Makes Xpeak Different
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className={`${item.bg} rounded-xl p-6 text-center shadow-sm`}
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  