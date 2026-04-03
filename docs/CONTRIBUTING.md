# Contributing Guide

This project is a community-maintained fork of [diogomartino/steam-auto-shutdown](https://github.com/diogomartino/steam-auto-shutdown). We welcome contributions that improve the utility's performance, stability, or security.

## 1. Development Setup

Follow these steps to establish a local development environment:

### Prerequisites
- **Go**: 1.21+
- **Node.js**: 20.x+ (LTS)
- **Wails v2**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Repository Setup
1. **Fork** the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/steam-auto-shutdown.git
   cd steam-auto-shutdown
   ```
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/diogomartino/steam-auto-shutdown.git
   ```

## 2. Local Execution

### Backend & Frontend Dev
To run the application with hot-reloading:
```bash
wails dev
```

### Production Build Verification
To generate and verify a production binary:
```bash
# Install frontend dependencies
cd frontend && npm install && cd ..

# Build for Windows
wails build
```

## 3. Contribution Workflow

Technical improvements and bug fixes should be submitted via Pull Requests.

1. **Branching**: `git checkout -b feature/your-feature-name`
2. **Commits**: Use clear, descriptive commit messages.
3. **Delivery**: Push to your fork and open a Pull Request.

---

## 🛠️ Architecture Compliance
Review [docs/ARCHITECTURE.md](ARCHITECTURE.md) before implementing structural changes to ensure alignment with the established safety and caching patterns.

*All contributions are evaluated based on their impact on system integrity and performance.*
