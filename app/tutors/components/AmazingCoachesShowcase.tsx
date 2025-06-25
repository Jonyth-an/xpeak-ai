import React from 'react';
import TutorCard from './TutorCard';

const filterTabs = [
  'All Coaches',
  'Business English',
  'IELTS Prep',
  'Conversation',
  'Tech English',
  'Medical English',
];

const moreCoaches = [
  {
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
    name: 'Jamal',
    flag: '🇺🇸',
    location: 'USA',
    background: 'Tech background meets teaching passion!',
    tags: ['Tech English', 'Supportive'],
    rating: 4.8,
    reviews: 94,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    name: 'Lindiwe',
    flag: '🇿🇦',
    location: 'South Africa',
    background: 'Every mistake is a stepping stone!',
    tags: ['IELTS Prep', 'Encouraging'],
    rating: 4.9,
    reviews: 116,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    name: 'Jack',
    flag: '🇨🇦',
    location: 'Canada',
    background: 'Great stories make great speakers!',
    tags: ['Conversation', 'Storytelling'],
    rating: 4.8,
    reviews: 112,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    name: 'Sophie',
    flag: '🇦🇺',
    location: 'Australia',
    background: 'Clear communication saves lives!',
    tags: ['Medical English', 'Clear'],
    rating: 4.9,
    reviews: 89,
  },
];

export default function AmazingCoachesShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Meet Some of Our Amazing Coaches
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Xpeak tutors aren't just fluent — they're mentors, motivators, and fellow learners in their own journeys. Get to know a few of our standout coaches.
          </p>
        </div>
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filterTabs.map((tab, idx) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-full font-semibold border transition-colors duration-150 ${idx === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Featured Coach Card */}
        <div className="bg-indigo-50 rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center md:items-stretch gap-8 mb-16">
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center md:w-1/4">
            <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="Emma Thompson" className="w-32 h-32 rounded-full border-4 border-indigo-200 shadow mb-4" />
            <div className="text-lg font-bold text-text flex items-center gap-2 mb-1">Emma Thompson <span className="text-2xl">🇬🇧</span></div>
            <div className="text-sm text-text-secondary mb-1">United Kingdom</div>
            <div className="text-xs text-text-muted mb-2">Former Marketing Manager</div>
            <div className="flex items-center gap-1 text-yellow-500 text-lg mb-1">
              <span>★</span><span>4.9</span>
              <span className="text-text-muted text-sm">(127 reviews)</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">Supportive</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">Goal-Oriented</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">Business Expert</span>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <div className="font-semibold text-text-muted mb-2">Specializations:</div>
              <ul className="flex flex-wrap gap-2 mb-4">
                <li className="bg-white border border-indigo-200 px-3 py-1 rounded-full text-sm">Business English</li>
                <li className="bg-white border border-indigo-200 px-3 py-1 rounded-full text-sm">Job Interviews</li>
                <li className="bg-white border border-indigo-200 px-3 py-1 rounded-full text-sm">Presentation Skills</li>
                <li className="bg-white border border-indigo-200 px-3 py-1 rounded-full text-sm">Professional Writing</li>
              </ul>
              <div className="bg-indigo-100 rounded-lg p-4 mb-4">
                <div className="font-semibold text-indigo-700 mb-1">Availability</div>
                <div className="text-sm text-text-secondary">Timezone: GMT (London)</div>
                <div className="text-sm text-text-secondary">Peak Hours: 9AM – 6PM</div>
                <div className="text-sm text-text-secondary">Weekend: <span className="text-green-600 font-bold">Available ✅</span></div>
              </div>
              <blockquote className="italic text-indigo-800 border-l-4 border-indigo-400 pl-4 mb-2">
                "Emma helped me prepare for my job interview at a multinational company. Her business English coaching was spot-on, and I got the job!"
                <br />
                <span className="not-italic text-text-muted">— Sarah M., Marketing Professional</span>
              </blockquote>
            </div>
            <button className="mt-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition">Book with Emma</button>
          </div>
        </div>
        {/* More Amazing Coaches Grid */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {moreCoaches.map((coach, idx) => (
            <TutorCard
              key={idx}
              avatar={coach.avatar}
              name={coach.name}
              flag={coach.flag}
              location={coach.location}
              background={coach.background}
              tags={coach.tags}
              rating={coach.rating}
              reviews={coach.reviews}
            />
          ))}
        </div>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
            Browse All English Tutors
          </button>
          <button className="px-8 py-4 text-lg font-semibold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
            Book a Trial Lesson
          </button>
        </div>
      </div>
    </section>
  );
} 