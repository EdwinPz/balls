# Flavor Fuzion Website (MVP Prototype)

A bold, spicy, community-style website prototype built as a static web app with local storage persistence.

## What this includes
- Register/login (prototype, browser-local)
- Blog/recipe posts with comments, reporting, and delete-own
- Credit system (user wallet + cookie fallback for guest)
- Kitchen simulator customization and reset
- Public chat room (shared per browser storage)
- Profile bio and image gallery upload
- Newsletter placeholder capture
- SEO base tags + OpenGraph + favicon/logo integration

## Proposed production stack upgrade
- Frontend: Next.js
- Backend: Node/Express or Next API routes
- DB: PostgreSQL + Prisma
- Auth: NextAuth / JWT with hashed passwords
- Storage: S3-compatible object storage for images
- Realtime chat: WebSockets (Socket.IO)

## Data model outline (for production)
- Users, Posts, Comments, CreditsLedger, KitchenState, ChatMessages, Uploads, NewsletterSubs

## Route map (for production)
- Web: `/`, `/login`, `/register`, `/blog`, `/blog/:slug`, `/dashboard`, `/kitchen`, `/chat`, `/profile`
- API: `/api/auth/*`, `/api/posts/*`, `/api/comments/*`, `/api/credits/*`, `/api/chat/*`, `/api/uploads/*`

## Milestone plan
1. Foundation/auth/theme (Medium)
2. Blog/comments/profile (Medium)
3. Credits/kitchen sim (Medium)
4. Chat/uploads/moderation (High)
5. SEO/testing/deploy hardening (Medium)

## Run locally
```bash
python3 -m http.server 4173
```
Then open `http://localhost:4173`.

## Future enhancements
- Weekly cooking challenges + leaderboard
- Referral rewards
- Seasonal events and limited-time decor drops
- Ingredient matcher "cook with what I have"
- Creator spotlight and recipe duets
