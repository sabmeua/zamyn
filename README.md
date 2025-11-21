# Zamyn (ザミン)

**Your Workflow Pathfinder**

Zamyn is a no-code/low-code workflow-driven ticket management system designed for small organizations (1-50 people). It provides a visual workflow editor for creating custom ticket workflows without writing code.

## Features (Phase 0)

- 🔐 JWT-based authentication with secure password validation
- 📊 Visual workflow editor using React Flow
- 📁 File upload functionality with type and size validation
- 🎨 Modern UI with shadcn/ui components and Tailwind CSS
- 🐳 Docker containerization for easy deployment
- 🗄️ PostgreSQL database with Prisma ORM
- 🚀 Monorepo architecture with pnpm workspaces

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Flow
- TanStack Query
- Jotai

### Backend
- NestJS 10
- TypeScript
- Prisma 7 (PostgreSQL)
- Passport.js + JWT
- Multer (file uploads)

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sabmeua/zamyn.git
cd zamyn
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

Backend:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend:
```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 4. Start Docker services

```bash
docker-compose up -d postgres redis
```

Wait for PostgreSQL to be ready (check with `docker ps`).

### 5. Run database migrations

```bash
cd apps/backend
pnpm dlx prisma migrate dev
```

### 6. Start development servers

In separate terminals:

```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:frontend
```

Or run both together:
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Docker Deployment

Build and run all services with Docker:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3001)
- Frontend (port 3000)

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get current user profile (requires auth)

### File Upload
- `POST /files/upload` - Upload a file (requires auth)
- `GET /files/:filename` - Download a file (requires auth)

### Health Check
- `GET /health` - API health status

## Testing Authentication

### Register a user
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

### Get profile (use token from login response)
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
zamyn/
├── apps/
│   ├── backend/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── files/    # File upload module
│   │   │   ├── health/   # Health check
│   │   │   ├── prisma/   # Prisma service
│   │   │   └── users/    # Users module
│   │   ├── prisma/       # Database schema & migrations
│   │   └── Dockerfile
│   └── frontend/         # Next.js frontend
│       ├── app/
│       │   ├── login/    # Login page
│       │   ├── dashboard/# Dashboard page
│       │   └── workflow-editor/ # Workflow editor
│       ├── components/   # UI components
│       ├── lib/          # Utilities & API client
│       └── Dockerfile
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Development

### Run linting
```bash
# Backend
cd apps/backend
pnpm lint

# Frontend
cd apps/frontend
pnpm lint
```

### Run Prisma Studio
```bash
cd apps/backend
pnpm dlx prisma studio
```

### Generate Prisma Client
```bash
cd apps/backend
pnpm dlx prisma generate
```

## Brand Guidelines

- **Primary Color (Sky Blue)**: #0EA5E9
- **Secondary Color (Emerald Green)**: #10B981
- **Accent Color (Slate Gray)**: #64748B
- **Fonts**: Inter (English), Noto Sans JP (Japanese)
- **Icon Library**: Lucide React

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#)

## File Upload Limits

- Maximum file size: 10MB
- Allowed types: jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, txt

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]

## Support

For issues and questions, please open an issue on GitHub.
