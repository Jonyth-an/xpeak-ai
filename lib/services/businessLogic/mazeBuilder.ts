// ========================================
// MAZE BUILDER SYSTEM
// ========================================

import { createClient } from '@supabase/supabase-js';
import { 
  MazePath, 
  MazeNode, 
  MazeConnection, 
  LearningPath,
  UserProgress 
} from './index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MazeBuilderConfig {
  maxNodesPerPath: number;
  minConnectionsPerNode: number;
  difficultySpacing: number;
  adaptiveThreshold: number;
}

export interface MazeGenerationParams {
  userId: string;
  difficulty: string;
  wordCount: number;
  pathType: 'linear' | 'branching' | 'circular' | 'adaptive';
  learningObjectives: string[];
  prerequisites?: string[];
}

export interface NodePosition {
  x: number;
  y: number;
  level: number;
}

export interface PathMetrics {
  totalDistance: number;
  difficultyProgression: number;
  learningEfficiency: number;
  engagementScore: number;
}

export class MazeBuilder {
  private config: MazeBuilderConfig;

  constructor(config: MazeBuilderConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN MAZE BUILDING METHODS
  // ========================================

  async buildAdaptiveMaze(
    learningPath: LearningPath, 
    userProgress: UserProgress
  ): Promise<MazePath> {
    // 1. Analyze user's current level and preferences
    const userLevel = await this.analyzeUserLevel(userProgress);
    
    // 2. Select appropriate words for the maze
    const selectedWords = await this.selectWordsForMaze(learningPath, userLevel);
    
    // 3. Generate maze structure
    const mazeStructure = await this.generateMazeStructure(selectedWords, userLevel);
    
    // 4. Create nodes and connections
    const nodes = await this.createMazeNodes(mazeStructure, userLevel);
    const connections = await this.createMazeConnections(nodes, userLevel);
    
    // 5. Optimize path for learning efficiency
    const optimizedPath = await this.optimizeMazePath(nodes, connections, userLevel);
    
    return {
      id: crypto.randomUUID(),
      learningPathId: learningPath.id,
      nodes: optimizedPath.nodes,
      connections: optimizedPath.connections,
      difficulty: userLevel.currentLevel,
      estimatedTime: this.calculateEstimatedTime(optimizedPath.nodes),
      prerequisites: learningPath.tags,
      learningObjectives: this.generateLearningObjectives(selectedWords)
    };
  }

  async buildCustomMaze(params: MazeGenerationParams): Promise<MazePath> {
    // 1. Validate parameters
    this.validateMazeParams(params);
    
    // 2. Get words based on criteria
    const words = await this.getWordsByCriteria(params);
    
    // 3. Generate maze based on path type
    let nodes: MazeNode[];
    let connections: MazeConnection[];
    
    switch (params.pathType) {
      case 'linear':
        ({ nodes, connections } = await this.buildLinearMaze(words, params));
        break;
      case 'branching':
        ({ nodes, connections } = await this.buildBranchingMaze(words, params));
        break;
      case 'circular':
        ({ nodes, connections } = await this.buildCircularMaze(words, params));
        break;
      case 'adaptive':
        ({ nodes, connections } = await this.buildAdaptiveMaze(words, params));
        break;
      default:
        throw new Error(`Unknown path type: ${params.pathType}`);
    }
    
    return {
      id: crypto.randomUUID(),
      learningPathId: crypto.randomUUID(), // Temporary ID
      nodes,
      connections,
      difficulty: params.difficulty,
      estimatedTime: this.calculateEstimatedTime(nodes),
      prerequisites: params.prerequisites || [],
      learningObjectives: params.learningObjectives
    };
  }

  // ========================================
  // USER LEVEL ANALYSIS
  // ========================================

  private async analyzeUserLevel(userProgress: UserProgress): Promise<{
    currentLevel: string;
    strengths: string[];
    weaknesses: string[];
    learningStyle: string;
    pace: number;
  }> {
    // Analyze user's performance across all words
    const { data: allProgress } = await supabase
      .from('user_word_mastery')
      .select('*')
      .eq('user_id', userProgress.userId);

    if (!allProgress || allProgress.length === 0) {
      return {
        currentLevel: 'beginner',
        strengths: [],
        weaknesses: [],
        learningStyle: 'balanced',
        pace: 1.0
      };
    }

    // Calculate current level
    const avgMastery = allProgress.reduce((sum, p) => sum + p.mastery_level, 0) / allProgress.length;
    let currentLevel = 'beginner';
    if (avgMastery > 70) currentLevel = 'advanced';
    else if (avgMastery > 40) currentLevel = 'intermediate';

    // Analyze strengths and weaknesses
    const strengths = this.analyzeStrengths(allProgress);
    const weaknesses = this.analyzeWeaknesses(allProgress);
    
    // Determine learning style
    const learningStyle = this.determineLearningStyle(allProgress);
    
    // Calculate learning pace
    const pace = this.calculateLearningPace(allProgress);

    return {
      currentLevel,
      strengths,
      weaknesses,
      learningStyle,
      pace
    };
  }

  private analyzeStrengths(progress: any[]): string[] {
    const strengths: string[] = [];
    
    // Find words with high mastery
    const highMasteryWords = progress.filter(p => p.mastery_level > 80);
    
    if (highMasteryWords.length > 0) {
      // Analyze common characteristics
      const wordIds = highMasteryWords.map(p => p.word_id);
      // This would analyze the actual words to find patterns
      strengths.push('vocabulary retention', 'consistent practice');
    }

    return strengths;
  }

  private analyzeWeaknesses(progress: any[]): string[] {
    const weaknesses: string[] = [];
    
    // Find words with low mastery
    const lowMasteryWords = progress.filter(p => p.mastery_level < 30);
    
    if (lowMasteryWords.length > 0) {
      weaknesses.push('difficult words', 'need more review');
    }

    return weaknesses;
  }

  private determineLearningStyle(progress: any[]): string {
    // Analyze patterns in user's learning behavior
    const avgTime = progress.reduce((sum, p) => sum + p.average_time, 0) / progress.length;
    
    if (avgTime < 5000) return 'quick_learner';
    if (avgTime > 15000) return 'thorough_learner';
    return 'balanced';
  }

  private calculateLearningPace(progress: any[]): number {
    // Calculate how quickly user learns new words
    const recentProgress = progress
      .filter(p => new Date(p.last_reviewed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .slice(-10);
    
    if (recentProgress.length === 0) return 1.0;
    
    const avgImprovement = recentProgress.reduce((sum, p) => sum + p.mastery_level, 0) / recentProgress.length;
    return Math.max(0.5, Math.min(2.0, avgImprovement / 50));
  }

  // ========================================
  // WORD SELECTION
  // ========================================

  private async selectWordsForMaze(
    learningPath: LearningPath, 
    userLevel: any
  ): Promise<string[]> {
    // Get words that match the learning path criteria
    const { data: words } = await supabase
      .from('word_entries')
      .select('*')
      .eq('difficulty_level', userLevel.currentLevel)
      .limit(learningPath.wordCount * 2);

    if (!words || words.length === 0) {
      throw new Error('No words available for maze generation');
    }

    // Filter words based on user's strengths and weaknesses
    const filteredWords = await this.filterWordsByUserProfile(words, userLevel);
    
    // Select final words for the maze
    return this.selectOptimalWords(filteredWords, learningPath.wordCount);
  }

  private async filterWordsByUserProfile(words: any[], userLevel: any): Promise<any[]> {
    // Filter out words the user has already mastered
    const { data: userMastery } = await supabase
      .from('user_word_mastery')
      .select('word_id, mastery_level')
      .in('word_id', words.map(w => w.id));

    const masteredWordIds = new Set(
      userMastery?.filter(m => m.mastery_level > 80).map(m => m.word_id) || []
    );

    return words.filter(word => !masteredWordIds.has(word.id));
  }

  private selectOptimalWords(words: any[], targetCount: number): string[] {
    // Use a scoring system to select the best words
    const scoredWords = words.map(word => ({
      word,
      score: this.calculateWordScore(word)
    }));

    // Sort by score and select top words
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .map(sw => sw.word.id);
  }

  private calculateWordScore(word: any): number {
    let score = 0;
    
    // Base score from difficulty
    score += word.difficulty_score || 50;
    
    // Bonus for words with rich data
    if (word.definitions?.length > 1) score += 10;
    if (word.examples?.length > 0) score += 5;
    if (word.tags?.length > 2) score += 5;
    
    return score;
  }

  // ========================================
  // MAZE STRUCTURE GENERATION
  // ========================================

  private async generateMazeStructure(
    wordIds: string[], 
    userLevel: any
  ): Promise<{
    nodes: Array<{ wordId: string; position: NodePosition; type: string }>;
    connections: Array<{ from: number; to: number; weight: number }>;
  }> {
    const nodes: Array<{ wordId: string; position: NodePosition; type: string }> = [];
    const connections: Array<{ from: number; to: number; weight: number }> = [];

    // Create start node
    nodes.push({
      wordId: '',
      position: { x: 0, y: 0, level: 0 },
      type: 'start'
    });

    // Create word nodes
    const wordsPerLevel = Math.ceil(wordIds.length / 3);
    for (let i = 0; i < wordIds.length; i++) {
      const level = Math.floor(i / wordsPerLevel) + 1;
      const positionInLevel = i % wordsPerLevel;
      
      nodes.push({
        wordId: wordIds[i],
        position: {
          x: positionInLevel * 200,
          y: level * 150,
          level
        },
        type: 'word'
      });
    }

    // Create end node
    nodes.push({
      wordId: '',
      position: { x: 0, y: (Math.ceil(wordIds.length / wordsPerLevel) + 1) * 150, level: Math.ceil(wordIds.length / wordsPerLevel) + 1 },
      type: 'end'
    });

    // Create connections
    for (let i = 0; i < nodes.length - 1; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      
      if (fromNode.level < toNode.level) {
        connections.push({
          from: i,
          to: i + 1,
          weight: this.calculateConnectionWeight(fromNode, toNode, userLevel)
        });
      }
    }

    // Add some cross-level connections for variety
    this.addCrossLevelConnections(nodes, connections, userLevel);

    return { nodes, connections };
  }

  private calculateConnectionWeight(
    fromNode: any, 
    toNode: any, 
    userLevel: any
  ): number {
    let weight = 1.0;
    
    // Adjust weight based on user's learning pace
    weight *= userLevel.pace;
    
    // Adjust weight based on difficulty difference
    if (fromNode.level < toNode.level) {
      weight *= 1.2; // Slightly harder
    }
    
    return weight;
  }

  private addCrossLevelConnections(
    nodes: any[], 
    connections: any[], 
    userLevel: any
  ): void {
    // Add some connections that skip levels for advanced users
    if (userLevel.currentLevel === 'advanced') {
      for (let i = 0; i < nodes.length - 2; i++) {
        if (Math.random() < 0.3) { // 30% chance
          connections.push({
            from: i,
            to: i + 2,
            weight: 1.5 // Higher weight for skipping
          });
        }
      }
    }
  }

  // ========================================
  // NODE AND CONNECTION CREATION
  // ========================================

  private async createMazeNodes(
    structure: any, 
    userLevel: any
  ): Promise<MazeNode[]> {
    return structure.nodes.map((node: any, index: number) => ({
      id: crypto.randomUUID(),
      wordId: node.wordId,
      nodeType: node.type as 'start' | 'word' | 'quiz' | 'review' | 'end',
      difficulty: userLevel.currentLevel,
      position: { x: node.position.x, y: node.position.y },
      metadata: {
        level: node.position.level,
        index,
        learningStyle: userLevel.learningStyle
      }
    }));
  }

  private async createMazeConnections(
    nodes: MazeNode[], 
    userLevel: any
  ): Promise<MazeConnection[]> {
    // This would create connections based on the structure
    // For now, create simple linear connections
    const connections: MazeConnection[] = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: crypto.randomUUID(),
        fromNodeId: nodes[i].id,
        toNodeId: nodes[i + 1].id,
        weight: 1.0
      });
    }
    
    return connections;
  }

  // ========================================
  // PATH OPTIMIZATION
  // ========================================

  private async optimizeMazePath(
    nodes: MazeNode[], 
    connections: MazeConnection[], 
    userLevel: any
  ): Promise<{ nodes: MazeNode[]; connections: MazeConnection[] }> {
    // 1. Optimize node order for learning efficiency
    const optimizedNodes = this.optimizeNodeOrder(nodes, userLevel);
    
    // 2. Optimize connections for engagement
    const optimizedConnections = this.optimizeConnections(connections, userLevel);
    
    // 3. Calculate path metrics
    const metrics = this.calculatePathMetrics(optimizedNodes, optimizedConnections);
    
    // 4. Adjust if needed based on metrics
    if (metrics.learningEfficiency < 0.7) {
      return this.improveLearningEfficiency(optimizedNodes, optimizedConnections);
    }
    
    return { nodes: optimizedNodes, connections: optimizedConnections };
  }

  private optimizeNodeOrder(nodes: MazeNode[], userLevel: any): MazeNode[] {
    // Sort nodes by difficulty and learning style
    return nodes.sort((a, b) => {
      const aLevel = a.metadata?.level || 0;
      const bLevel = b.metadata?.level || 0;
      
      // For thorough learners, prefer more gradual progression
      if (userLevel.learningStyle === 'thorough_learner') {
        return aLevel - bLevel;
      }
      
      // For quick learners, allow more variation
      return Math.random() - 0.5;
    });
  }

  private optimizeConnections(connections: MazeConnection[], userLevel: any): MazeConnection[] {
    // Adjust connection weights based on user's learning style
    return connections.map(connection => ({
      ...connection,
      weight: connection.weight * (userLevel.pace || 1.0)
    }));
  }

  private calculatePathMetrics(nodes: MazeNode[], connections: MazeConnection[]): PathMetrics {
    const totalDistance = connections.reduce((sum, conn) => sum + conn.weight, 0);
    const difficultyProgression = this.calculateDifficultyProgression(nodes);
    const learningEfficiency = this.calculateLearningEfficiency(nodes, connections);
    const engagementScore = this.calculateEngagementScore(nodes, connections);
    
    return {
      totalDistance,
      difficultyProgression,
      learningEfficiency,
      engagementScore
    };
  }

  private calculateDifficultyProgression(nodes: MazeNode[]): number {
    // Calculate how smoothly difficulty increases
    const levels = nodes.map(n => n.metadata?.level || 0);
    let progression = 0;
    
    for (let i = 1; i < levels.length; i++) {
      progression += Math.abs(levels[i] - levels[i - 1]);
    }
    
    return 1 / (1 + progression); // Higher score for smoother progression
  }

  private calculateLearningEfficiency(nodes: MazeNode[], connections: MazeConnection[]): number {
    // Calculate how efficiently the path covers learning objectives
    const wordNodes = nodes.filter(n => n.nodeType === 'word');
    const totalConnections = connections.length;
    
    if (wordNodes.length === 0) return 0;
    
    // Efficiency based on word coverage and path length
    return wordNodes.length / (totalConnections + 1);
  }

  private calculateEngagementScore(nodes: MazeNode[], connections: MazeConnection[]): number {
    // Calculate how engaging the path is
    let score = 0;
    
    // Bonus for variety in node types
    const nodeTypes = new Set(nodes.map(n => n.nodeType));
    score += nodeTypes.size * 0.2;
    
    // Bonus for branching paths
    const connectionCounts = new Map<string, number>();
    connections.forEach(conn => {
      connectionCounts.set(conn.fromNodeId, (connectionCounts.get(conn.fromNodeId) || 0) + 1);
    });
    
    const avgConnections = Array.from(connectionCounts.values()).reduce((sum, count) => sum + count, 0) / connectionCounts.size;
    score += Math.min(avgConnections * 0.1, 0.5);
    
    return Math.min(score, 1.0);
  }

  private improveLearningEfficiency(
    nodes: MazeNode[], 
    connections: MazeConnection[]
  ): { nodes: MazeNode[]; connections: MazeConnection[] } {
    // Add review nodes at strategic points
    const reviewNodes: MazeNode[] = [];
    const reviewConnections: MazeConnection[] = [];
    
    // Add review after every 3 words
    for (let i = 3; i < nodes.length; i += 3) {
      if (nodes[i]?.nodeType === 'word') {
        const reviewNode: MazeNode = {
          id: crypto.randomUUID(),
          wordId: '',
          nodeType: 'review',
          difficulty: nodes[i].difficulty,
          position: { x: nodes[i].position.x + 100, y: nodes[i].position.y },
          metadata: { reviewFor: nodes[i].id }
        };
        
        reviewNodes.push(reviewNode);
        
        // Add connections to and from review node
        reviewConnections.push({
          id: crypto.randomUUID(),
          fromNodeId: nodes[i].id,
          toNodeId: reviewNode.id,
          weight: 0.5
        });
        
        if (nodes[i + 1]) {
          reviewConnections.push({
            id: crypto.randomUUID(),
            fromNodeId: reviewNode.id,
            toNodeId: nodes[i + 1].id,
            weight: 0.5
          });
        }
      }
    }
    
    return {
      nodes: [...nodes, ...reviewNodes],
      connections: [...connections, ...reviewConnections]
    };
  }

  // ========================================
  // SPECIALIZED MAZE TYPES
  // ========================================

  private async buildLinearMaze(words: string[], params: MazeGenerationParams): Promise<{
    nodes: MazeNode[];
    connections: MazeConnection[];
  }> {
    const nodes: MazeNode[] = [];
    const connections: MazeConnection[] = [];
    
    // Start node
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'start',
      difficulty: params.difficulty,
      position: { x: 0, y: 0 },
      metadata: {}
    });
    
    // Word nodes in a line
    words.forEach((wordId, index) => {
      nodes.push({
        id: crypto.randomUUID(),
        wordId,
        nodeType: 'word',
        difficulty: params.difficulty,
        position: { x: (index + 1) * 200, y: 0 },
        metadata: { order: index + 1 }
      });
    });
    
    // End node
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'end',
      difficulty: params.difficulty,
      position: { x: (words.length + 1) * 200, y: 0 },
      metadata: {}
    });
    
    // Linear connections
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: crypto.randomUUID(),
        fromNodeId: nodes[i].id,
        toNodeId: nodes[i + 1].id,
        weight: 1.0
      });
    }
    
    return { nodes, connections };
  }

  private async buildBranchingMaze(words: string[], params: MazeGenerationParams): Promise<{
    nodes: MazeNode[];
    connections: MazeConnection[];
  }> {
    const nodes: MazeNode[] = [];
    const connections: MazeConnection[] = [];
    
    // Start node
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'start',
      difficulty: params.difficulty,
      position: { x: 0, y: 0 },
      metadata: {}
    });
    
    // Create branching structure
    const branches = 3;
    const wordsPerBranch = Math.ceil(words.length / branches);
    
    for (let branch = 0; branch < branches; branch++) {
      const branchWords = words.slice(branch * wordsPerBranch, (branch + 1) * wordsPerBranch);
      
      branchWords.forEach((wordId, index) => {
        nodes.push({
          id: crypto.randomUUID(),
          wordId,
          nodeType: 'word',
          difficulty: params.difficulty,
          position: { 
            x: (branch - 1) * 300 + index * 150, 
            y: (index + 1) * 100 
          },
          metadata: { branch, order: index + 1 }
        });
      });
    }
    
    // End node
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'end',
      difficulty: params.difficulty,
      position: { x: 0, y: (Math.max(...nodes.map(n => n.position.y)) + 100) },
      metadata: {}
    });
    
    // Create connections
    this.createBranchingConnections(nodes, connections);
    
    return { nodes, connections };
  }

  private async buildCircularMaze(words: string[], params: MazeGenerationParams): Promise<{
    nodes: MazeNode[];
    connections: MazeConnection[];
  }> {
    const nodes: MazeNode[] = [];
    const connections: MazeConnection[] = [];
    
    // Start node at center
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'start',
      difficulty: params.difficulty,
      position: { x: 0, y: 0 },
      metadata: {}
    });
    
    // Arrange words in a circle
    const radius = 200;
    const angleStep = (2 * Math.PI) / words.length;
    
    words.forEach((wordId, index) => {
      const angle = index * angleStep;
      nodes.push({
        id: crypto.randomUUID(),
        wordId,
        nodeType: 'word',
        difficulty: params.difficulty,
        position: { 
          x: Math.cos(angle) * radius, 
          y: Math.sin(angle) * radius 
        },
        metadata: { angle, order: index + 1 }
      });
    });
    
    // End node at center
    nodes.push({
      id: crypto.randomUUID(),
      wordId: '',
      nodeType: 'end',
      difficulty: params.difficulty,
      position: { x: 0, y: 0 },
      metadata: {}
    });
    
    // Create circular connections
    this.createCircularConnections(nodes, connections);
    
    return { nodes, connections };
  }

  private createBranchingConnections(nodes: MazeNode[], connections: MazeConnection[]): void {
    // Connect start to first word of each branch
    const startNode = nodes.find(n => n.nodeType === 'start');
    const wordNodes = nodes.filter(n => n.nodeType === 'word');
    
    if (startNode) {
      const firstWords = wordNodes.filter(n => n.metadata?.order === 1);
      firstWords.forEach(word => {
        connections.push({
          id: crypto.randomUUID(),
          fromNodeId: startNode.id,
          toNodeId: word.id,
          weight: 1.0
        });
      });
    }
    
    // Connect words within each branch
    const branches = new Set(wordNodes.map(n => n.metadata?.branch));
    branches.forEach(branch => {
      const branchWords = wordNodes
        .filter(n => n.metadata?.branch === branch)
        .sort((a, b) => (a.metadata?.order || 0) - (b.metadata?.order || 0));
      
      for (let i = 0; i < branchWords.length - 1; i++) {
        connections.push({
          id: crypto.randomUUID(),
          fromNodeId: branchWords[i].id,
          toNodeId: branchWords[i + 1].id,
          weight: 1.0
        });
      }
    });
  }

  private createCircularConnections(nodes: MazeNode[], connections: MazeConnection[]): void {
    const wordNodes = nodes.filter(n => n.nodeType === 'word');
    
    // Connect words in a circle
    for (let i = 0; i < wordNodes.length; i++) {
      const fromNode = wordNodes[i];
      const toNode = wordNodes[(i + 1) % wordNodes.length];
      
      connections.push({
        id: crypto.randomUUID(),
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        weight: 1.0
      });
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private validateMazeParams(params: MazeGenerationParams): void {
    if (params.wordCount <= 0) {
      throw new Error('Word count must be positive');
    }
    
    if (params.wordCount > this.config.maxNodesPerPath) {
      throw new Error(`Word count exceeds maximum allowed (${this.config.maxNodesPerPath})`);
    }
    
    if (!['beginner', 'intermediate', 'advanced'].includes(params.difficulty)) {
      throw new Error('Invalid difficulty level');
    }
  }

  private async getWordsByCriteria(params: MazeGenerationParams): Promise<string[]> {
    const { data: words } = await supabase
      .from('word_entries')
      .select('*')
      .eq('difficulty_level', params.difficulty)
      .limit(params.wordCount * 2);

    if (!words || words.length === 0) {
      throw new Error('No words available for maze generation');
    }

    // Randomly select words
    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, params.wordCount).map(w => w.id);
  }

  private calculateEstimatedTime(nodes: MazeNode[]): number {
    // Estimate 2 minutes per word node
    const wordNodes = nodes.filter(n => n.nodeType === 'word');
    return wordNodes.length * 2;
  }

  private generateLearningObjectives(words: string[]): string[] {
    return [
      'Expand vocabulary in target difficulty level',
      'Improve word recognition and understanding',
      'Practice word usage in context',
      'Build confidence with new vocabulary'
    ];
  }
} 