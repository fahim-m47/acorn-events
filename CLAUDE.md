# CLAUDE.md

## Project Overview
Acorn is a centralized campus events platform for Haverford College, serving ~1,500 students. Users can browse, post, save, and share campus events. Verified users (authenticated with @haverford.edu emails) can create events, general public can view events.

### Authentication
- Google OAuth via Supabase
- Restricted to @haverford.edu emails only
- Public access: browsing events, viewing details
- Auth required: posting events, saving events, sending blasts

## Constraints & Policies

**Security - MUST follow:**
- NEVER expose Supabase keys to the client - server-side only
- ALWAYS use environment variables for secrets
- NEVER commit `.env.local` or any file with API keys
- Validate and sanitize all user input
- Implement RLS on ALL Supabase tables

**Code quality:**
- TypeScript strict mode
- Run `npm run lint` before committing
- No `any` types without justification

**Dependencies:**
- Prefer shadcn components over adding new UI libraries
- Minimize external dependencies for MVP

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # Type check
```