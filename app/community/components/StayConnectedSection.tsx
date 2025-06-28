import React from 'react';

export default function StayConnectedSection() {
  return (
    <section id="stay-connected" className="py-12 bg-white text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Connected</h2>
        <p className="mb-6 text-gray-600">
          Love being part of the journey? Don't miss an update—subscribe to our newsletter or join our community!
        </p>
        
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          <a 
            href="/subscribe" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Subscribe via Email
          </a>
          <button 
            className="inline-block border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => alert('Community platform coming soon! We\'re setting up the best way for everyone to connect.')}
          >
            Join Community
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-gray-600">
            <strong>Community Update:</strong> We're currently setting up our community platform. 
            We're considering Slack, Discord, or a dedicated community platform. 
            Subscribe to our newsletter to be notified when it's ready!
          </p>
        </div>
      </div>
    </section>
  );
} 