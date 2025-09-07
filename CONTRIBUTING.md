# Contributing to RAGNA Cloud Platform

Thank you for your interest in contributing to RAGNA! We welcome contributions from the community and are grateful for every improvement, bug fix, and feature addition.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git
- Basic knowledge of TypeScript, Vue.js, and Nuxt 3

### Development Setup

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/ragna-cloud.git
   cd ragna-cloud
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp .env.exmaple .env
   # Edit .env with your configuration
   ```

4. **Start development services**
   ```bash
   docker-compose up postgres redis -d
   npm run migrate
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Bugs

- Use the [GitHub Issues](https://github.com/yourusername/ragna-cloud/issues) page
- Include a clear title and description
- Provide steps to reproduce the issue
- Include relevant logs, screenshots, or error messages
- Specify your environment (OS, Node.js version, browser)

### Suggesting Features

- Open a [GitHub Discussion](https://github.com/yourusername/ragna-cloud/discussions)
- Describe the feature and its use case
- Explain why it would be valuable to the project
- Consider implementation details if applicable

### Code Contributions

#### Before You Start

- Check existing issues and pull requests to avoid duplication
- For large features, open an issue first to discuss the approach
- Make sure you understand the project structure and conventions

#### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**

   - Follow the existing code style and conventions
   - Write tests for new functionality
   - Update documentation as needed
   - Ensure your code passes all checks

3. **Test your changes**

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Commit your changes**
   Use [Conventional Commits](https://conventionalcommits.org/):

   ```bash
   git commit -m "feat: add user profile avatar upload"
   git commit -m "fix: resolve authentication redirect issue"
   git commit -m "docs: update API documentation"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any`
- **Vue Components**: Use Composition API with `<script setup>`
- **Naming**: Use descriptive names for variables, functions, and components
- **Comments**: Add comments for complex logic and business rules
- **File Organization**: Follow the existing project structure

#### Testing

- Write unit tests for utilities and composables
- Add integration tests for API endpoints
- Test components with Vue Test Utils
- Ensure all tests pass before submitting

## 🏗️ Project Structure

```
├── components/          # Reusable Vue components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   └── feature/        # Feature-specific components
├── composables/        # Vue composables for shared logic
├── pages/              # File-based routing pages
├── server/             # Backend API routes and services
├── stores/             # Pinia stores for state management
├── prisma/             # Database schema and migrations
├── tests/              # Test files
└── utils/              # Utility functions
```

## 🔧 Development Guidelines

### Database Changes

- Always create migrations for schema changes
- Never modify existing migrations
- Test migrations on a copy of production data when possible

### API Development

- Use tRPC for type-safe APIs
- Validate input with Zod schemas
- Handle errors gracefully with appropriate HTTP status codes
- Document complex endpoints

### Frontend Development

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use Pinia for state management
- Implement proper error handling and loading states

### Security Considerations

- Never commit sensitive information (API keys, passwords)
- Validate and sanitize all user inputs
- Use proper authentication and authorization
- Follow OWASP security guidelines

## 📝 Documentation

- Update README.md for user-facing changes
- Add inline code comments for complex logic
- Update API documentation for endpoint changes
- Include examples in documentation

## 🐛 Debugging

### Common Issues

- **Database connection errors**: Check your `.env` configuration
- **Build failures**: Clear `node_modules` and `.nuxt` directories
- **Type errors**: Run `npm run typecheck` for detailed information

### Development Tools

- Vue DevTools for component debugging
- Prisma Studio for database inspection: `npm run db:studio`
- Network tab for API debugging

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Focus on the issue, not the person
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/yourusername/ragna-cloud/discussions)
- **Bugs**: Report via [GitHub Issues](https://github.com/yourusername/ragna-cloud/issues)
- **Security Issues**: Email security@example.com (do not open public issues)

## 🏆 Recognition

Contributors will be recognized in our:

- README.md contributors section
- Release notes for significant contributions
- Annual contributor highlights

Thank you for contributing to RAGNA! 🎉
