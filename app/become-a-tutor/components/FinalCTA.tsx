import React from 'react';

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
];

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
        Join a Global Community of Coaches
      </h2>
      <p className="text-lg text-white mb-10">
        Meet fellow language lovers. Share knowledge. Grow together.
      </p>
      <div className="flex justify-center gap-8 mb-10">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Coach avatar"
            className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
          />
        ))}
      </div>
      <a
        href="/become-a-tutor"
        className="px-10 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl shadow transition hover:bg-gray-100 focus:outline-none"
      >
        Become a Tutor
      </a>
    </section>
  );
} 