# Xpeak AI - Language Learning Platform

A modern, AI-powered language learning platform built with React, Next.js, and Tailwind CSS.

## Features

- **Sticky Header Navigation**: Clean navigation with logo, menu items, and action buttons
- **Responsive Hero Section**: Split layout with compelling copy and hero image
- **Multiple Pages**: Home, Tutors, AI Topics, Word Maze, Pricing, and Become a Tutor
- **Modern Design**: Clean, professional UI with Tailwind CSS
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd xpeak-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
xpeak-ai/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Root page (redirects to /home)
│   ├── home/              # Home page
│   ├── tutors/            # Tutors page
│   ├── ai-topics/         # AI Topics page
│   ├── word-maze/         # Word Maze page
│   ├── pricing/           # Pricing page
│   └── become-a-tutor/    # Become a Tutor page
├── components/            # Reusable components
│   ├── Layout.tsx         # Shared layout with header/footer
│   ├── Header.tsx         # Sticky header component
│   └── Footer.tsx         # Footer component
├── tests/                 # Test files and scripts
│   ├── api/              # API and service tests
│   ├── integration/      # Integration and end-to-end tests
│   ├── migration/        # Database migration scripts
│   ├── setup/            # Setup and configuration tests
│   └── utils/            # Utility and cleanup scripts
├── docs/                  # Documentation
│   ├── features/         # Feature-specific documentation
│   ├── architecture/     # System architecture and design
│   ├── setup/            # Setup and configuration guides
│   ├── development/      # Development guidelines and processes
│   └── api/              # API documentation and guides
├── database/              # Database migrations
│   └── migrations/       # SQL migration files
├── scripts/              # Build and deployment scripts
├── public/                # Static assets
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## Documentation

The project includes comprehensive documentation organized in the `/docs` directory:

- **Features** (`/docs/features/`): Feature-specific documentation and UI components
- **Architecture** (`/docs/architecture/`): System architecture and design decisions
- **Setup** (`/docs/setup/`): Configuration and setup guides
- **Development** (`/docs/development/`): Development guidelines and processes
- **API** (`/docs/api/`): API documentation and guides

For detailed documentation, see [docs/README.md](docs/README.md).

## Database

The project includes database migrations organized in the `/database` directory:

- **Migrations** (`/database/migrations/`): SQL migration files for database schema changes

For detailed information about database migrations, see [database/README.md](database/README.md).

### Running Migrations

```bash
# Run a specific migration
psql -d your_database -f database/migrations/migration_name.sql

# Check migration status
node tests/migration/check_migration_status.js
```

## Testing

The project includes comprehensive test files organized in the `/tests` directory:

- **API Tests** (`/tests/api/`): Individual API and service tests
- **Integration Tests** (`/tests/integration/`): End-to-end and integration tests
- **Migration Scripts** (`/tests/migration/`): Database migration and setup scripts
- **Setup Tests** (`/tests/setup/`): Configuration and setup verification tests
- **Utility Scripts** (`/tests/utils/`): Utility and cleanup scripts

For detailed information about running tests, see [tests/README.md](tests/README.md).

### Quick Test Examples

```bash
# Run API tests
node tests/api/test-basic-api.js

# Run integration tests
node tests/integration/test-oauth-flow.js

# Run migration scripts
node tests/migration/check_migration_status.js
```

## Pages

### Home (`/home`)
- Hero section with compelling copy and call-to-action buttons
- Features section highlighting platform benefits
- Responsive design with mobile-first approach

### Tutors (`/tutors`)
- Grid layout showcasing available language tutors
- Tutor cards with profile information and booking buttons
- Responsive design for different screen sizes

### AI Topics (`/ai-topics`)
- Interactive topic cards for AI-powered learning
- Different conversation categories (Daily, Business, Travel)
- Clean card-based layout

### Word Maze (`/word-maze`)
- Gaming interface preview
- Feature highlights for the word maze game
- Split layout with game preview and benefits

### Pricing (`/pricing`)
- Three-tier pricing structure (Free, Pro, Premium)
- Feature comparison with clear value propositions
- Highlighted "Most Popular" plan

### Become a Tutor (`/become-a-tutor`)
- Application form for potential tutors
- Benefits section explaining tutor advantages
- Comprehensive form with multiple input fields

## Components

### Layout Component
- Wraps all pages with consistent header and footer
- Handles responsive layout structure
- Provides consistent spacing and styling

### Header Component
- Sticky navigation with scroll effects
- Logo, navigation menu, and action buttons
- Mobile-responsive with hamburger menu
- Language selector dropdown

### Footer Component
- Three-column layout with company info, links, and newsletter
- Social media icons (placeholder)
- Email subscription form
- Copyright information

## Styling

The project uses Tailwind CSS for styling with:
- Custom color palette with primary blue theme
- Responsive design utilities
- Modern typography with Inter font
- Consistent spacing and layout patterns

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

- Colors: Modify `tailwind.config.js` to change the color scheme
- Typography: Update font imports in `globals.css`
- Layout: Adjust spacing and grid layouts in component files

## Deployment

The project can be deployed to various platforms:

- **Vercel**: Recommended for Next.js projects
- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository. 