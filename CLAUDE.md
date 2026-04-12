# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TradeLog Project

AI-powered trading journal for forex, crypto, and stock traders. Built with Next.js 14, Supabase, Whop, and Anthropic AI.

### Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `ANTHROPIC_API_KEY` — Claude Sonnet for chart analysis and insights
- `WHOP_API_KEY` — Whop API access
- `WHOP_WEBHOOK_SECRET` — Whop webhook verification
- `NEXT_PUBLIC_WHOP_PLAN_URL` — Whop checkout plan URL

### Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Architecture

**App Structure (Next.js App Router)**
- `src/app/` — Root routes (landing page, login, API routes)
- `src/app/(app)/` — Protected routes (journal, stats, settings) wrapped by `layout.tsx`
- `src/app/api/` — API routes (analyze, whop, translate, stats-insight)

**Key Directories**
- `src/components/` — Reusable components (landing page, UI, app shell)
- `src/lib/supabase/` — Supabase client (`server.ts`, `client.ts`) and auth utilities (`auth.ts`)
- `src/lib/i18n.ts` — Internationalization (English default, UZ/RU support)
- `src/contexts/` — React contexts (LanguageProvider)

### Strict Rules & Guidelines

**i18n Compliance**
- NEVER hardcode UI strings in JSX
- All text must be added to dictionary files (default: English)
- Use the `t('key')` pattern for all UI elements

**Pro Feature Gating**
- Every feature involving AI Feedback or advanced stats must check `profile.plan === 'pro'`
- Free users are limited to 3 lifetime trades

**Design System**
- Fonts: Fraunces (Headings), DM Sans (Body), DM Mono (PNL/Numbers)
- Colors: Cream `#f7f5f0` / Dark `#111114`

**Global Strategy**
- Target audience is UK/US/International traders
- Tone must be professional and data-focused

### Auth Pattern

Uses Supabase SSR with middleware. Critical pattern:

1. **Middleware** (`src/middleware.ts`):
   - Authenticates user via Supabase
   - Sets `x-user-id` header so server components can skip `getUser()`
   - Redirects unauthenticated users to `/login`
   - MUST use `setAll` pattern to update `request.cookies` for token refresh

2. **Server-side helpers** (`src/lib/supabase/auth.ts`):
   - `getAuthUser()` — Cached via `React.cache()`, deduplicated across layout + page
   - `getCachedProfile(userId)` — Profile fetch, also cached
   - `getUserId()` — Fast lookup via `x-user-id` header, falls back to `getAuthUser()`

3. **Route groups**:
   - `src/app/(app)/` requires auth — wrapped by layout that redirects if no user
   - Public routes: `/`, `/login`, `/api/*`

### Styling

- Tailwind CSS with custom CSS variables for theming (dark mode)
- Custom fonts: Fraunces, DM Sans, DM Mono
- Colors defined as CSS variables in `tailwind.config.ts` for light/dark mode
- All strings in UI components use i18n — see `src/lib/i18n.ts`

### API Routes

- `/api/analyze` — Anthropic AI analyzes TradingView screenshots (base64 image)
- `/api/stats-insight` — AI-powered trading insights
- `/api/whop/webhook` — Whop webhook handling for membership updates
- `/api/profile/revalidate` — Cache revalidation for profile changes

### Data Types

See `src/types/index.ts`:
- `Profile` — User profile with plan, balance, risk settings
- `Trade` — Trade record with pnl, ai_narrative, ai_feedback
- `AIAnalysisResult` — Response from chart analysis API
