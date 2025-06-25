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
├── public/                # Static assets
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
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