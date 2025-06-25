import React from 'react';

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$89",
      lessons: "6 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Starter",
      highlight: false,
    },
    {
      name: "Growth",
      price: "$159",
      lessons: "12 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Growth",
      highlight: true,
    },
    {
      name: "Pro",
      price: "$219",
      lessons: "18 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Pro",
      highlight: false,
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text mb-2">Choose Your Plan</h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Whether you're just starting out or leveling up, we've got a plan for you — all powered<br />by our full AI learning suite.
          </p>
        </div>

        {/* Trial Box */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-3xl">🎁</span>
            <div>
              <span className="text-xl font-bold text-yellow-700">Paid Trial Pack</span>
              <ul className="list-none mt-2 text-text-secondary text-sm">
                <li className="flex items-center gap-2 mb-1"><span className="text-green-500">✔</span>1 Lesson (30 mins)</li>
                <li className="flex items-center gap-2 mb-1"><span className="text-green-500">✔</span>Try any tutor on the platform</li>
                <li className="flex items-center gap-2 mb-1"><span className="text-green-500">✔</span>Full access to all AI features</li>
                <li className="flex items-center gap-2"><span className="text-blue-400">ⓘ</span>Up to 3 trial packs per user</li>
              </ul>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-3xl font-bold text-yellow-600 mb-1">$12</div>
            <div className="text-sm text-text-secondary mb-2">One-time purchase, no auto-renew</div>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition mb-2">Try Now</button>
            <div className="text-xs text-text-secondary">Perfect for testing the waters before you commit</div>
          </div>
        </div>

        {/* Billing Switch */}
        <div className="flex justify-center gap-2 mb-10 text-sm font-medium">
          <button className="bg-primary-600 text-white px-5 py-1 rounded-full shadow-sm">Monthly</button>
          <button className="bg-gray-100 text-text-secondary px-5 py-1 rounded-full hover:bg-primary-50 transition">Quarterly <span className="text-green-600 font-semibold">Save 10%</span></button>
          <button className="bg-gray-100 text-text-secondary px-5 py-1 rounded-full hover:bg-primary-50 transition">Yearly <span className="text-green-600 font-semibold">Save 20%</span></button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={idx} className={`rounded-2xl p-6 bg-surface-muted shadow-md border-2 flex flex-col items-center ${plan.highlight ? 'border-primary-500 ring-2 ring-primary-400 relative z-10' : 'border-border'}`}>
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-block bg-primary-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-text mb-2 mt-4">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-primary-600 mb-1">{plan.price}</p>
              <p className="text-sm text-text-secondary mb-4">{plan.lessons}<br />Billed monthly</p>
              <ul className="text-sm text-text-secondary mb-6 space-y-2 w-full">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-green-500">✔</span>{f}</li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg text-sm font-semibold transition ${plan.highlight ? 'bg-primary-600 text-white hover:bg-primary-700' : 'border border-primary-600 text-primary-600 hover:bg-primary-50'}`}>
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
  