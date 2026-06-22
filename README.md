# Roamly

A travel itinerary planning app built with Next.js 14, Supabase, Tailwind CSS, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth & Database**: Supabase
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Phase 1 Features

- Landing page with hero section and feature highlights
- Email/password authentication (sign up, sign in, sign out)
- Email verification after sign up
- Password reset via email link
- Protected `/dashboard` route — shows welcome message and trip placeholder
- Session persistence across page refreshes
- Toast notifications for all auth events
- Fully responsive, mobile-first design

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd roamly
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication → URL Configuration**, add your local dev URL to the **Redirect URLs** list:
   ```
   http://localhost:3000/auth/callback
   ```
4. In **Authentication → Email Templates**, you can customise the verification and reset emails.

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace the placeholder values with your Supabase project credentials (found in **Project Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts       # Email verification callback
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx          # Protected dashboard
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
├── components/
│   ├── AuthCard.tsx                # Wrapper card for auth forms
│   ├── FormInput.tsx               # Reusable labeled input with error
│   ├── LoadingButton.tsx           # Button with spinner state
│   ├── Navbar.tsx                  # Top navigation bar
│   └── ToastProvider.tsx           # react-hot-toast config
├── lib/
│   ├── auth.ts                     # Auth helper functions
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── middleware.ts           # Session refresh in middleware
│       └── server.ts               # Server-side Supabase client
├── middleware.ts                   # Route protection
└── types/
    └── index.ts                    # Shared TypeScript types
supabase/
└── schema.sql                      # Database schema + RLS + trigger
```

---

## Auth Flow

| Action | Description |
|---|---|
| Sign up | Creates Supabase auth user + sends verification email. Profile row auto-created via DB trigger. |
| Email verify | User clicks link → `/auth/callback` exchanges code for session → redirect to `/dashboard`. |
| Sign in | Email/password → session cookie set → redirect to `/dashboard`. |
| Forgot password | Sends Supabase reset email with link to `/auth/reset-password`. |
| Reset password | User sets new password via the reset form. |
| Sign out | Clears session, redirect to `/`. |
| Route guard | Middleware redirects unauthenticated users from `/dashboard` → `/auth/signin`, and authenticated users from `/auth/*` → `/dashboard`. |

---

## Deployment

The app can be deployed to [Vercel](https://vercel.com) with zero config:

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the two environment variables in Vercel project settings.
4. Add your production URL to Supabase **Redirect URLs** (e.g. `https://yourdomain.com/auth/callback`).
