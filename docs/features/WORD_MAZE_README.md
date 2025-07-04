# 🧩 Word Maze - AI-Powered Vocabulary Learning System

## 📋 Project Overview

Word Maze is a gamified, AI-powered vocabulary learning system that transforms words into personalized, adaptive maze-style journeys. Learners "travel" through vocabulary paths, solving challenges to unlock and master new words, idioms, phrases, and slang.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  (Maze UI, Challenges, Progress Tracking)                   │
├─────────────────────────────────────────────────────────────┤
│                   API Gateway Layer                         │
│  (Word Maze Engine, User Progress, Challenge Generator)     │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic Layer                       │
│  (Vocabulary Manager, Tagging Engine, Maze Builder)         │
├─────────────────────────────────────────────────────────────┤
│                   Data Aggregation Layer                    │
│  (API Aggregator, Cache Manager, Conflict Resolver)         │
├─────────────────────────────────────────────────────────────┤
│                  External APIs Layer                        │
│  (Oxford, Wordnik, WordNet, Urban Dictionary, etc.)         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Current Status: Stage 1 Foundation

### ✅ Completed
- **Database Schema**: Complete relational schema with 13 tables
- **TypeScript Types**: Full type safety for all data structures
- **API Aggregator**: Multi-source dictionary API integration
- **Vocabulary Manager**: Database operations and word management
- **Basic API Endpoints**: CRUD operations for words
- **Test Interface**: `/word-maze-test` page for testing

### 🔄 In Progress
- Database migration setup
- API key configuration
- Basic word extraction from sessions

### 📋 Next Steps
- AI tagging engine
- Word relationship building
- Basic maze engine
- User progress tracking

## 🛠️ Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Required for database operations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Dictionary API Keys (optional for Stage 1)
OXFORD_APP_ID=your_oxford_app_id
OXFORD_APP_KEY=your_oxford_app_key
WORDNIK_API_KEY=your_wordnik_api_key
TWINWORD_API_KEY=your_twinword_api_key
```

### 2. Database Setup

Run the setup script:

```bash
node scripts/setup-word-maze.js
```

This will:
- Create all database tables
- Add sample words
- Verify the setup

### 3. Test the System

Visit `/word-maze-test` to:
- Add new words
- Search existing words
- View word details
- Test API integration

## 📊 Database Schema

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `word_entries` | Master word records | Type, difficulty, verification |
| `word_definitions` | Multi-source definitions | Confidence scoring, primary flags |
| `word_examples` | Usage examples | Context, source tracking |
| `word_tags` | Categorization | Topic, tone, usage, emotion |
| `word_relationships` | Semantic connections | Synonyms, antonyms, hypernyms |

### User Progress Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_word_mastery` | Learning progress | Mastery scores, attempt tracking |
| `user_learning_sessions` | Session data | Duration, words encountered |
| `user_maze_progress` | Maze completion | Node tracking, path progress |

### Maze Engine Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `maze_paths` | Learning paths | Thematic, difficulty-based |
| `maze_nodes` | Path waypoints | Challenge types, unlock conditions |
| `challenge_templates` | Challenge definitions | Question types, difficulty levels |
| `user_challenge_attempts` | Challenge responses | Performance tracking |

## 🔌 API Integration

### Supported Dictionary APIs

1. **Oxford Dictionaries API**
   - High-quality definitions
   - Academic focus
   - Audio pronunciations

2. **Wordnik API**
   - Modern usage examples
   - Frequency data
   - Related words

3. **Urban Dictionary API**
   - Slang and idioms
   - Modern expressions
   - Community-driven

4. **Twinword API** (Future)
   - Emotion analysis
   - Context tagging
   - Difficulty scoring

### API Aggregation Strategy

- **Fallback Chain**: Oxford → Wordnik → Urban → AI-generated
- **Conflict Resolution**: Confidence-based prioritization
- **Caching**: TTL-based caching for performance
- **Rate Limiting**: Respectful API usage

## 🎯 Development Roadmap

### Stage 1: Foundation ✅
- [x] Database schema design
- [x] Basic API aggregator
- [x] Word extraction from sessions
- [x] Simple word bank

### Stage 2: Intelligence (Weeks 3-4)
- [ ] AI tagging engine
- [ ] Word relationships
- [ ] Basic maze engine
- [ ] User progress tracking

### Stage 3: Gamification (Weeks 5-6)
- [ ] Challenge generator
- [ ] Maze UI/UX
- [ ] Progress visualization
- [ ] Basic gamification

### Stage 4: Polish & Scale (Weeks 7-8)
- [ ] Advanced challenges
- [ ] Performance optimization
- [ ] Analytics dashboard
- [ ] Future-proofing

## 🧠 Key Features (Planned)

### 1. Vocabulary Extraction
- **Live Session Sync**: AI transcribes session audio, extracts key words/phrases
- **Browser Extension**: One-click word capture while reading articles/videos online

### 2. Unified Vocabulary Bank
- Aggregates data from multiple APIs
- Each word entry contains:
  - Definitions (multi-source)
  - Example sentences
  - Audio pronunciation
  - Tags: Part of Speech, Tone, Topic, Usage Type, CEFR level
  - Difficulty Score
  - Mastery Score (per user)
  - Word relationships

### 3. Tagging and Scoring Engine
- AI-generated tags if missing or conflicting
- Normalized tag system across all APIs
- Adaptive difficulty scoring
- Personalized mastery tracking

### 4. Maze Game Engine
- Words form "nodes" in an adaptive maze
- Each node = word + challenge (mini-game, story fill-in, emoji puzzle...)
- Unlocked based on prior performance
- Mixture of standardized vs. personalized paths

## 🔧 Technical Decisions

### Why This Architecture?

1. **Modular Design**: Each layer can be developed and tested independently
2. **API Flexibility**: Easy to add/remove dictionary sources
3. **Scalability**: Database schema supports millions of words and users
4. **Future-Proof**: JSONB fields allow for flexible metadata storage
5. **Performance**: Caching and indexing for fast queries

### Technology Choices

- **Database**: PostgreSQL (Supabase) - Relational with JSONB support
- **Backend**: Next.js API routes - Serverless, TypeScript
- **Frontend**: React with TypeScript - Type safety, component reusability
- **Caching**: In-memory with TTL - Simple, fast, no external dependencies
- **APIs**: RESTful with fallback chains - Reliable, well-documented

## 🧪 Testing

### Current Test Coverage
- Database operations via `/word-maze-test`
- API aggregator with multiple sources
- Vocabulary manager CRUD operations

### Testing Strategy
- **Unit Tests**: Individual service functions
- **Integration Tests**: API endpoints
- **E2E Tests**: Complete user flows
- **Performance Tests**: Load testing with large datasets

## 📈 Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- JSONB for flexible metadata
- Efficient relationship queries

### API Performance
- Caching with appropriate TTLs
- Rate limiting to respect API quotas
- Parallel API calls where possible

### Frontend Optimization
- Lazy loading of word data
- Virtual scrolling for large lists
- Optimistic updates for better UX

## 🔮 Future Enhancements

### Advanced Features
- **WordNet Integration**: Semantic relationship building
- **Machine Learning**: Personalized difficulty adjustment
- **Social Features**: Word sharing, leaderboards
- **Multi-language Support**: Expand beyond English

### Technical Improvements
- **Redis Caching**: Distributed caching for scale
- **GraphQL**: More efficient data fetching
- **WebSockets**: Real-time progress updates
- **PWA**: Offline capability

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement with tests
3. Update documentation
4. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📚 Resources

### API Documentation
- [Oxford Dictionaries API](https://developer.oxforddictionaries.com/)
- [Wordnik API](https://developer.wordnik.com/)
- [Urban Dictionary API](https://api.urbandictionary.com/)

### Learning Resources
- [CEFR Levels](https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages)
- [WordNet](https://wordnet.princeton.edu/)
- [Vocabulary Learning Research](https://scholar.google.com/scholar?q=vocabulary+learning+gamification)

---

**Ready to build the future of vocabulary learning! 🚀** 