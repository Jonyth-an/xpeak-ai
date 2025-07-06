import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="p-token-20 bg-gradient-to-br from-token-primary/10 via-token-surface to-token-primary/5">
      <div className="container-xl mx-auto px-token-4 sm:px-token-6 lg:px-token-8 text-token-center">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-token-display-lg md:text-token-display-xl lg:text-token-display-2xl font-token-bold text-token-primary mb-token-8">
            You're not just learning a language.<br />
            You're building a world.
          </h2>
          <p className="text-token-body-xl md:text-token-body-lg text-token-secondary mb-token-12 max-w-3xl mx-auto">
            Join Xpeak AI and unlock a universe of words, ideas, and connections. Start your journey today and see how far you can go.
          </p>
          <Link href="/signup" passHref legacyBehavior>
            <Button
              asChild
              className="w-fit mx-auto bg-token-primary bg-gradient-to-r from-token-primary to-token-primary-dark text-token-inverse shadow-token-xl px-token-8 py-token-6 rounded-token-full text-token-body-xl font-token-bold transition-token-base hover:shadow-token-2xl hover:from-token-primary-dark hover:to-token-primary group"
              size="lg"
            >
              <a className="flex items-center justify-center gap-token-3">
                Get Started
                <ArrowRight className="w-6 h-6 ml-token-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
