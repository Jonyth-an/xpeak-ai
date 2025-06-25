import React from 'react';

const cards = [
  {
    icon: <span className="text-4xl">🖼️</span>,
    title: 'Upload a File',
    subtitle: <><span className="text-lg">🖼️</span> <span className="font-bold">Upload a File</span></>,
    desc: 'Menu, homework, guide — turn it into a conversation.',
    button: <button className="w-full bg-[#7ec3e6] hover:bg-[#5bb3e0] text-white font-semibold py-2 rounded-lg mt-4 transition">Upload File</button>,
  },
  {
    icon: <span className="text-4xl">🔗</span>,
    title: 'Add a Website Link',
    subtitle: <><span className="text-lg">🔗</span> <span className="font-bold">Add a Website Link</span></>,
    desc: 'Paste any URL — we\'ll build a speaking session around it.',
    button: <button className="w-full bg-[#19c37d] hover:bg-[#13a76a] text-white font-semibold py-2 rounded-lg mt-4 transition">Paste Link</button>,
  },
  {
    icon: <span className="text-4xl">🎤</span>,
    title: 'Speak About Your Day',
    subtitle: <><span className="text-lg">🎤</span> <span className="font-bold">Speak About Your Day</span></>,
    desc: 'Use your voice or type it out. We\'ll help you express it naturally.',
    button: <button className="w-full bg-[#a259e6] hover:bg-[#8d3fd1] text-white font-semibold py-2 rounded-lg mt-4 transition">Start Recording</button>,
  },
  {
    icon: <span className="text-4xl">✏️</span>,
    title: 'Write a Prompt',
    subtitle: <><span className="text-lg">✏️</span> <span className="font-bold">Write a Prompt</span></>,
    desc: 'Want to talk about a news story or hobby? Type and go.',
    button: <button className="w-full bg-gradient-to-r from-[#ff9900] to-[#ff5e62] hover:from-[#ff7c00] hover:to-[#ff3c3c] text-white font-semibold py-2 rounded-lg mt-4 transition">Write Prompt</button>,
  },
];

export default function TopicGeneratorSection() {
  return (
    <section className="bg-gradient-to-b from-[#eaf2f7] to-[#f6fafd] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-3xl md:text-4xl">🎯</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#14213d]">Design Your Perfect Lesson Topic — Powered by AI</h2>
        </div>
        <p className="text-lg text-[#22304a] mb-12 max-w-2xl mx-auto">
          Start with a real moment, a curiosity, or your own voice. Xpeak will build a custom lesson around it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center min-h-[320px]">
              <div className="mb-4">{card.icon}</div>
              <div className="mb-2 text-lg font-bold text-[#14213d] flex items-center justify-center gap-2">{card.subtitle}</div>
              <div className="text-[#22304a] text-base mb-4">{card.desc}</div>
              {card.button}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 