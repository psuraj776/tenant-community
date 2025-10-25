# Contributing to Tenant Community

Thank you for considering contributing to Tenant Community! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run the app: `npm run ios` or `npm run android`

## Code Style

- Follow the existing code style
- Use TypeScript for all new files
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Module Structure

When creating a new module, follow this structure:

```
src/modules/[module-name]/
├── index.ts                 # Public API
├── types.ts                 # TypeScript types
├── services/
│   └── [module].service.ts  # Business logic
├── store/
│   └── slice.ts            # Redux slice
├── components/             # Module components
├── screens/                # Module screens
└── hooks/                  # Module hooks
```

## Commit Messages

Use conventional commit format:
- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `style: formatting changes`
- `refactor: code refactoring`
- `test: add tests`
- `chore: maintenance tasks`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Run `npm test` and `npm run lint`
5. Update documentation
6. Submit a pull request

## Questions?

Open an issue or reach out to the team!
