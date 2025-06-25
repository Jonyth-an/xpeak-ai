import React from 'react';

const TopicSuggestionsSection: React.FC = () => {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
          🤖 Smart Suggestions Engine
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
          Behind every topic is a learning algorithm that adapts to your goals, habits, and patterns — so you get topics that make sense for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-token shadow-token p-6">
            <h3 className="text-xl font-semibold text-primary mb-2">📚 Based on Your Level</h3>
            <p className="text-muted">
              We tailor topics to your English fluency — so they're neither too hard nor too boring.
            </p>
          </div>

          <div className="bg-white rounded-token shadow-token p-6">
            <h3 className="text-xl font-semibold text-primary mb-2">📈 Aligned with Your Goals</h3>
            <p className="text-muted">
              Whether you're preparing for an interview or just chatting with locals, our system recommends what works.
            </p>
          </div>

          <div className="bg-white rounded-token shadow-token p-6">
            <h3 className="text-xl font-semibold text-primary mb-2">🌎 Culturally Smart</h3>
            <p className="text-muted">
              Xpeak understands cultural and local nuances — you'll get topics that respect and reflect your background.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopicSuggestionsSection; 