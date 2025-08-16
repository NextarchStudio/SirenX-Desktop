# SirenX Desktop - Technical Documentation

This document contains all technical information for developers, contributors, and advanced users of SirenX Desktop.

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome Pro+** - Professional icon library

### 3D Rendering
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber

### Desktop Framework
- **Electron** - Cross-platform desktop application framework
- **Electron Builder** - Application packaging and distribution

### Build Tools & Development
- **Vite** - Fast build tool and dev server
- **TypeScript Compiler** - Type checking and compilation
- **PostCSS** - CSS processing with Tailwind
- **ESLint** - Code quality and consistency

### State Management
- **Zustand** - Lightweight state management
- **React Context** - Component state sharing

### File Handling
- **Node.js fs-extra** - Enhanced file system operations
- **Electron IPC** - Secure inter-process communication

## 📋 Prerequisites

### Development Environment
- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **TypeScript** knowledge
- **React** development experience

### System Requirements
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Graphics**: OpenGL 3.3+ compatible

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/NextarchStudio/SirenX-Desktop.git
cd SirenX-Desktop
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Development Mode
```bash
npm run dev
```

This starts both the Electron main process and Vite dev server with hot reloading.

### 4. Build for Production
```bash
npm run build
```

### 5. Create Executables
```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux

# All platforms
npm run dist
```

## 🔧 Configuration Files

### TypeScript Configuration
- **tsconfig.json** - Main TypeScript configuration
- **tsconfig.electron.json** - Electron process TypeScript settings
- **tsconfig.node.json** - Node.js build TypeScript settings

### Build Configuration
- **vite.config.ts** - Vite build tool configuration
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.js** - CSS processing pipeline

### Package Configuration
- **package.json** - Dependencies, scripts, and metadata
- **package-lock.json** - Dependency lock file

## 🎮 Application Architecture

### Main Process (Electron)
- **Window Management** - Creates and manages application windows
- **File System Access** - Handles file operations securely
- **IPC Communication** - Secure communication with renderer process
- **Application Lifecycle** - Handles app startup, shutdown, and events

### Renderer Process (React)
- **Component Tree** - Hierarchical UI component structure
- **State Management** - Centralized state with Zustand stores
- **3D Rendering** - Three.js integration for vehicle visualization
- **User Interface** - Tailwind CSS styled components

### State Management
- **lightingStore.ts** - Manages lighting pattern state and grid data
- **vehicleStore.ts** - Handles vehicle model loading and file management

## 🎨 Component Architecture

### FileManager Component
- **File Browser** - Navigate and select vehicle folders
- **File List** - Display vehicle files with metadata
- **Drag & Drop** - Support for file operations

### LightingEditor Component
- **Grid Interface** - 32x20 clickable grid for light placement
- **Color Picker** - RGB color selection with hex input
- **BPM Control** - Timing adjustment for light patterns
- **Pattern Management** - Save/load lighting configurations

### VehicleViewer Component
- **3D Scene** - Three.js scene setup and management
- **Camera Controls** - Orbit, pan, and zoom functionality
- **Model Loading** - GTA V model file (.yft, .ytd) support
- **Lighting Preview** - Real-time light pattern visualization

### Logo Component
- **Brand Display** - Application logo and branding
- **Responsive Design** - Adapts to different screen sizes

## 🔌 API Integration

### File System API
- **Folder Scanning** - Recursive directory traversal
- **File Reading** - Binary and text file handling
- **Metadata Extraction** - File properties and information

### 3D Model API
- **GTA V Format Support** - .yft and .ytd file parsing
- **Texture Loading** - Material and texture management
- **Model Optimization** - LOD and performance optimization

### Lighting System API
- **Pattern Generation** - Grid-based light placement
- **Animation Engine** - BPM-based timing system
- **Export Formats** - carcols.meta file generation

## 🚀 Development Workflow

### Local Development
1. **Start Dev Server** - `npm run dev`
2. **Hot Reloading** - Automatic updates on file changes
3. **DevTools** - F12 to open browser developer tools
4. **Console Logging** - Debug information and error tracking

### Building Process
1. **TypeScript Compilation** - Type checking and transpilation
2. **Bundle Generation** - Vite creates optimized bundles
3. **Electron Packaging** - Electron Builder creates executables
4. **Asset Optimization** - Image and resource compression

### Testing Strategy
- **Component Testing** - Individual component validation
- **Integration Testing** - Component interaction testing
- **End-to-End Testing** - Full application workflow testing
- **Performance Testing** - 3D rendering and memory usage

## 🔒 Security Considerations

### Context Isolation
- **Preload Scripts** - Secure API exposure to renderer
- **IPC Validation** - Input sanitization and validation
- **File Access** - Restricted file system permissions

### Code Security
- **Dependency Scanning** - Regular security audits
- **Input Validation** - Sanitize all user inputs
- **Error Handling** - Secure error messages and logging

## 🐛 Troubleshooting

### Common Development Issues

#### Build Errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run type-check

# Verify Node.js version
node --version
```

#### Runtime Issues
- **3D Model Not Loading**: Check file format and permissions
- **Performance Issues**: Reduce lighting complexity or shadow quality
- **Memory Leaks**: Monitor renderer process memory usage

#### Development Issues
- **Hot Reload Not Working**: Restart dev server
- **TypeScript Errors**: Check tsconfig.json and import paths
- **Electron Crashes**: Check main process logs

### Debug Tools
- **DevTools** - F12 for renderer process debugging
- **Console Logging** - Main process logging to terminal
- **Performance Profiler** - Built-in React DevTools profiler

## 📚 Dependencies

### Core Dependencies
- **electron**: ^28.0.0 - Desktop application framework
- **react**: ^18.2.0 - UI library
- **three**: ^0.158.0 - 3D graphics library
- **@react-three/fiber**: ^8.15.0 - React Three.js renderer
- **@react-three/drei**: ^9.88.0 - Three.js helpers

### Development Dependencies
- **typescript**: ^5.2.0 - Type checking and compilation
- **vite**: ^5.0.0 - Build tool and dev server
- **tailwindcss**: ^3.3.0 - CSS framework
- **electron-builder**: ^24.6.0 - Application packaging

### State Management
- **zustand**: ^4.4.0 - Lightweight state management
- **immer**: ^10.0.0 - Immutable state updates

## 🔄 Version Management

### Semantic Versioning
- **Major**: Breaking changes and major features
- **Minor**: New features and improvements
- **Patch**: Bug fixes and minor updates

### Release Process
1. **Feature Development** - Develop in feature branches
2. **Testing** - Comprehensive testing and validation
3. **Version Bump** - Update package.json version
4. **Build** - Create production executables
5. **Release** - Tag and publish to GitHub

## 🤝 Contributing

### Development Setup
1. **Fork Repository** - Create your own fork
2. **Clone Fork** - Download to local machine
3. **Install Dependencies** - Run `npm install`
4. **Create Branch** - Feature or fix branch
5. **Make Changes** - Implement your changes
6. **Test Changes** - Ensure everything works
7. **Submit PR** - Create pull request

### Code Standards
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (if configured)
- **Component Structure** - Consistent component organization

### Testing Requirements
- **Unit Tests** - Component and utility testing
- **Integration Tests** - Component interaction testing
- **Manual Testing** - User experience validation

## 📖 Additional Resources

### Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Three.js Documentation](https://threejs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Development Tools
- [VS Code](https://code.visualstudio.com) - Recommended editor
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Three.js Editor](https://threejs.org/editor)

---

*This technical documentation is maintained by the Nextarch Studio development team. For questions or contributions, please open an issue or pull request on GitHub.*
