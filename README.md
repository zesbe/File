# Termux Projects Collection

This repository contains various projects and experiments created in Termux Android environment.

## 📁 Project Structure

### Core Projects

#### 🤖 Chat Applications
- **chat.mjs** - Basic chat implementation
- **chat_stream.mjs** - Streaming chat functionality
- **chat_stream_multi.mjs** - Multi-turn streaming chat

#### 🎨 Web Artifacts (from droid-demos)
- **01-cosmic-nebula.html** - Cosmic nebula visualization
- **02-artisan-coffee-landing.html** - Artisan coffee landing page
- **03-jazz-night-poster.html** - Jazz night event poster
- Philosophy markdown files with design guidelines

### Sub-Projects

#### 📦 zai-agent/
Agent implementation with UI interface
- `agent.js` - Main agent logic
- `ui.html` - Web interface

#### 🎯 minimax-node/
MiniMax API integration project
- `minimax.js` - API client
- `server.js` - HTTP server
- `server.socket.js` - WebSocket server
- `public/` - Static assets

#### 💬 glm-tui/
Terminal UI for GLM chat
- `glm_chat_tui.mjs` - Interactive TUI implementation

#### 📱 TermuxTerminal/
React Native terminal application for Android
- `src/` - Source code
- `App.tsx` - Main app component
- Build and setup instructions in MD files

#### 🛠️ scripts/
Standalone utility scripts
- Java implementations (chat.java, chat_stream.java)
- Test scripts for various APIs
- Shell scripts for setup and fixes

#### 📂 projects/
Additional projects and experiments
- `portfolio-yudi/` - Portfolio website

## 🚀 Getting Started

Each project folder contains its own `package.json` with dependencies. To run a project:

```bash
cd <project-folder>
npm install
npm start
```

## 🔧 Environment

All projects are developed and tested in:
- **Termux** (Android terminal emulator)
- **Node.js** (for JavaScript/TypeScript projects)
- **React Native** (for mobile app)

## 📝 Notes

- This repository excludes `node_modules/` and other build artifacts
- Environment files (`.env`) are gitignored for security
- Each project may have specific setup requirements

## 📄 License

Projects in this repository are personal experiments and learning projects.

---

**Created in Termux on Android** 📱
*Organized and maintained with Claude Code*
