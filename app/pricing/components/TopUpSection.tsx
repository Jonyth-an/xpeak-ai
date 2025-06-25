import React from 'react';

const packs = [
  {
    lessons: '10 Lessons',
    price: '$199',
    subtitle: 'Perfect for consistent learners',
    expires: 'Expires in 3 months',
    popular: false,
  },
  {
    lessons: '20 Lessons',
    price: '$369',
    subtitle: 'Most popular choice for serious learners',
    expires: 'Expires in 6 months',
    popular: true,
  },
  {
    lessons: '50 Lessons',
    price: '$899',
    subtitle: 'Ultimate package for dedicated learners',
    expires: 'Expires in 12 months',
    popular: false,
  },
];

export default function TopUpSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">
            ➕ Top-Up Lesson Packs <span className="text-text-secondary">(Coming Soon)</span>
          </h2>
          <p className="text-text-muted">
            Flexible learning on your terms. Buy lessons in advance and use them whenever you're ready to learn.
          </p>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {packs.map((pack) => (
            <div
              key={pack.lessons}
              className={`relative bg-white rounded-2xl shadow-md p-6 flex flex-col ${
                pack.popular ? 'border-2 border-primary-600' : 'border border-border'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Best Value
                </span>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text mb-2">{pack.lessons}</h3>
                <div className="text-2xl font-bold text-primary-600 mb-2">{pack.price}</div>
                <p className="text-sm text-text-muted mb-4">{pack.subtitle}</p>
                <p className="text-xs text-text-secondary mb-6">{pack.expires}</p>
              </div>
              <button
                className="mt-auto py-2 px-4 font-semibold rounded-lg bg-white text-gray-400 border border-gray-300 cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Panel */}
        <div className="bg-blue-50 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-6">
            <span className="inline-block bg-primary-100 rounded-full p-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
            </span>
            <h4 className="text-xl font-semibold text-text mt-2">Flexible Learning, Your Way</h4>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-text-secondary mb-6">
            <li className="flex items-center">
              <span className="inline-block bg-primary-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 2v10" /></svg>
              </span>
              Use anytime before expiry
            </li>
            <li className="flex items-center">
              <span className="inline-block bg-primary-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              Choose any tutor for each lesson
            </li>
            <li className="flex items-center">
              <span className="inline-block bg-primary-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </span>
              Book lessons at your convenience
            </li>
            <li className="flex items-center">
              <span className="inline-block bg-primary-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12v1a8 8 0 11-16 0v-1m16 0a8 8 0 01-16 0m16 0V7a2 2 0 00-2-2H6a2 2 0 00-2 2v5" /></svg>
              </span>
              Bonus lessons with larger packs
            </li>
          </ul>
          <div className="bg-white rounded-lg p-4 border border-border text-center">
            <span className="text-lg">🚀</span>{' '}
            <span className="font-semibold text-text">
              This feature will be available post-MVP
            </span>
            <p className="text-sm text-text-muted mt-1">
              Join our waitlist to be notified when top-up packs launch!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 