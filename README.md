# 🚀 DSA Practice Tracker

A beautiful and comprehensive **Data Structures & Algorithms Practice Tracker** built with Next.js, React, and TypeScript. Track your coding journey across multiple curated problem sheets with advanced features like progress tracking, notes, revision scheduling, and data export/import.

![DSA Practice Tracker](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC)

## ✨ Features

### 🎯 **Core Functionality**
- **Multiple Problem Sheets**: Support for A2Z DSA Course, SDE Sheet, Blind 75, and Striver 79
- **Progress Tracking**: Visual progress indicators with completion percentage
- **Smart Filtering**: Filter by difficulty, status, topic, or search by problem name
- **Dual View Modes**: Switch between "All Problems" and organized "Step View"
- **Notes System**: Add personal notes to any problem
- **Revision Tracking**: Mark problems for revision and track your learning

### 🎨 **Beautiful UI/UX**
- **Modern Design**: Clean interface with gradient backgrounds and glassmorphism effects
- **Dark Mode**: Seamless light/dark theme switching
- **Responsive**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: Delightful micro-interactions throughout
- **Loading States**: Professional loading indicators and transitions

### 📊 **Advanced Analytics**
- **Daily Goals**: Set and track daily problem-solving targets
- **Streak Counter**: Maintain coding streaks with visual indicators
- **Achievement System**: Unlock badges as you progress
- **Study Timer**: Built-in timer for focused practice sessions
- **Progress Rings**: Beautiful circular progress indicators

### 💾 **Data Management**
- **Local Storage**: All data stored locally in JSON files
- **Export/Import**: Full backup system with ZIP-based data export/import
- **Data Persistence**: Never lose your progress across browser sessions
- **Bulk Operations**: Efficient handling of large datasets

### 🔧 **Developer Features**
- **TypeScript**: Full type safety throughout the application
- **API Routes**: RESTful API design with Next.js App Router
- **Component Architecture**: Reusable UI components with shadcn/ui
- **Modern Build**: Turbopack for lightning-fast development

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.3.5](https://nextjs.org/) with App Router
- **Frontend**: [React 19](https://react.dev/) with TypeScript
- **Styling**: [TailwindCSS 4.0](https://tailwindcss.com/) with custom animations
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **File Handling**: [JSZip](https://stuk.github.io/jszip/) for data export/import
- **Development**: [Turbopack](https://turbo.build/) for fast builds

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ankitgupta23022/dsa-practice-ui.git
   cd dsa-practice-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Configuration

The application uses the following configuration files:
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - shadcn/ui components configuration

No additional environment variables are required - the app works out of the box!

### Building for Production

```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── backup/       # Export/import functionality  
│   │   ├── profile/      # User profile management
│   │   ├── progress/     # Progress tracking
│   │   ├── notes/        # Notes management
│   │   ├── revision/     # Revision tracking
│   │   └── sheets/       # Sheet data serving
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application
├── components/
│   ├── ui/              # Reusable UI components (badge, button, card)
│   └── OnboardingScreen.tsx  # User onboarding component
├── lib/                 # Utility libraries
│   └── utils.ts         # Tailwind utilities
├── types/               # TypeScript definitions
│   └── sheets.ts        # Sheet type definitions
└── utils/               # Utility functions
    └── sheetLoader.ts   # Sheet data loading utilities

data/
├── sheets/              # Static sheet data
│   ├── a2z_sheet_data.json
│   ├── sde_sheet_data.json
│   ├── blind_75_data.json
│   └── striver_79_data.json
└── user/               # User-specific data
    ├── profile.json
    ├── progress.json
    ├── notes.json
    └── revision.json
```

## 🎯 How to Use

### Getting Started
1. **First Visit**: Complete the onboarding to set your goals
2. **Choose a Sheet**: Select from A2Z DSA, SDE Sheet, Blind 75, or Striver 79
3. **Track Progress**: Mark problems as completed, add notes, mark for revision
4. **Stay Motivated**: Watch your streak grow and unlock achievements

### Key Features
- **Search**: Find problems by title or topic
- **Filter**: By difficulty (Easy/Medium/Hard) or status
- **Notes**: Click the note icon to add personal notes
- **Revision**: Mark problems for future review
- **Export**: Backup your progress as a ZIP file
- **Import**: Restore from a previous backup

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Data Storage**: JSON files with API routes
- **Archive**: JSZip for export/import functionality

## 📊 Supported Problem Sheets

1. **A2Z DSA Course** (TakeUForward) - Comprehensive DSA curriculum
2. **SDE Sheet** - Software Engineer interview preparation
3. **Blind 75** - Most important LeetCode problems
4. **Striver 79** - Curated problem set by Striver

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add appropriate error handling
- Update documentation as needed

## 🔧 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

**Node.js version compatibility**
- Ensure you're using Node.js 18.0.0 or higher
- Use `node --version` to check your current version
- Consider using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

**Build errors**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Data not persisting**
- Check browser local storage permissions
- Ensure the `data/` directory exists and is writable
- Try exporting and re-importing your data

## 🙏 Acknowledgments

- **TakeUForward** for the amazing A2Z DSA Course content
- **Striver** for curated problem sets and educational content
- **LeetCode** for providing the platform for problem practice
- **Radix UI** for excellent headless UI components
- **Vercel** for Next.js and deployment platform

## 🌟 Star History

If this project helped you in your DSA journey, please consider giving it a star! ⭐

---

**Built with ❤️ for the coding community**

*Happy Coding! 🚀*
