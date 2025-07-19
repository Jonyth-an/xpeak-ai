'use client';

import React from 'react';
import { useAuth } from '../../../../lib/AuthContext';
import { Button } from '@/app/components/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, subtitle, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-token-surface rounded-xl shadow-sm border border-token-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function LearningStats() {
  const { user } = useAuth();

  // Mock data - in a real app, this would come from your database
  const stats = {
    wordsLearned: user?.user_metadata?.words_learned || 0,
    topicsCompleted: user?.user_metadata?.topics_completed || 0,
    learningStreak: user?.user_metadata?.learning_streak || 0,
    totalStudyTime: user?.user_metadata?.total_study_time || 0
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Words Learned"
          value={stats.wordsLearned}
          subtitle="Total vocabulary"
          icon="📚"
          color="text-token-primary"
          bgColor="bg-token-primary-surface"
        />
        <StatCard
          title="Topics Completed"
          value={stats.topicsCompleted}
          subtitle="Lessons finished"
          icon="✅"
          color="text-token-success"
          bgColor="bg-token-success-surface"
        />
        <StatCard
          title="Learning Streak"
          value={stats.learningStreak}
          subtitle="Days in a row"
          icon="🔥"
          color="text-token-warning"
          bgColor="bg-token-warning-surface"
        />
        <StatCard
          title="Study Time"
          value={formatStudyTime(stats.totalStudyTime)}
          subtitle="Total time spent"
          icon="⏱️"
          color="text-token-accent"
          bgColor="bg-token-accent-surface"
        />
      </div>

      {/* Progress Section */}
      <div className="bg-token-surface rounded-xl shadow-sm border border-token-border overflow-hidden">
        <div className="px-6 py-4 border-b border-token-border bg-token-surface-accent-light">
          <h4 className="text-sm font-semibold text-text">Recent Activity</h4>
        </div>
        
        <div className="p-6">
          {/* Mock recent activity - in a real app, this would be dynamic */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-token-surface-accent-light rounded-xl border border-token-border">
              <div className="w-10 h-10 bg-token-success-surface rounded-xl flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">Completed "Basic Greetings" topic</p>
                <p className="text-xs text-text-muted">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-token-surface-accent-light rounded-xl border border-token-border">
              <div className="w-10 h-10 bg-token-primary-surface rounded-xl flex items-center justify-center">
                <span className="text-sm">📚</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">Learned 5 new words</p>
                <p className="text-xs text-text-muted">Yesterday</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-token-surface-accent-light rounded-xl border border-token-border">
              <div className="w-10 h-10 bg-token-warning-surface rounded-xl flex items-center justify-center">
                <span className="text-sm">🔥</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">Maintained 7-day learning streak</p>
                <p className="text-xs text-text-muted">3 days ago</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6 p-4 bg-gradient-to-r from-token-primary/5 to-token-primary/10 rounded-xl border border-token-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Ready for more learning?</p>
                <p className="text-xs text-text-secondary mt-1">
                  Continue your language journey
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="inline-flex items-center"
                onClick={() => {/* TODO: Add navigation or action */}}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-token-surface rounded-xl shadow-sm border border-token-border overflow-hidden">
        <div className="px-6 py-4 border-b border-token-border bg-token-surface-accent-light">
          <h4 className="text-sm font-semibold text-text">Quick Actions</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex items-center justify-between w-full p-3 text-left hover:bg-token-surface-accent-light rounded-lg transition-colors duration-200"
              onClick={() => {/* TODO: Add navigation or action */}}
            >
              <span className="flex items-center space-x-3">
                <span className="w-8 h-8 bg-token-primary-surface rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-text">View Learning History</span>
              </span>
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button
              variant="outline"
              size="md"
              className="flex items-center justify-between w-full p-3 text-left hover:bg-token-surface-accent-light rounded-lg transition-colors duration-200"
              onClick={() => {/* TODO: Add navigation or action */}}
            >
              <span className="flex items-center space-x-3">
                <span className="w-8 h-8 bg-token-success-surface rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-text">View Progress Charts</span>
              </span>
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button
              variant="outline"
              size="md"
              className="flex items-center justify-between w-full p-3 text-left hover:bg-token-surface-accent-light rounded-lg transition-colors duration-200"
              onClick={() => {/* TODO: Add navigation or action */}}
            >
              <span className="flex items-center space-x-3">
                <span className="w-8 h-8 bg-token-accent-surface rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-text">View Achievements</span>
              </span>
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 