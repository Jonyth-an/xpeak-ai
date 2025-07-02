// ========================================
// GAMIFICATION ENGINE
// ========================================

import { supabase } from '../../supabaseClient';
import { 
  GamificationMetrics, 
  Achievement, 
  Badge 
} from './index';

export interface GamificationConfig {
  pointsPerCorrectAnswer: number;
  pointsPerNewWord: number;
  streakMultiplier: number;
  levelUpThreshold: number;
}

export interface UserInteraction {
  userId: string;
  wordId: string;
  isCorrect: boolean;
  timeTaken: number;
  interactionType: 'learn' | 'review' | 'quiz' | 'challenge';
  sessionId?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakType: 'daily' | 'weekly' | 'monthly';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  rank: number;
  achievements: number;
  badges: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: {
    wordsLearned?: number;
    accuracy?: number;
    streak?: number;
    timeSpent?: number;
  };
  rewards: {
    points: number;
    badges?: string[];
    achievements?: string[];
  };
  expiresAt: Date;
  isCompleted: boolean;
}

export class GamificationEngine {
  private config: GamificationConfig;

  constructor(config: GamificationConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN GAMIFICATION METHODS
  // ========================================

  async processInteraction(interaction: UserInteraction): Promise<GamificationMetrics> {
    // 1. Calculate points for this interaction
    const points = await this.calculatePoints(interaction);
    
    // 2. Update user's gamification metrics
    const updatedMetrics = await this.updateUserMetrics(interaction.userId, points, interaction);
    
    // 3. Check for achievements and badges
    const newAchievements = await this.checkAchievements(interaction.userId, interaction);
    const newBadges = await this.checkBadges(interaction.userId, interaction);
    
    // 4. Update streak
    const streakData = await this.updateStreak(interaction.userId, interaction);
    
    // 5. Check for level up
    const levelUp = await this.checkLevelUp(interaction.userId, updatedMetrics.totalPoints);
    
    // 6. Return updated metrics
    return {
      ...updatedMetrics,
      achievements: [...updatedMetrics.achievements, ...newAchievements],
      badges: [...updatedMetrics.badges, ...newBadges]
    };
  }

  async getUserMetrics(userId: string): Promise<GamificationMetrics> {
    const { data: metrics, error } = await supabase
      .from('user_gamification_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !metrics) {
      // Create default metrics for new user
      return await this.createDefaultMetrics(userId);
    }

    // Get achievements and badges
    const [achievements, badges] = await Promise.all([
      this.getUserAchievements(userId),
      this.getUserBadges(userId)
    ]);

    return {
      userId,
      totalPoints: metrics.total_points || 0,
      level: metrics.level || 1,
      streak: metrics.current_streak || 0,
      achievements,
      badges,
      leaderboardPosition: await this.getLeaderboardPosition(userId)
    };
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const { data: entries, error } = await supabase
      .from('user_gamification_metrics')
      .select(`
        user_id,
        total_points,
        level,
        users!inner(username)
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (entries || []).map((entry, index) => ({
      userId: entry.user_id,
      username: (entry.users as any)?.username || 'Anonymous',
      totalPoints: entry.total_points || 0,
      level: entry.level || 1,
      rank: index + 1,
      achievements: 0, // Would need to fetch separately
      badges: 0 // Would need to fetch separately
    }));
  }

  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    const { data: challenges, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    return (challenges || []).map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      requirements: challenge.requirements,
      rewards: challenge.rewards,
      expiresAt: new Date(challenge.expires_at),
      isCompleted: challenge.is_completed
    }));
  }

  // ========================================
  // POINTS CALCULATION
  // ========================================

  private async calculatePoints(interaction: UserInteraction): Promise<number> {
    let points = 0;

    // Base points for correct answers
    if (interaction.isCorrect) {
      points += this.config.pointsPerCorrectAnswer;
    }

    // Bonus points for new words
    if (interaction.interactionType === 'learn') {
      points += this.config.pointsPerNewWord;
    }

    // Time bonus (faster = more points)
    if (interaction.timeTaken < 5000) { // Less than 5 seconds
      points += Math.round(this.config.pointsPerCorrectAnswer * 0.5);
    } else if (interaction.timeTaken < 10000) { // Less than 10 seconds
      points += Math.round(this.config.pointsPerCorrectAnswer * 0.25);
    }

    // Streak multiplier
    const streakMultiplier = await this.getStreakMultiplier(interaction.userId);
    points = Math.round(points * streakMultiplier);

    return points;
  }

  private async getStreakMultiplier(userId: string): Promise<number> {
    const { data: metrics } = await supabase
      .from('user_gamification_metrics')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    if (!metrics || !metrics.current_streak) return 1.0;

    const streak = metrics.current_streak;
    
    // Multiplier increases with streak length
    if (streak >= 7) return this.config.streakMultiplier;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.25;
    
    return 1.0;
  }

  // ========================================
  // METRICS UPDATES
  // ========================================

  private async updateUserMetrics(
    userId: string, 
    points: number, 
    interaction: UserInteraction
  ): Promise<GamificationMetrics> {
    const { data: existingMetrics } = await supabase
      .from('user_gamification_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    const newTotalPoints = (existingMetrics?.total_points || 0) + points;
    const newLevel = this.calculateLevel(newTotalPoints);

    const updateData = {
      total_points: newTotalPoints,
      level: newLevel,
      last_activity: new Date().toISOString()
    };

    if (existingMetrics) {
      // Update existing metrics
      const { data: updatedMetrics, error } = await supabase
        .from('user_gamification_metrics')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user metrics:', error);
        throw new Error('Failed to update user metrics');
      }

      return await this.getUserMetrics(userId);
    } else {
      // Create new metrics
      const { data: newMetrics, error } = await supabase
        .from('user_gamification_metrics')
        .insert({
          user_id: userId,
          ...updateData,
          current_streak: 0,
          longest_streak: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user metrics:', error);
        throw new Error('Failed to create user metrics');
      }

      return await this.getUserMetrics(userId);
    }
  }

  private calculateLevel(totalPoints: number): number {
    // Level calculation: each level requires more points
    let level = 1;
    let pointsRequired = this.config.levelUpThreshold;
    
    while (totalPoints >= pointsRequired) {
      level++;
      pointsRequired += this.config.levelUpThreshold * level; // Increasing threshold
    }
    
    return level;
  }

  // ========================================
  // ACHIEVEMENTS SYSTEM
  // ========================================

  private async checkAchievements(
    userId: string, 
    interaction: UserInteraction
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const currentMetrics = await this.getUserMetrics(userId);

    // Define achievement criteria
    const achievementCriteria = [
      {
        id: 'first_word',
        name: 'First Steps',
        description: 'Learn your first word',
        condition: () => currentMetrics.totalPoints >= this.config.pointsPerNewWord,
        icon: '🌱'
      },
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Maintain a 3-day streak',
        condition: () => currentMetrics.streak >= 3,
        icon: '🔥'
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        condition: () => currentMetrics.streak >= 7,
        icon: '⚡'
      },
      {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        condition: () => currentMetrics.level >= 5,
        icon: '⭐'
      },
      {
        id: 'level_10',
        name: 'Vocabulary Master',
        description: 'Reach level 10',
        condition: () => currentMetrics.level >= 10,
        icon: '👑'
      },
      {
        id: 'perfect_session',
        name: 'Perfect Session',
        description: 'Complete a session with 100% accuracy',
        condition: async () => await this.checkPerfectSession(userId, interaction.sessionId),
        icon: '🎯'
      },
      {
        id: 'speed_learner',
        name: 'Speed Learner',
        description: 'Answer 10 questions correctly in under 30 seconds',
        condition: async () => await this.checkSpeedLearning(userId),
        icon: '⚡'
      },
      {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Learn 50 words',
        condition: async () => await this.checkWordCount(userId, 50),
        icon: '📚'
      }
    ];

    // Check each achievement
    for (const criteria of achievementCriteria) {
      const isUnlocked = await criteria.condition();
      
      if (isUnlocked) {
        const achievement = await this.unlockAchievement(userId, criteria);
        if (achievement) {
          newAchievements.push(achievement);
        }
      }
    }

    return newAchievements;
  }

  private async unlockAchievement(
    userId: string, 
    criteria: any
  ): Promise<Achievement | null> {
    // Check if achievement is already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', criteria.id)
      .single();

    if (existing) return null; // Already unlocked

    // Unlock achievement
    const achievement: Achievement = {
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      icon: criteria.icon,
      unlockedAt: new Date(),
      progress: 100,
      maxProgress: 100
    };

    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: criteria.id,
        unlocked_at: achievement.unlockedAt.toISOString()
      });

    if (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }

    return achievement;
  }

  private async checkPerfectSession(userId: string, sessionId?: string): Promise<boolean> {
    if (!sessionId) return false;
    
    // This would check if the user had 100% accuracy in the session
    // For now, return false
    return false;
  }

  private async checkSpeedLearning(userId: string): Promise<boolean> {
    // This would check if user answered 10 questions quickly
    // For now, return false
    return false;
  }

  private async checkWordCount(userId: string, targetCount: number): Promise<boolean> {
    const { count: wordCount } = await supabase
      .from('user_word_mastery')
      .select('word_id', { count: 'exact' })
      .eq('user_id', userId);

    return (wordCount || 0) >= targetCount;
  }

  // ========================================
  // BADGES SYSTEM
  // ========================================

  private async checkBadges(
    userId: string, 
    interaction: UserInteraction
  ): Promise<Badge[]> {
    const newBadges: Badge[] = [];
    const currentMetrics = await this.getUserMetrics(userId);

    // Define badge criteria
    const badgeCriteria = [
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete your first learning session before 9 AM',
        rarity: 'common' as const,
        icon: '🌅',
        condition: () => this.isEarlyBird(interaction)
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a learning session after 10 PM',
        rarity: 'common' as const,
        icon: '🦉',
        condition: () => this.isNightOwl(interaction)
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Learn on 5 consecutive weekends',
        rarity: 'rare' as const,
        icon: '🏆',
        condition: async () => await this.checkWeekendLearning(userId)
      },
      {
        id: 'consistency_king',
        name: 'Consistency King',
        description: 'Maintain a 30-day streak',
        rarity: 'epic' as const,
        icon: '👑',
        condition: () => currentMetrics.streak >= 30
      },
      {
        id: 'vocabulary_virtuoso',
        name: 'Vocabulary Virtuoso',
        description: 'Learn 1000 words',
        rarity: 'legendary' as const,
        icon: '🌟',
        condition: async () => await this.checkWordCount(userId, 1000)
      }
    ];

    // Check each badge
    for (const criteria of badgeCriteria) {
      const isUnlocked = await criteria.condition();
      
      if (isUnlocked) {
        const badge = await this.unlockBadge(userId, criteria);
        if (badge) {
          newBadges.push(badge);
        }
      }
    }

    return newBadges;
  }

  private async unlockBadge(
    userId: string, 
    criteria: any
  ): Promise<Badge | null> {
    // Check if badge is already unlocked
    const { data: existing } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', criteria.id)
      .single();

    if (existing) return null; // Already unlocked

    // Unlock badge
    const badge: Badge = {
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      icon: criteria.icon,
      unlockedAt: new Date(),
      rarity: criteria.rarity
    };

    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: criteria.id,
        unlocked_at: badge.unlockedAt.toISOString()
      });

    if (error) {
      console.error('Error unlocking badge:', error);
      return null;
    }

    return badge;
  }

  private isEarlyBird(interaction: UserInteraction): boolean {
    const hour = new Date().getHours();
    return hour < 9;
  }

  private isNightOwl(interaction: UserInteraction): boolean {
    const hour = new Date().getHours();
    return hour >= 22;
  }

  private async checkWeekendLearning(userId: string): Promise<boolean> {
    // This would check if user learned on 5 consecutive weekends
    // For now, return false
    return false;
  }

  // ========================================
  // STREAK MANAGEMENT
  // ========================================

  private async updateStreak(
    userId: string, 
    interaction: UserInteraction
  ): Promise<StreakData> {
    const { data: metrics } = await supabase
      .from('user_gamification_metrics')
      .select('current_streak, longest_streak, last_activity')
      .eq('user_id', userId)
      .single();

    const today = new Date();
    const lastActivity = metrics?.last_activity ? new Date(metrics.last_activity) : null;
    
    let newStreak = 1; // Default for new activity
    
    if (lastActivity) {
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = (metrics?.current_streak || 0) + 1;
      } else if (daysDiff === 0) {
        // Same day, maintain current streak
        newStreak = metrics?.current_streak || 1;
      }
      // If daysDiff > 1, streak is broken, start over at 1
    }

    const longestStreak = Math.max(newStreak, metrics?.longest_streak || 0);

    // Update streak in database
    await supabase
      .from('user_gamification_metrics')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity: today.toISOString()
      })
      .eq('user_id', userId);

    return {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
      streakType: 'daily'
    };
  }

  // ========================================
  // LEVEL UP SYSTEM
  // ========================================

  private async checkLevelUp(userId: string, totalPoints: number): Promise<boolean> {
    const { data: metrics } = await supabase
      .from('user_gamification_metrics')
      .select('level')
      .eq('user_id', userId)
      .single();

    const currentLevel = metrics?.level || 1;
    const newLevel = this.calculateLevel(totalPoints);

    if (newLevel > currentLevel) {
      // Level up occurred
      await this.processLevelUp(userId, currentLevel, newLevel);
      return true;
    }

    return false;
  }

  private async processLevelUp(
    userId: string, 
    oldLevel: number, 
    newLevel: number
  ): Promise<void> {
    // Update level in database
    await supabase
      .from('user_gamification_metrics')
      .update({ level: newLevel })
      .eq('user_id', userId);

    // Award level-up bonus
    const levelUpBonus = newLevel * 100; // 100 points per level
    await this.awardBonusPoints(userId, levelUpBonus, `Level ${newLevel} Bonus`);

    // Check for level-based achievements
    await this.checkLevelBasedAchievements(userId, newLevel);
  }

  private async awardBonusPoints(
    userId: string, 
    points: number, 
    reason: string
  ): Promise<void> {
    const { data: metrics } = await supabase
      .from('user_gamification_metrics')
      .select('total_points')
      .eq('user_id', userId)
      .single();

    const newTotalPoints = (metrics?.total_points || 0) + points;

    await supabase
      .from('user_gamification_metrics')
      .update({ total_points: newTotalPoints })
      .eq('user_id', userId);

    // Log the bonus
    await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        points: points,
        reason: reason,
        transaction_type: 'bonus',
        created_at: new Date().toISOString()
      });
  }

  private async checkLevelBasedAchievements(userId: string, level: number): Promise<void> {
    // Check for level-based achievements
    const levelAchievements = [
      { level: 5, id: 'level_5' },
      { level: 10, id: 'level_10' },
      { level: 25, id: 'level_25' },
      { level: 50, id: 'level_50' }
    ];

    for (const achievement of levelAchievements) {
      if (level >= achievement.level) {
        await this.unlockAchievement(userId, {
          id: achievement.id,
          name: `Level ${achievement.level}`,
          description: `Reach level ${achievement.level}`,
          icon: '⭐'
        });
      }
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private async createDefaultMetrics(userId: string): Promise<GamificationMetrics> {
    return {
      userId,
      totalPoints: 0,
      level: 1,
      streak: 0,
      achievements: [],
      badges: [],
      leaderboardPosition: undefined
    };
  }

  private async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return (achievements || []).map(achievement => ({
      id: achievement.achievement_id,
      name: achievement.name || 'Achievement',
      description: achievement.description || 'Unlocked an achievement',
      icon: achievement.icon || '🏆',
      unlockedAt: new Date(achievement.unlocked_at),
      progress: 100,
      maxProgress: 100
    }));
  }

  private async getUserBadges(userId: string): Promise<Badge[]> {
    const { data: badges, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return (badges || []).map(badge => ({
      id: badge.badge_id,
      name: badge.name || 'Badge',
      description: badge.description || 'Earned a badge',
      icon: badge.icon || '🏅',
      unlockedAt: new Date(badge.unlocked_at),
      rarity: badge.rarity || 'common'
    }));
  }

  private async getLeaderboardPosition(userId: string): Promise<number | undefined> {
    const { data: position } = await supabase
      .from('user_gamification_metrics')
      .select('total_points')
      .eq('user_id', userId)
      .single();

    if (!position) return undefined;

    const { count: higherRanked } = await supabase
      .from('user_gamification_metrics')
      .select('user_id', { count: 'exact' })
      .gt('total_points', position.total_points);

    return (higherRanked || 0) + 1;
  }
} 