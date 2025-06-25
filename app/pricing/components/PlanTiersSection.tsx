import React from 'react';

const plans = [
  {
    name: 'Starter',
    lessons: '6 Lessons / month',
    price: '$89',
    popular: false,
  },
  {
    name: 'Growth',
    lessons: '12 Lessons / month',
    price: '$159',
    popular: true,
  },
  {
    name: 'Pro',
    lessons: '18 Lessons / month',
    price: '$219',
    popular: false,
  },
];

export default function PlanTiersSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Billing toggle */}
        <div className="flex justify-center space-x-4 mb-12">
          {['Monthly', 'Quarterly', 'Yearly'].map((label, idx) => (
            <button
              key={label}
              className={`px-4 py-2 rounded-full font-medium transition ${
                idx === 0
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-md p-6 flex flex-col ${
                plan.popular
                  ? 'border-2 border-primary-600'
                  : 'border border-border'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-text mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {plan.price}
              </div>
              <p className="text-sm text-text-muted mb-6">{plan.lessons}</p>

              <ul className="flex-1 space-y-2 mb-6 text-text-muted">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>1-on-1 sessions
                  with top-rated tutors
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Full AI feature
                  access
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Flexible lesson
                  scheduling
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Cancel anytime
                </li>
              </ul>

              <button
                className={`mt-auto px-6 py-3 font-semibold rounded-lg transition ${
                  plan.popular
                    ? 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50'
                    : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Billing note */}
        <p className="text-center text-sm text-text-secondary mt-8">
          💳 Available in Monthly, Quarterly (Save 10%), or Yearly (Save 20%) billing options — all auto-renew.
        </p>
      </div>
    </section>
  );
} 