# DNG - Digital Music Notation System

A modern, web-based music notation editor that allows users to create, edit, and manage musical scores with an intuitive interface and powerful features.

## 🎵 Project Overview

DNG (Digital Notation Generator) is a comprehensive music notation system built with React, TypeScript, and Supabase. It provides musicians, composers, and music educators with a powerful tool for creating and editing musical scores with real-time collaboration capabilities.

### Key Capabilities
- **Interactive Score Creation**: Place notes using keyboard, mouse, or MIDI input
- **Real-time Collaboration**: Multiple users can work on the same score simultaneously
- **Professional Notation**: Support for various musical symbols, articulations, and text annotations
- **Export & Sharing**: Export scores as PDF and share with others
- **Cross-platform**: Works on desktop and mobile devices

## ✨ Features

### 🎼 Core Notation Features
- **Multi-input Note Placement**: Keyboard (a-z, A-S), mouse click, or MIDI device input
- **45+ Musical Symbols**: Comprehensive library of notes, rests, and musical symbols
- **Smart Positioning**: Automatic line wrapping and measure calculation
- **Real-time Preview**: See notes as you place them with visual feedback

### 🖱️ Interactive Features
- **Drag & Drop**: Freely move notes horizontally and vertically across the canvas
- **Snap-to-Grid**: Optional snapping to staff lines for precise placement
- **Visual Feedback**: Hover effects, drag indicators, and smooth animations
- **Multi-touch Support**: Touch-friendly interface for mobile devices

### 📝 Text & Annotations
- **Rich Text Elements**: Add text with customizable font size, bold, italic, underline
- **Articulation Marks**: Add musical articulations (staccato, accent, fermata, etc.)
- **Drag & Move**: Reposition text and articulation elements freely
- **Hover Controls**: Delete buttons appear on hover for clean interface

### ↩️ Undo/Redo System
- **Complete History**: Track all actions (placement, movement, deletion, text, articulations)
- **Keyboard Shortcuts**: Ctrl+Z (Undo), Ctrl+Y (Redo)
- **Visual Feedback**: Buttons show availability state
- **Performance Optimized**: Efficient state management with 50-state history limit

### 🎹 Playback & MIDI
- **MIDI Input Support**: Connect MIDI devices for real-time note input
- **Piano Interface**: Virtual piano for note selection and testing
- **Audio Preview**: Hear notes as you place them (future enhancement)

### 📊 Score Management
- **Multiple Scores**: Create and manage multiple musical scores
- **Auto-save**: Automatic saving to cloud database
- **Export Options**: Export scores as PDF with high resolution
- **Collaboration**: Real-time multi-user editing (future enhancement)

### 🎨 Customization
- **Score Settings**: Customize time signatures, key signatures, tempo
- **Drawing Tools**: Freehand drawing and eraser tools
- **Theme Support**: Light/dark mode (future enhancement)

## 🏗️ Project Structure

```
DNG/
├── public/                    # Static assets
│   ├── images/               # Score backgrounds and UI images
│   └── Notes/                # Musical notation images (A-Z, a-z)
├── src/
│   ├── components/           # React components
│   │   ├── Auth.tsx         # Authentication component
│   │   ├── HomePage.tsx     # Project selection page
│   │   ├── NotePalette.tsx  # Musical symbol palette
│   │   ├── Piano.tsx        # Virtual piano interface
│   │   ├── ProjectHeader.tsx # Project header with controls
│   │   ├── RightSidebar.tsx # Tools and settings sidebar
│   │   └── ScoreSheet.tsx   # Main score editing interface
│   ├── data/
│   │   └── notations.ts     # Musical notation definitions
│   ├── hooks/
│   │   ├── useSupabase.ts   # Database operations hook
│   │   └── useUndoRedo.ts   # Undo/redo functionality hook
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client configuration
│   │   ├── test-connection.ts # Database connection testing
│   │   └── utils.ts         # Utility functions
│   ├── types/
│   │   └── music.ts         # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DNG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   - Run the SQL script in `FINAL_DATABASE_SETUP.sql` in your Supabase SQL editor
   - This creates the necessary tables for notes, projects, and user data

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Navigate to `http://localhost:5173`
   - The application should load with authentication

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contribution Guide

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- **Code Style**: Follow TypeScript best practices and ESLint rules
- **Testing**: Add tests for new features
- **Documentation**: Update README and add code comments
- **Performance**: Optimize for smooth user experience
- **Accessibility**: Ensure features work with screen readers

### Adding New Features
1. **Musical Symbols**: Add new notations in `src/data/notations.ts`
2. **UI Components**: Create reusable components in `src/components/`
3. **Database Operations**: Extend `src/hooks/useSupabase.ts`
4. **Styling**: Use Tailwind CSS classes for consistent design

### Bug Reports
- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide browser/device information
- Attach screenshots if relevant

## 🔮 Future Scope

### 🎵 Enhanced Notation
- **Advanced Symbols**: Grace notes, tuplets, complex time signatures
- **Multiple Voices**: Support for multiple instrument parts
- **Chord Symbols**: Jazz chord notation and guitar tabs
- **Lyrics Support**: Add lyrics with proper alignment

### 🎼 Playback Features
- **Audio Playback**: Hear the music as you write it
- **Tempo Control**: Adjust playback speed
- **Instrument Sounds**: Multiple instrument voices
- **Metronome**: Built-in metronome for timing

### 📱 Mobile & Touch
- **Touch Optimization**: Better mobile experience
- **Gesture Support**: Pinch to zoom, swipe gestures
- **Offline Mode**: Work without internet connection
- **Mobile App**: Native iOS/Android apps

### 🌐 Collaboration
- **Real-time Editing**: Multiple users editing simultaneously
- **Comments & Feedback**: Add comments to specific measures
- **Version Control**: Track changes and revert to previous versions
- **Sharing**: Share scores via links or social media

### 🎨 Advanced Features
- **Score Templates**: Pre-built templates for different genres
- **Auto-arrangement**: AI-powered score arrangement
- **Print Layout**: Professional print formatting
- **Multiple Formats**: Export to MusicXML, MIDI, Sibelius

### 🔧 Technical Improvements
- **Performance**: WebAssembly for complex calculations
- **Caching**: Intelligent caching for large scores
- **PWA**: Progressive Web App capabilities
- **API**: Public API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **VexFlow**: Musical notation rendering library
- **Supabase**: Backend-as-a-Service platform
- **React**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server

## 📞 Support

- **Documentation**: Check the [Wiki](../../wiki) for detailed guides
- **Issues**: Report bugs and request features on [GitHub Issues](../../issues)
- **Discussions**: Join community discussions on [GitHub Discussions](../../discussions)
- **Email**: Contact the development team at support@dng-music.com

---

**Made with ❤️ for musicians everywhere**
