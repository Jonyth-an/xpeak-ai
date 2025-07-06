import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Puzzle, Users, Globe } from 'lucide-react';

const stats = [
  { number: '1M+', label: 'Sparks Ignited', icon: <Sparkles className="w-6 h-6" /> },
  { number: '500K+', label: 'Maze Nodes Unlocked', icon: <Puzzle className="w-6 h-6" /> },
  { number: '2M+', label: 'AI + Human Tutor Minutes', icon: <Users className="w-6 h-6" /> },
  { number: '130+', label: 'Countries', icon: <Globe className="w-6 h-6" /> },
];

const testimonials = [
  {
    quote: 'It feels like I have a personal guide who actually remembers me.',
    author: 'Mei, Study Abroad Student',
  },
  {
    quote: 'The Word Maze got me hooked. But it\'s the Sparks that keep me growing.',
    author: 'Luca, Startup Founder',
  },
  {
    quote: 'Finally, a learning platform that connects everything together.',
    author: 'Sofia, Language Teacher',
  },
];

export default function TrustedByLearnersSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="p-token-20 bg-gradient-to-r from-token-primary to-token-secondary">
      <div className="container-xl mx-auto px-token-4">
        <div className="max-w-6xl mx-auto text-token-center">
          <motion.h2
            className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-inverse mb-token-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Trusted by Learners in 130+ Countries
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-token-8 mb-token-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-token-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-token-inverse/20 rounded-full flex items-center justify-center mx-auto mb-token-4 text-token-inverse">
                  {stat.icon}
                </div>
                <div className="text-token-display-md md:text-token-display-lg font-token-bold text-token-inverse mb-token-2">{stat.number}</div>
                <div className="text-token-inverse/80 font-token-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-token-body-xl text-token-inverse/80 mb-token-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Real-world learners, real-world results
          </motion.p>

          {/* Testimonial Carousel */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-token-inverse/10 backdrop-blur-sm rounded-2xl p-token-8 border border-token-inverse/20"
              >
                <blockquote className="text-token-heading-xl md:text-token-display-md font-token-medium text-token-inverse mb-token-6 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-token-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-token-warning fill-current" />
                    ))}
                  </div>
                  <span className="text-token-inverse/80 font-token-medium ml-token-4">— {testimonials[currentTestimonial].author}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-token-2 mt-token-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-base ${
                    currentTestimonial === index ? 'bg-token-inverse' : 'bg-token-inverse/30'
                  }`}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 