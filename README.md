# RAGNA Cloud Platform

> ⚠️ **ARCHIVED PROJECT** - This project is no longer actively maintained or developed. It remains available for reference and educational purposes.

An intelligent AI-powered cloud platform built with Nuxt 3, providing advanced document processing, conversational AI, and workflow automation capabilities.

## 🚀 Features

- **AI-Powered Conversations**: Multi-LLM support (OpenAI, Anthropic, Mistral, Groq)
- **Document Processing**: Advanced RAG (Retrieval-Augmented Generation) capabilities
- **Multi-Provider Authentication**: Support for Google, Azure, Auth0
- **Real-time Collaboration**: WebSocket-based real-time features
- **Admin Dashboard**: Comprehensive user and team management
- **File Management**: Integration with Google Drive and OneDrive
- **Extensible Architecture**: Plugin-based system for custom integrations

## 🛠️ Tech Stack

This project uses modern technologies for a robust, scalable platform:

- **Frontend**: [Nuxt 3](https://nuxt.com) with TypeScript
- **Styling**: TailwindCSS with [shadcn-vue](https://www.shadcn-vue.com/) components
- **Database**: PostgreSQL with [Prisma ORM](https://prisma.io/)
- **Authentication**: NextAuth.js with multiple providers
- **API**: tRPC for type-safe APIs
- **Real-time**: Socket.io for live features
- **Queue Management**: BullMQ with Redis
- **AI Integration**: Vercel AI SDK
- **Payment Processing**: Stripe integration
- **Deployment**: Docker with multi-stage builds

## 📋 Prerequisites

- Node.js 20+
- Docker and Docker Compose

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ragna-cloud.git
cd ragna-cloud
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.exmaple .env
```

Edit `.env` and configure the required environment variables (see [Environment Variables](#environment-variables) section).

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
docker-compose -f docker-compose.production.yml up -d
```

## ⚙️ Environment Variables

The application requires several environment variables. Copy `.env.exmaple` to `.env` and configure:

### Project Structure

```
├── components/          # Vue components organized by feature
├── composables/         # Vue composables for shared logic
├── pages/              # File-based routing
├── server/             # API routes and server logic
├── stores/             # Pinia stores for state management
├── prisma/             # Database schema and migrations
├── assets/             # Static assets
└── public/             # Public files
```

## 🤝 Contributing

**Note**: This project is archived and no longer accepting contributions. The code remains available for reference and learning purposes.

Please see our [Contributing Guide](CONTRIBUTING.md) for historical information about the project's development practices.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with [sidebase merino](https://sidebase.io/) - A modern, full-stack Nuxt 3 template.

## 📞 Support

**Note**: As this project is archived, active support is no longer provided.

- 📖 Documentation: [Coming Soon]
- 🐛 Issues: Historical issues available at [GitHub Issues](https://github.com/yourusername/ragna-cloud/issues)
- 💬 Discussions: Historical discussions available at [GitHub Discussions](https://github.com/yourusername/ragna-cloud/discussions)

---

Made with ❤️ by [Sven Stadhouders](https://github.com/yourusername)
