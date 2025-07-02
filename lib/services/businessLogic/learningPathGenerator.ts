// ========================================
// LEARNING PATH GENERATOR
// ========================================

import { supabase } from '../../supabaseClient';
import { 
  LearningPath, 
  UserProgress, 
  BusinessLogicConfig 
} from './index';

export interface LearningObjective {
  id: string;
  name: string;
  description: string;
  targetLevel: string;
  estimatedDuration: number;
  prerequisites: string[];
  skills: string[];
}

export interface UserLearningProfile {
  userId: string;
  currentLevel: string;
  targetLevel: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredTopics: string[];
  timeAvailability: number; // minutes per day
  learningGoals: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface PathRecommendation {
  path: LearningPath;
  confidence: number;
  reasoning: string;
  estimatedCompletionTime: number;
  difficulty: string;
}

export class LearningPathGenerator {
  private config: BusinessLogicConfig;

  constructor(config: BusinessLogicConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN PATH GENERATION METHODS
  // ========================================

  async generatePersonalizedPath(
    userId: string, 
    userProgress: UserProgress
  ): Promise<LearningPath> {
    // 1. Analyze user's learning profile
    const userProfile = await this.analyzeUserLearningProfile(userId, userProgress);
    
    // 2. Determine learning objectives
    const objectives = this.determineLearningObjectives(userProfile);
    
    // 3. Generate path structure
    const pathStructure = await this.generatePathStructure(userProfile, objectives);
    
    // 4. Optimize path for user preferences
    const optimizedPath = await this.optimizePathForUser(pathStructure, userProfile);
    
    // 5. Create learning path
    return this.createLearningPath(optimizedPath, userProfile, objectives);
  }

  async generateCustomPath(
    userId: string,
    name: string,
    description: string,
    objectives: string[],
    preferences: any
  ): Promise<LearningPath> {
    // 1. Validate objectives
    const validatedObjectives = await this.validateObjectives(objectives);
    
    // 2. Get user profile
    const userProfile = await this.getUserLearningProfile(userId);
    
    // 3. Generate custom path structure
    const pathStructure = await this.generateCustomPathStructure(
      validatedObjectives, 
      userProfile, 
      preferences
    );
    
    // 4. Create learning path
    return this.createCustomLearningPath(
      pathStructure, 
      userProfile, 
      name, 
      description
    );
  }

  async recommendPaths(
    userId: string, 
    count: number = 5
  ): Promise<PathRecommendation[]> {
    // 1. Get user profile
    const userProfile = await this.getUserLearningProfile(userId);
    
    // 2. Generate path recommendations
    const recommendations = await this.generatePathRecommendations(userProfile, count);
    
    // 3. Rank and filter recommendations
    return this.rankPathRecommendations(recommendations, userProfile);
  }

  // ========================================
  // USER PROFILE ANALYSIS
  // ========================================

  private async analyzeUserLearningProfile(
    userId: string, 
    userProgress: UserProgress
  ): Promise<UserLearningProfile> {
    // Get comprehensive user data
    const [masteryData, preferences, goals] = await Promise.all([
      this.getUserMasteryData(userId),
      this.getUserPreferences(userId),
      this.getUserLearningGoals(userId)
    ]);

    // Analyze current level
    const currentLevel = this.analyzeCurrentLevel(masteryData);
    
    // Determine target level
    const targetLevel = this.determineTargetLevel(currentLevel, goals);
    
    // Analyze learning style
    const learningStyle = this.analyzeLearningStyle(masteryData);
    
    // Get preferred topics
    const preferredTopics = this.analyzePreferredTopics(masteryData, preferences);
    
    // Calculate time availability
    const timeAvailability = this.calculateTimeAvailability(preferences);
    
    // Analyze strengths and weaknesses
    const strengths = this.analyzeStrengths(masteryData);
    const weaknesses = this.analyzeWeaknesses(masteryData);

    return {
      userId,
      currentLevel,
      targetLevel,
      learningStyle,
      preferredTopics,
      timeAvailability,
      learningGoals: goals,
      strengths,
      weaknesses
    };
  }

  private async getUserMasteryData(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_word_mastery')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user mastery data:', error);
      return [];
    }

    return data || [];
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // This would fetch user preferences from a preferences table
    // For now, return default preferences
    return {
      preferredTopics: ['general', 'business', 'technology'],
      timeAvailability: 30, // minutes per day
      learningStyle: 'mixed',
      difficulty: 'intermediate'
    };
  }

  private async getUserLearningGoals(userId: string): Promise<string[]> {
    // This would fetch user's learning goals
    // For now, return default goals
    return [
      'Improve vocabulary for professional communication',
      'Enhance reading comprehension',
      'Build confidence in speaking'
    ];
  }

  private analyzeCurrentLevel(masteryData: any[]): string {
    if (masteryData.length === 0) return 'beginner';
    
    const avgMastery = masteryData.reduce((sum, m) => sum + m.mastery_level, 0) / masteryData.length;
    
    if (avgMastery < 30) return 'beginner';
    if (avgMastery < 70) return 'intermediate';
    return 'advanced';
  }

  private determineTargetLevel(currentLevel: string, goals: string[]): string {
    // Analyze goals to determine target level
    const hasAdvancedGoals = goals.some(goal => 
      goal.includes('professional') || goal.includes('academic') || goal.includes('advanced')
    );
    
    if (currentLevel === 'beginner') {
      return hasAdvancedGoals ? 'advanced' : 'intermediate';
    } else if (currentLevel === 'intermediate') {
      return hasAdvancedGoals ? 'advanced' : 'intermediate';
    } else {
      return 'advanced';
    }
  }

  private analyzeLearningStyle(masteryData: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // Analyze patterns in user's learning behavior
    if (masteryData.length === 0) return 'mixed';
    
    // This would analyze actual learning patterns
    // For now, return a default based on performance
    const avgMastery = masteryData.reduce((sum, m) => sum + m.mastery_level, 0) / masteryData.length;
    
    if (avgMastery > 80) return 'visual';
    if (avgMastery > 60) return 'auditory';
    if (avgMastery > 40) return 'kinesthetic';
    return 'mixed';
  }

  private analyzePreferredTopics(masteryData: any[], preferences: any): string[] {
    // Combine user preferences with performance data
    const preferredTopics = preferences.preferredTopics || ['general'];
    
    // This would analyze which topics user performs best in
    // For now, return user preferences
    return preferredTopics;
  }

  private calculateTimeAvailability(preferences: any): number {
    return preferences.timeAvailability || 30; // Default 30 minutes per day
  }

  private analyzeStrengths(masteryData: any[]): string[] {
    const strengths: string[] = [];
    
    if (masteryData.length === 0) return strengths;
    
    const highMasteryWords = masteryData.filter(m => m.mastery_level > 80);
    if (highMasteryWords.length > 0) {
      strengths.push('vocabulary retention');
    }
    
    const consistentPerformance = masteryData.filter(m => 
      m.correct_count > m.incorrect_count
    );
    if (consistentPerformance.length > masteryData.length * 0.7) {
      strengths.push('consistent learning');
    }
    
    return strengths;
  }

  private analyzeWeaknesses(masteryData: any[]): string[] {
    const weaknesses: string[] = [];
    
    if (masteryData.length === 0) return weaknesses;
    
    const lowMasteryWords = masteryData.filter(m => m.mastery_level < 30);
    if (lowMasteryWords.length > 0) {
      weaknesses.push('difficult words');
    }
    
    const inconsistentPerformance = masteryData.filter(m => 
      Math.abs(m.correct_count - m.incorrect_count) < 2
    );
    if (inconsistentPerformance.length > masteryData.length * 0.3) {
      weaknesses.push('inconsistent performance');
    }
    
    return weaknesses;
  }

  // ========================================
  // LEARNING OBJECTIVES
  // ========================================

  private determineLearningObjectives(userProfile: UserLearningProfile): LearningObjective[] {
    const objectives: LearningObjective[] = [];
    
    // Bridge gap between current and target level
    if (userProfile.currentLevel !== userProfile.targetLevel) {
      objectives.push({
        id: crypto.randomUUID(),
        name: `Progress from ${userProfile.currentLevel} to ${userProfile.targetLevel}`,
        description: `Build vocabulary and skills to reach ${userProfile.targetLevel} level`,
        targetLevel: userProfile.targetLevel,
        estimatedDuration: this.calculateLevelTransitionTime(userProfile),
        prerequisites: [],
        skills: ['vocabulary', 'comprehension', 'usage']
      });
    }
    
    // Address specific weaknesses
    userProfile.weaknesses.forEach(weakness => {
      objectives.push({
        id: crypto.randomUUID(),
        name: `Improve ${weakness}`,
        description: `Focus on areas where you need improvement`,
        targetLevel: userProfile.currentLevel,
        estimatedDuration: 14, // 2 weeks
        prerequisites: [],
        skills: [weakness]
      });
    });
    
    // Support learning goals
    userProfile.learningGoals.forEach(goal => {
      objectives.push({
        id: crypto.randomUUID(),
        name: `Achieve: ${goal}`,
        description: `Work towards your specific learning goal`,
        targetLevel: userProfile.targetLevel,
        estimatedDuration: 21, // 3 weeks
        prerequisites: [],
        skills: this.extractSkillsFromGoal(goal)
      });
    });
    
    return objectives;
  }

  private calculateLevelTransitionTime(userProfile: UserLearningProfile): number {
    const levelDifferences = {
      'beginner-intermediate': 30,
      'intermediate-advanced': 45,
      'beginner-advanced': 60
    };
    
    const transition = `${userProfile.currentLevel}-${userProfile.targetLevel}`;
    return levelDifferences[transition as keyof typeof levelDifferences] || 30;
  }

  private extractSkillsFromGoal(goal: string): string[] {
    const skills: string[] = [];
    
    if (goal.includes('vocabulary')) skills.push('vocabulary');
    if (goal.includes('reading')) skills.push('comprehension');
    if (goal.includes('speaking')) skills.push('communication');
    if (goal.includes('writing')) skills.push('writing');
    if (goal.includes('professional')) skills.push('business');
    if (goal.includes('academic')) skills.push('academic');
    
    return skills.length > 0 ? skills : ['general'];
  }

  // ========================================
  // PATH STRUCTURE GENERATION
  // ========================================

  private async generatePathStructure(
    userProfile: UserLearningProfile, 
    objectives: LearningObjective[]
  ): Promise<{
    stages: Array<{
      name: string;
      duration: number;
      wordCount: number;
      difficulty: string;
      objectives: string[];
    }>;
    totalDuration: number;
    totalWords: number;
  }> {
    const stages: Array<{
      name: string;
      duration: number;
      wordCount: number;
      difficulty: string;
      objectives: string[];
    }> = [];
    
    let currentLevel = userProfile.currentLevel;
    let totalDuration = 0;
    let totalWords = 0;
    
    // Create stages for each objective
    objectives.forEach(objective => {
      const stageDuration = Math.min(objective.estimatedDuration, 21); // Max 3 weeks per stage
      const wordCount = this.calculateWordsForStage(stageDuration, userProfile.timeAvailability);
      
      stages.push({
        name: objective.name,
        duration: stageDuration,
        wordCount,
        difficulty: objective.targetLevel,
        objectives: objective.skills
      });
      
      totalDuration += stageDuration;
      totalWords += wordCount;
      currentLevel = objective.targetLevel;
    });
    
    return {
      stages,
      totalDuration,
      totalWords
    };
  }

  private calculateWordsForStage(duration: number, timePerDay: number): number {
    // Calculate how many words can be learned in the given time
    const totalTime = duration * timePerDay; // minutes
    const timePerWord = 5; // minutes per word (learning + review)
    return Math.round(totalTime / timePerWord);
  }

  private async generateCustomPathStructure(
    objectives: LearningObjective[], 
    userProfile: UserLearningProfile, 
    preferences: any
  ): Promise<any> {
    // Similar to generatePathStructure but with custom preferences
    const stages = objectives.map(objective => ({
      name: objective.name,
      duration: objective.estimatedDuration,
      wordCount: this.calculateWordsForStage(objective.estimatedDuration, userProfile.timeAvailability),
      difficulty: objective.targetLevel,
      objectives: objective.skills
    }));
    
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    const totalWords = stages.reduce((sum, stage) => sum + stage.wordCount, 0);
    
    return {
      stages,
      totalDuration,
      totalWords
    };
  }

  // ========================================
  // PATH OPTIMIZATION
  // ========================================

  private async optimizePathForUser(
    pathStructure: any, 
    userProfile: UserLearningProfile
  ): Promise<any> {
    let optimizedStructure = { ...pathStructure };
    
    // Adjust for learning style
    optimizedStructure = this.optimizeForLearningStyle(optimizedStructure, userProfile.learningStyle);
    
    // Adjust for time availability
    optimizedStructure = this.optimizeForTimeAvailability(optimizedStructure, userProfile.timeAvailability);
    
    // Adjust for preferred topics
    optimizedStructure = this.optimizeForTopics(optimizedStructure, userProfile.preferredTopics);
    
    // Adjust for strengths and weaknesses
    optimizedStructure = this.optimizeForStrengthsWeaknesses(optimizedStructure, userProfile);
    
    return optimizedStructure;
  }

  private optimizeForLearningStyle(structure: any, learningStyle: string): any {
    const optimized = { ...structure };
    
    switch (learningStyle) {
      case 'visual':
        // Add more visual elements and spacing
        optimized.stages = optimized.stages.map((stage: any) => ({
          ...stage,
          wordCount: Math.round(stage.wordCount * 0.8) // Fewer words, more visual focus
        }));
        break;
      case 'auditory':
        // Add more repetition and audio elements
        optimized.stages = optimized.stages.map((stage: any) => ({
          ...stage,
          duration: Math.round(stage.duration * 1.2) // More time for audio practice
        }));
        break;
      case 'kinesthetic':
        // Add more interactive elements
        optimized.stages = optimized.stages.map((stage: any) => ({
          ...stage,
          wordCount: Math.round(stage.wordCount * 0.9) // Fewer words, more interaction
        }));
        break;
    }
    
    return optimized;
  }

  private optimizeForTimeAvailability(structure: any, timePerDay: number): any {
    const optimized = { ...structure };
    
    if (timePerDay < 20) {
      // Reduce word count for busy users
      optimized.stages = optimized.stages.map((stage: any) => ({
        ...stage,
        wordCount: Math.round(stage.wordCount * 0.7),
        duration: Math.round(stage.duration * 1.3)
      }));
    } else if (timePerDay > 60) {
      // Increase word count for users with more time
      optimized.stages = optimized.stages.map((stage: any) => ({
        ...stage,
        wordCount: Math.round(stage.wordCount * 1.3),
        duration: Math.round(stage.duration * 0.8)
      }));
    }
    
    return optimized;
  }

  private optimizeForTopics(structure: any, preferredTopics: string[]): any {
    // This would adjust the path to focus on preferred topics
    // For now, return the structure as is
    return structure;
  }

  private optimizeForStrengthsWeaknesses(structure: any, userProfile: UserLearningProfile): any {
    const optimized = { ...structure };
    
    // Reduce duration for strengths
    if (userProfile.strengths.includes('vocabulary retention')) {
      optimized.stages = optimized.stages.map((stage: any) => ({
        ...stage,
        duration: Math.round(stage.duration * 0.9)
      }));
    }
    
    // Increase duration for weaknesses
    if (userProfile.weaknesses.includes('difficult words')) {
      optimized.stages = optimized.stages.map((stage: any) => ({
        ...stage,
        duration: Math.round(stage.duration * 1.2)
      }));
    }
    
    return optimized;
  }

  // ========================================
  // LEARNING PATH CREATION
  // ========================================

  private createLearningPath(
    pathStructure: any, 
    userProfile: UserLearningProfile, 
    objectives: LearningObjective[]
  ): LearningPath {
    const difficulty = this.calculateAverageDifficulty(pathStructure.stages);
    const tags = this.extractTagsFromObjectives(objectives);
    
    return {
      id: crypto.randomUUID(),
      userId: userProfile.userId,
      name: `Personalized Path: ${userProfile.currentLevel} to ${userProfile.targetLevel}`,
      description: `Customized learning path designed for your goals and preferences`,
      difficulty,
      estimatedDuration: pathStructure.totalDuration,
      wordCount: pathStructure.totalWords,
      tags,
      isAdaptive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createCustomLearningPath(
    pathStructure: any, 
    userProfile: UserLearningProfile, 
    name: string, 
    description: string
  ): LearningPath {
    const difficulty = this.calculateAverageDifficulty(pathStructure.stages);
    const tags = ['custom', 'user-defined'];
    
    return {
      id: crypto.randomUUID(),
      userId: userProfile.userId,
      name,
      description,
      difficulty,
      estimatedDuration: pathStructure.totalDuration,
      wordCount: pathStructure.totalWords,
      tags,
      isAdaptive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private calculateAverageDifficulty(stages: any[]): string {
    const difficulties = stages.map(stage => stage.difficulty);
    const difficultyCounts = difficulties.reduce((counts: any, difficulty) => {
      counts[difficulty] = (counts[difficulty] || 0) + 1;
      return counts;
    }, {});
    
    const maxDifficulty = Object.entries(difficultyCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
    
    return maxDifficulty;
  }

  private extractTagsFromObjectives(objectives: LearningObjective[]): string[] {
    const allSkills = objectives.flatMap(obj => obj.skills);
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills.slice(0, 5); // Limit to 5 tags
  }

  // ========================================
  // PATH RECOMMENDATIONS
  // ========================================

  private async generatePathRecommendations(
    userProfile: UserLearningProfile, 
    count: number
  ): Promise<PathRecommendation[]> {
    const recommendations: PathRecommendation[] = [];
    
    // Generate different types of paths
    const pathTypes = [
      'vocabulary_builder',
      'conversation_focused',
      'academic_preparation',
      'business_communication',
      'general_improvement'
    ];
    
    for (const pathType of pathTypes.slice(0, count)) {
      const path = await this.generatePathByType(pathType, userProfile);
      const confidence = this.calculateRecommendationConfidence(path, userProfile);
      const reasoning = this.generateRecommendationReasoning(path, userProfile);
      
      recommendations.push({
        path,
        confidence,
        reasoning,
        estimatedCompletionTime: path.estimatedDuration,
        difficulty: path.difficulty
      });
    }
    
    return recommendations;
  }

  private async generatePathByType(
    pathType: string, 
    userProfile: UserLearningProfile
  ): Promise<LearningPath> {
    const pathConfigs = {
      vocabulary_builder: {
        name: 'Vocabulary Builder',
        description: 'Focus on expanding your vocabulary systematically',
        wordCount: 100,
        duration: 30,
        tags: ['vocabulary', 'systematic', 'comprehensive']
      },
      conversation_focused: {
        name: 'Conversation Mastery',
        description: 'Learn words commonly used in everyday conversations',
        wordCount: 80,
        duration: 25,
        tags: ['conversation', 'everyday', 'practical']
      },
      academic_preparation: {
        name: 'Academic Excellence',
        description: 'Prepare for academic reading and writing',
        wordCount: 120,
        duration: 40,
        tags: ['academic', 'reading', 'writing']
      },
      business_communication: {
        name: 'Business Communication',
        description: 'Master professional vocabulary and expressions',
        wordCount: 90,
        duration: 28,
        tags: ['business', 'professional', 'communication']
      },
      general_improvement: {
        name: 'General Improvement',
        description: 'Well-rounded vocabulary development',
        wordCount: 110,
        duration: 35,
        tags: ['general', 'balanced', 'comprehensive']
      }
    };
    
    const config = pathConfigs[pathType as keyof typeof pathConfigs];
    
    return {
      id: crypto.randomUUID(),
      userId: userProfile.userId,
      name: config.name,
      description: config.description,
      difficulty: userProfile.targetLevel,
      estimatedDuration: config.duration,
      wordCount: config.wordCount,
      tags: config.tags,
      isAdaptive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private calculateRecommendationConfidence(
    path: LearningPath, 
    userProfile: UserLearningProfile
  ): number {
    let confidence = 50; // Base confidence
    
    // Boost confidence for matching difficulty
    if (path.difficulty === userProfile.targetLevel) confidence += 20;
    
    // Boost confidence for matching topics
    const matchingTags = path.tags.filter(tag => 
      userProfile.preferredTopics.some(topic => 
        tag.toLowerCase().includes(topic.toLowerCase())
      )
    );
    confidence += matchingTags.length * 10;
    
    // Boost confidence for appropriate duration
    const timePerDay = userProfile.timeAvailability;
    const estimatedDays = path.estimatedDuration;
    const totalTime = estimatedDays * timePerDay;
    const requiredTime = path.wordCount * 5; // 5 minutes per word
    
    if (Math.abs(totalTime - requiredTime) < 100) confidence += 15;
    
    return Math.min(confidence, 100);
  }

  private generateRecommendationReasoning(
    path: LearningPath, 
    userProfile: UserLearningProfile
  ): string {
    const reasons: string[] = [];
    
    if (path.difficulty === userProfile.targetLevel) {
      reasons.push('matches your target level');
    }
    
    const matchingTags = path.tags.filter(tag => 
      userProfile.preferredTopics.some(topic => 
        tag.toLowerCase().includes(topic.toLowerCase())
      )
    );
    
    if (matchingTags.length > 0) {
      reasons.push(`focuses on ${matchingTags.join(', ')}`);
    }
    
    if (path.wordCount <= 100) {
      reasons.push('manageable word count');
    }
    
    return reasons.join(', ');
  }

  private rankPathRecommendations(
    recommendations: PathRecommendation[], 
    userProfile: UserLearningProfile
  ): PathRecommendation[] {
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  // ========================================
  // OBJECTIVE VALIDATION
  // ========================================

  private async validateObjectives(objectives: string[]): Promise<LearningObjective[]> {
    const validatedObjectives: LearningObjective[] = [];
    
    for (const objective of objectives) {
      const validated = await this.validateSingleObjective(objective);
      if (validated) {
        validatedObjectives.push(validated);
      }
    }
    
    return validatedObjectives;
  }

  private async validateSingleObjective(objective: string): Promise<LearningObjective | null> {
    // This would validate and convert string objectives to structured objectives
    // For now, create a basic objective
    return {
      id: crypto.randomUUID(),
      name: objective,
      description: `Custom objective: ${objective}`,
      targetLevel: 'intermediate',
      estimatedDuration: 21,
      prerequisites: [],
      skills: ['general']
    };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private async getUserLearningProfile(userId: string): Promise<UserLearningProfile> {
    // This would fetch or create a user learning profile
    // For now, return a default profile
    return {
      userId,
      currentLevel: 'intermediate',
      targetLevel: 'advanced',
      learningStyle: 'mixed',
      preferredTopics: ['general', 'business'],
      timeAvailability: 30,
      learningGoals: ['Improve vocabulary'],
      strengths: ['consistent learning'],
      weaknesses: ['difficult words']
    };
  }
} 