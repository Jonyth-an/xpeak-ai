"use client";

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button, Card, Badge } from '@/app/components/ui';
import FAQAccordion from '@/app/components/molecules/FAQAccordion';
import { HelpCircle, ArrowRight, Globe, Users, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supportTiers = [
  { name: 'Starter', give: 20, get: 40, color: 'from-blue-500 to-blue-400', circle: 'bg-gradient-to-r from-blue-500 to-blue-400', border: 'border-blue-200', text: 'text-blue-600' },
  { name: 'Explorer', give: 50, get: 100, color: 'from-purple-500 to-purple-400', circle: 'bg-gradient-to-r from-purple-500 to-purple-400', border: 'border-purple-400', text: 'text-purple-600', popular: true },
  { name: 'Champion', give: 100, get: 200, color: 'from-emerald-500 to-emerald-400', circle: 'bg-gradient-to-r from-emerald-500 to-emerald-400', border: 'border-emerald-200', text: 'text-emerald-600' },
];

const faqs = [
  {
    question: 'Why not raise VC money?',
    answer: "We might — later. But right now, we want to stay focused, move fast, and listen only to the people who matter most: our users."
  },
  {
    question: 'Where Does the Money Go?',
    answer: "100% of funds go toward building the product — no personal profit. Monthly updates of where every dollar goes (infra, design, dev tools, etc.)"
  },
  {
    question: 'Can I get a refund?',
    answer: "Yes! Just reach out before the public launch and we'll refund you — no hard feelings."
  },
  {
    question: "Will I lose my credit if I don't use it immediately?",
    answer: "Nope. You'll have it waiting when we launch. Credit never expires."
  },
  {
    question: 'Will this actually help?',
    answer: "Yes. $20 might not seem like much, but it keeps our AI running and helps shape the product with fewer distractions (and less VC drama 😅)."
  },
  {
    question: 'When will I receive my credits?',
    answer: "Your bonus credits will be added automatically at launch. You'll also get early access before anyone else."
  },
  {
    question: 'Can I support more than once?',
    answer: "Yes! You legend. Your support tiers and credits will be added together."
  },
  {
    question: 'Can I donate anonymously?',
    answer: "Absolutely. You can choose how your name appears — or not at all."
  },
];

const mockSupporters = [
  { name: 'Luna B.', country: '🇯🇵 Japan', amount: 50, date: 'June 4' },
  { name: 'Pedro R.', country: '🇧🇷 Brazil', amount: 20, date: 'June 3' },
  { name: '"TalkToMeAI"', country: '🌍 Global', amount: 100, date: 'June 3' },
  { name: 'Anna S.', country: '🇩🇪 Germany', amount: 30, date: 'June 2' },
  { name: 'Chen W.', country: '🇨🇳 China', amount: 40, date: 'June 1' },
];
const totalSupporters = 5;
const totalAmount = mockSupporters.reduce((sum, s) => sum + s.amount, 0);

const countryToRegion: Record<string, string> = {
  // APAC
  '🇯🇵': 'APAC', '🇨🇳': 'APAC', '🇰🇷': 'APAC', '🇦🇺': 'APAC', '🇮🇳': 'APAC',
  // Europe
  '🇩🇪': 'Europe', '🇫🇷': 'Europe', '🇬🇧': 'Europe', '🇪🇸': 'Europe', '🇮🇹': 'Europe',
  // MENA
  '🇸🇦': 'MENA', '🇦🇪': 'MENA', '🇪🇬': 'MENA', '🇹🇷': 'MENA', '🇮🇱': 'MENA',
  // LATAM
  '🇧🇷': 'LATAM', '🇲🇽': 'LATAM', '🇦🇷': 'LATAM', '🇨🇱': 'LATAM', '🇨🇴': 'LATAM',
  // North America
  '🇺🇸': 'North America', '🇨🇦': 'North America',
};
const regionColorMap: Record<string, string> = {
  'APAC': 'bg-emerald-400',
  'Europe': 'bg-purple-400',
  'MENA': 'bg-yellow-400',
  'LATAM': 'bg-pink-400',
  'North America': 'bg-blue-400',
};
function getRegionForCountry(countryEmoji: string): string {
  return countryToRegion[countryEmoji] || 'Other';
}
const supportersWithRegion = mockSupporters.map(supporter => {
  const emoji = supporter.country.split(' ')[0];
  return { ...supporter, region: getRegionForCountry(emoji) };
});
const regionStats: Record<string, { supporters: number; amount: number }> = {};
supportersWithRegion.forEach(supporter => {
  const region = supporter.region;
  if (!regionStats[region]) {
    regionStats[region] = { supporters: 0, amount: 0 };
  }
  regionStats[region].supporters += 1;
  regionStats[region].amount += supporter.amount;
});
const allRegions = ['APAC', 'Europe', 'MENA', 'LATAM', 'North America'];
const regionalData = allRegions.map(region => ({
  region,
  supporters: regionStats[region]?.supporters || 0,
  amount: regionStats[region]?.amount || 0,
  color: regionColorMap[region] || 'bg-gray-400',
}));

export default function EarlySupportersPage() {
  const [customAmount, setCustomAmount] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <Layout heroBackgroundColor="#f5f5f5">
      {/* Hero Section */}
      <section className="bg-token-surface-subtle py-token-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-token-5xl mx-auto">
            <div className="flex items-center justify-center gap-token-4 mb-token-8">
              <div className="w-token-12 h-token-12 text-token-primary-500">💖</div>
              <h1 className="text-token-5xl md:text-token-6xl lg:text-token-7xl font-bold bg-gradient-to-r from-token-primary-600 via-token-primary-500 to-token-primary-400 bg-clip-text text-transparent">
                Support Xpeak AI
              </h1>
            </div>

            <h2 className="text-token-2xl md:text-token-3xl font-bold token-text-primary mb-token-8">
              Be Part of the Founding Journey
            </h2>

            <div className="mb-token-12">
              <div className="flex items-center justify-center gap-token-4 mb-token-6">
                <div className="w-token-8 h-token-8 text-token-primary-500">🚀</div>
                <h3 className="text-token-xl md:text-token-2xl font-bold token-text-primary">Why We're Doing This</h3>
              </div>
              <p className="text-token-lg token-text-secondary leading-relaxed max-w-token-4xl mx-auto mb-token-8">
                Xpeak AI is built for learners, by learners — and we're inviting early believers to help shape the
                future of AI-powered language learning. Your support keeps the lights on, feeds the servers, and helps
                us build magic ✨.
              </p>
              <a href="#support-tiers" className="inline-block mb-token-2">
                <Button size="lg">💖 Become a Founding Supporter</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Global Support Visualization */}
      <section className="py-token-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-white">
            <motion.div
              className="text-center mb-token-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-token-4 mb-token-6">
                <Globe className="w-token-12 h-token-12" />
                <h2 className="text-token-2xl md:text-token-3xl font-bold">The Love We've Got</h2>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-token-8 mb-token-16">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-token-4xl md:text-token-5xl font-bold mb-token-2">{totalSupporters}</div>
                <div className="text-blue-100 font-medium">Global Supporters</div>
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-token-4xl md:text-token-5xl font-bold mb-token-2">${totalAmount.toLocaleString()}</div>
                <div className="text-blue-100 font-medium">Total Support</div>
              </motion.div>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-token-4xl md:text-token-5xl font-bold mb-token-2">{regionalData.length}</div>
                <div className="text-blue-100 font-medium">Regions</div>
              </motion.div>
            </div>

            {/* Latest Supporters */}
            <div className="grid lg:grid-cols-2 gap-token-8 items-stretch">
              {/* Live Supporter Feed */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="p-token-6 bg-white/10 backdrop-blur-sm border border-white/20 h-full">
                  <div className="flex items-center gap-token-3 mb-token-6">
                    <Users className="w-token-6 h-token-6" />
                    <h3 className="text-token-xl font-bold">Latest Supporters</h3>
                    <div className="flex items-center gap-token-1 text-token-sm text-blue-200">
                      <RefreshCw className="w-token-4 h-token-4" />
                      Live
                    </div>
                  </div>

                  <div className="space-y-token-4 max-h-80 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {mockSupporters.slice(0, 5).map((supporter, index) => (
                        <motion.div
                          key={`${supporter.name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-token-3 bg-white/5 rounded-token-lg"
                        >
                          <div className="flex items-center gap-token-3">
                            <div className="w-token-8 h-token-8 bg-white/20 rounded-full flex items-center justify-center text-token-sm font-bold">
                              {supporter.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-token-sm">{supporter.name}</div>
                              <div className="text-token-xs text-blue-200">{supporter.country}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-300">${supporter.amount}</div>
                            <div className="text-token-xs text-blue-200">{supporter.date}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>

              {/* Regional Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="p-token-6 bg-white/10 backdrop-blur-sm border border-white/20 h-full">
                  <div className="flex items-center gap-token-3 mb-token-6">
                    <MapPin className="w-token-6 h-token-6" />
                    <h3 className="text-token-xl font-bold">Regional Breakdown</h3>
                  </div>

                  <div className="space-y-token-8">
                    {regionalData.map((region, index) => (
                      <motion.div
                        key={region.region}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-token-3">
                          <div className={`w-token-4 h-token-4 ${region.color} rounded-full`}></div>
                          <span className="font-medium">{region.region}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{region.supporters} supporters</div>
                          <div className="text-token-sm text-blue-200">${region.amount.toLocaleString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="support-tiers" className="bg-white py-token-20 scroll-mt-token-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-token-12">
            <h2 className="text-token-2xl md:text-token-3xl font-bold mb-token-4">Support Early, Get Double</h2>
            <p className="text-token-lg token-text-secondary max-w-2xl mx-auto">
              Support now, and when we launch officially, you'll get 2x or more in credit to use across Xpeak AI.
            </p>
          </div>

          {/* Support Tiers */}
          <div className="grid md:grid-cols-3 gap-token-8 mb-token-12 justify-center">
            {supportTiers.map((tier, index) => (
              <div key={index} className="flex flex-col items-center">
                <Card className={`p-token-6 text-center transition-all duration-300 border-2 ${tier.popular ? 'border-purple-400 shadow-lg scale-105' : tier.border} relative w-full`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <span className="text-lg">⭐</span>
                        Popular
                      </span>
                    </div>
                  )}
                  <div className={`w-20 h-20 mx-auto mb-token-4 rounded-full flex items-center justify-center text-white text-2xl font-bold ${tier.circle}`}>
                    ${tier.give}
                  </div>
                  <h3 className="text-token-2xl font-bold mb-token-2">{tier.name}</h3>
                  <div className="mb-token-4">
                    <div className="text-token-sm token-text-secondary mb-token-1">You Get at Launch</div>
                    <div className="text-token-2xl font-bold text-emerald-600">${tier.get}{tier.name === 'Champion' ? '+' : ''} credit</div>
                  </div>
                  <Button className="w-full mt-token-2">Choose This Tier</Button>
                </Card>
              </div>
            ))}
          </div>

          {/* Custom Input */}
          <div>
            <Card className="p-token-8 bg-yellow-50 border-2 border-yellow-200">
              <div className="text-center">
                <span className="text-3xl block mx-auto mb-token-4">🎁</span>
                <h3 className="text-token-2xl font-bold mb-token-4">Custom Input</h3>
                <p className="text-token-lg token-text-secondary mb-token-6">
                  Feeling extra generous or just want to pick your number? Support with any amount and we'll double
                  (or more!) your credit, with all the same perks.
                </p>
                <div className="flex items-center justify-center gap-token-4 mb-token-4">
                  <span className="text-token-lg font-semibold token-text-primary">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="px-token-4 py-token-2 border-2 border-yellow-300 rounded-token-lg text-center text-token-xl font-bold w-token-32 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <p className="text-yellow-600 font-semibold mb-token-6">The more love, the more credit boost!</p>
                <div className="bg-blue-100 rounded-token-lg p-token-4 mb-token-6">
                  <span className="text-blue-500 text-xl block mb-token-2">⚡</span>
                  <p className="text-token-sm text-blue-700 font-medium">
                    Bonus Boosts: We may add extra credit for early supporters. Surprise perks ahead!
                  </p>
                </div>
                <Button className="w-full">Support Custom Amount</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Support Now Section */}
      <section className="bg-token-surface-subtle py-token-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-token-6 text-center">
              <h2 className="text-token-2xl md:text-token-3xl font-bold">Why Support Now?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-token-6">
              {[
                {
                  icon: "💎",
                  title: "Get 2x or more credits when we launch publicly"
                },
                {
                  icon: "🚀",
                  title: "Unlock beta access to all AI-powered features"
                },
                {
                  icon: "🌍",
                  title: "Join our global community of early users"
                },
                {
                  icon: "🎯",
                  title: "Be part of shaping the product — vote, give feedback, get heard"
                }
              ].map((benefit, index) => (
                <div key={index}>
                  <Card className="p-token-6 hover:shadow-token-lg transition-all duration-300 border-2 border-token-border hover:border-token-primary-200">
                    <div className="flex items-center gap-token-4">
                      <div className="w-token-12 h-token-12 bg-token-primary-100 rounded-token-lg flex items-center justify-center text-token-primary-600 flex-shrink-0">
                        <span className="text-token-lg">{benefit.icon}</span>
                      </div>
                      <div className="flex items-center gap-token-2">
                        <div className="w-token-5 h-token-5 text-token-primary-500 flex-shrink-0">✅</div>
                        <span className="token-text-primary font-medium">{benefit.title}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-token-4 mb-token-6">
                <HelpCircle className="w-token-12 h-token-12 text-blue-500" />
                <h2 className="text-token-2xl md:text-token-3xl font-bold text-slate-800">FAQs</h2>
              </div>
            </motion.div>

            <div className="space-y-token-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <div className="p-token-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800">{faq.question}</h3>
                        <motion.div
                          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="w-token-4 h-token-4 text-slate-500" />
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {expandedFaq === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-token-2 pt-token-2 border-t border-slate-200"
                          >
                            <p className="text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white py-token-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-token-2xl font-bold mb-token-4">❤️ Join Us Early</h2>
          <p className="max-w-token-2xl mx-auto text-token-lg token-text-secondary mb-token-8">
            You're not just supporting a startup. You're joining the first wave of global learners and believers building something that could change how the world learns to speak.
          </p>
          <a href="#support-tiers" className="inline-block mb-token-4">
            <Button size="lg">💖 Become a Founding Supporter</Button>
          </a>
          <div className="flex flex-col md:flex-row justify-center gap-token-4 mt-token-4">
            <Button variant="secondary">View Public Roadmap</Button>
            <Button variant="secondary">Read Changelog</Button>
            <Button variant="secondary">Join the Beta Group</Button>
          </div>
        </div>
      </section>
    </Layout>
  );
} 