# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocuBeam is a SaaS platform for PDF document chat using AI. Users upload PDFs, which are processed with OCR, and can then chat with their documents using AI with intelligent source linking to specific pages.

**Current Status**: Database migration from Cloudflare D1 to Neon PostgreSQL is complete. Next phase is implementing vector pipeline for document embeddings and chat functionality.

## Common Commands

### Development
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint

### Database Operations
- `pnpm db:generate --name <migration_name>` - Generate new Drizzle migration
- `pnpm db:migrate:dev` - Apply migrations to local database (legacy D1 command)

### Cloudflare Operations
- `pnpm cf-typegen` - Generate Cloudflare environment types (run after wrangler.jsonc changes)
- `pnpm opennext:build` - Build for Cloudflare Workers deployment
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm preview` - Preview deployment locally

### Email Development
- `pnpm email:dev` - Start email template development server on port 3001

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- **Backend**: Cloudflare Workers with OpenNext framework
- **Database**: Neon PostgreSQL (migrated from D1), Drizzle ORM
- **Storage**: Cloudflare R2 for PDFs
- **OCR**: Cloudflare AI Vision
- **Authentication**: Lucia Auth with Cloudflare KV sessions
- **Payments**: Stripe with credit-based billing system

### Key Architecture Patterns
- Server Actions for form handling and data mutations
- Zod schemas for validation (`src/schemas/`)
- React Hook Form for client-side form management
- Zustand for client state management (`src/state/`)
- Multi-tenant team system with role-based permissions

### Database Structure
- PostgreSQL with Drizzle ORM
- Schema defined in `src/db/schema.ts`
- Migrations in `src/db/migrations/`
- Connection logic in `src/db/index.ts`

### Authentication Flow
- Lucia Auth handles sessions stored in Cloudflare KV
- Supports email/password, WebAuthn/passkeys, and Google OAuth
- Email verification and password reset flows
- Session management with device tracking

### File Upload & OCR Pipeline
- PDF uploads to Cloudflare R2 bucket
- OCR processing with Cloudflare AI Vision
- Document metadata stored in PostgreSQL
- Credit-based usage tracking

### Team & Billing System
- Multi-tenant team workspaces
- Role-based permissions (owner, admin, member)
- Credit packages with Stripe integration
- Monthly credit refresh system

## Environment Setup

### Required Environment Files
- `.env` - Main environment variables
- `.dev.vars` - Cloudflare Workers development secrets

### Important Configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
- After wrangler.jsonc changes, run `pnpm cf-typegen`
- Database connection uses `DATABASE_URL` environment variable

## Development Guidelines

### Form Handling
- Use Server Actions for form submissions
- Zod schemas for validation in `src/schemas/`
- React Hook Form for client-side forms
- Error handling with try-catch utilities

### Database Operations
- Use Drizzle ORM queries, not raw SQL
- Type-safe database operations
- Migrations for schema changes

### Authentication
- Check authentication in layouts and pages
- Use session utilities from `src/utils/auth.ts`
- Protect routes with proper session validation

### File Structure Conventions
- Server Actions in `src/actions/`
- UI components in `src/components/`
- Database utilities in `src/server/`
- Validation schemas in `src/schemas/`
- Type definitions in `src/types/`

### Cloudflare Specifics
- Workers runtime with Node.js compatibility
- R2 for file storage
- KV for session storage
- AI for OCR processing

## Next Development Phase

The project is transitioning to add vector embeddings and chat functionality:
1. Add pgVector extension to PostgreSQL
2. Implement document chunking and embedding generation
3. Build chat interface with vector similarity search
4. Add PDF viewer with source linking

Refer to `PROJECT-PLAN.md` for detailed roadmap and current milestone progress.