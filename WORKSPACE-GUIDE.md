# Workspace Guide

## Development Principles

This project adheres to strict development standards to ensure code quality, maintainability, and reliability.

### Core Principles

#### 1. Strict Functional Programming
- Favor pure functions without side effects
- Use immutable data structures
- Avoid mutating state whenever possible
- Compose functions for complex logic
- Use declarative programming patterns over imperative

#### 2. Test-Driven Development (TDD)
- **Write tests before implementation code**
- Follow the Red-Green-Refactor cycle:
  1. **Red**: Write a failing test
  2. **Green**: Write minimal code to make the test pass
  3. **Refactor**: Clean up code while keeping tests green
- Maintain high test coverage
- Tests serve as living documentation
- Every bug fix starts with a failing test

#### 3. Boy Scout Principle
> "Always leave the campsite cleaner than you found it."

- Refactor and improve code whenever you touch it
- Fix code smells, improve naming, simplify logic
- Update outdated comments and documentation
- Remove dead code and unused imports
- Never commit code in worse shape than you found it

### GitHub Workflow

#### Code Quality Standards
- **Only pristine code goes to GitHub**
- All code must be clean, tested, and fully functional
- Perform thorough code cleanup before every push
- Run all tests and ensure they pass
- Fix all linting errors and warnings
- Review your own changes before committing

#### Commit Frequency
- Push regularly when significant work is completed
- Examples of "significant work":
  - A feature is fully implemented and tested
  - A bug is fixed with tests
  - Refactoring is complete and verified
  - API endpoint is working and tested
  - UI component is functional and styled

#### Before Every Push Checklist
- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] No console.log or debug code remains
- [ ] Comments are updated and accurate
- [ ] Dead code and unused imports removed
- [ ] TypeScript errors are resolved
- [ ] Code follows functional programming principles
- [ ] Boy Scout principle applied - code is cleaner

### Tech Stack Reference

#### Backend
- **Framework**: Hono (Cloudflare Workers)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Language**: TypeScript (strict mode)
- **Runtime**: Cloudflare Workers (no Node.js globals)

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS
- **Router**: React Router v6

### Development Workflow

#### Starting the Day
1. Pull latest changes: `git pull`
2. Review this guide to refresh principles
3. Check pending tasks and priorities
4. Run tests to ensure baseline: `npm test`
5. Start dev servers: `npm run dev`

#### During Development
1. Write test first (TDD)
2. Implement minimal code to pass test
3. Refactor and clean up (Boy Scout)
4. Repeat for each feature/fix

#### Before Pushing
1. Run full test suite
2. Code cleanup pass
3. Review all changes
4. Commit with clear message
5. Push to GitHub

### Common Commands

```bash
# Start development servers
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Database operations
npm run db:push       # Push schema changes
npm run db:generate   # Generate Prisma client
npm run db:studio     # Open Prisma Studio
```

### When You Get Stuck

1. Review the ARCHITECTURE.md for system design
2. Check GETTING_STARTED.md for setup instructions
3. Revisit this guide for principles and workflow
4. Run tests to understand expected behavior
5. Check the docs/ directory for specific topics

### Remember

- **Quality over speed** - pristine code takes time
- **Test everything** - no feature is complete without tests
- **Leave it better** - improve as you go
- **Commit often** - but only when work is complete and clean
- **Stay functional** - avoid side effects and mutations
