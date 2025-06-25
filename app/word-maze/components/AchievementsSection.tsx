import React from 'react';
import { Button, Card } from '@/app/components/ui';

const badges = [
  { title: 'First Word Saved!', desc: "You've started building your personal vocabulary.", status: 'Completed', icon: '✅' },
  { title: 'Word Collector', desc: 'Add 10 words to your maze to unlock this badge.', progress: '7/10', icon: '🔢' },
  { title: 'Review Master', desc: 'Complete 3 review sessions in one day.', locked: true, icon: '🔒' },
];

export default function AchievementsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl font-semibold text-text mb-4">
        🏆 Celebrate the Little Wins
      </h2>
      <p className="text-text-muted text-sm mb-8">
        Grow your Word Maze, earn badges, and stay motivated.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {badges.map((b) => (
          <Card key={b.title} variant="elevated" padding="lg" className="mt-12 text-left">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{b.icon}</span>
              <h3 className="font-semibold text-text">{b.title}</h3>
            </div>
            <p className="text-text-muted text-sm mb-4">{b.desc}</p>
            {b.locked ? (
              <Button variant="ghost" disabled>
                Locked
              </Button>
            ) : b.progress ? (
              <div className="flex items-center justify-between text-sm">
                <span>{b.progress}</span>
                <div className="w-1/2 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${(parseInt(b.progress) / 10) * 100}%` }} />
                </div>
              </div>
            ) : (
              <Button variant="primary">
                {b.status}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
} 