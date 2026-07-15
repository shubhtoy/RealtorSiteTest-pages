# Baba Flats Apartment Website

A modern apartment website built with Vite + React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM for client-side routing
- **Components**: Reusable UI components with Radix UI primitives
- **Animations**: Framer Motion for smooth animations
- **Media**: Optimized images and videos
- **Editor**: Integrated content editor with Puck

## 📁 Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── site/      # Site-specific components (Header, Footer, etc.)
│   │   ├── ui/        # Generic UI components
│   │   ├── media/     # Media-related components
│   │   └── studio/    # Editor studio components
│   ├── pages/         # Page components
│   ├── config/        # Configuration files
│   ├── context/       # React context providers
│   ├── data/          # Static data and content
│   ├── lib/           # Utility functions and libraries
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main App component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
│   ├── images/        # Original images
│   ├── images-optimized/ # Optimized images
│   └── videos/        # Video files
├── scripts/           # Build and utility scripts
├── docs/              # Documentation
└── backup-old-projects/ # Archived old projects
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install

# create unified local env file
cp .env.example .env
```

Edit only .env for local development. .env.server is deprecated and kept only for backwards reference.

### Development (Unified)
```bash
# canonical full-stack dev command (API + web)
npm run dev
```
This starts both services together using one command.

```bash
# explicit variants
npm run dev:stack
npm run dev:web
npm run dev:api
```

`npm start`, `npm run start:dev`, and `npm run start:local` are compatibility aliases for `npm run dev:stack`.

### Basic Backend Server (No DB)
```bash
# start API server once
npm run server

# or start API server in watch mode
npm run server:dev
```

The backend runs at `http://localhost:8787` and exposes:

- `GET /api/health`
- `GET /api/content/draft` (protected)
- `GET /api/content/published` (protected)
- `POST /api/content/bootstrap` (protected)
- `PUT /api/content/draft` (protected)
- `POST /api/content/publish` (protected)
- `POST /api/contact/submit`

Protected content endpoints require header:

- `x-studio-password: <your STUDIO_PASSWORD>`

Recommended unified env variables (`.env`):

- `VITE_API_ORIGIN=http://localhost:8787`
- `VITE_STUDIO_PASSWORD=shubh123`
- `VITE_API_TIMEOUT_MS=10000`
- `API_PORT=8787`
- `STUDIO_PASSWORD=shubh123`
- `SMTP_HOST=`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=`
- `SMTP_PASS=`
- `SMTP_FROM=`
- `SMTP_TO=`

### Build
```bash
npm run build
```
Builds the Next.js app for production (output in the `.next` folder).

### Preview
```bash
npm run preview
```
Preview the production build locally.

### Media Optimization
```bash
# Optimize all media
npm run media:optimize

# Optimize only images
npm run media:optimize:images

# Optimize uploaded images from Studio gallery manager
npm run media:optimize:uploads

# Optimize only videos
npm run media:optimize:videos
```

## 🎨 Design System

The project uses a custom design system with Tailwind CSS. Key design tokens:

- **Primary Color**: Orange (#D97706)
- **Background**: Warm off-white
- **Typography**: Geist variable font
- **Spacing**: 4px base unit
- **Border Radius**: 8px default

## 🔧 Configuration

- `vite.config.ts` - Vite configuration with path aliases
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - UI components configuration

## 📱 Pages

- `/` - Home page with hero and features
- `/gallery` - Photo gallery of apartments and amenities
- `/contact` - Contact information and form
- `/studio` - Content editor for administrators

## 🧩 Key Components

- `SiteHeader` - Navigation header
- `SiteFooter` - Page footer
- `SitePreloader` - Loading animation
- `Accordion` - Collapsible content sections
- `Parallax` - Parallax scrolling effects
- `Tabs` - Tabbed interface component

## 📦 Dependencies

### Core
- React 19 + React DOM
- React Router DOM 7
- TypeScript
- Vite

### UI & Styling
- Tailwind CSS
- Radix UI (Accordion, Tabs)
- Framer Motion
- Lucide React icons

### Media & Content
- React Photo Album
- Yet Another React Lightbox
- Puck Editor

### Utilities
- clsx
- tailwind-merge
- class-variance-authority

## 🚀 Deployment

This is a Next.js (App Router) application. It ships with SSR pages and `/api/*`
route handlers, so it requires a Node.js server host (not static hosting).

### Vercel (recommended)

Vercel auto-detects Next.js from the Git repository — no `vercel.json` is needed.

1. In the [Vercel dashboard](https://vercel.com), choose **Add New → Project** and
   import this GitHub repository.
2. Vercel detects the framework as **Next.js** and applies the defaults: build
   command `next build`, with the build output managed automatically by Vercel.
   Leave these as-is.
3. Under **Project Settings → Environment Variables**, add:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `STUDIO_PASSWORD` | Yes | Server-side Studio password used to authorize draft/publish API calls. |
   | `NEXT_PUBLIC_STUDIO_PASSWORD` | Yes | Client-side Studio password — **must equal `STUDIO_PASSWORD`**, or the Studio's save/publish requests are rejected with 401. |
   | `NEXT_PUBLIC_SITE_URL` | Recommended | Public site origin for SEO (canonical + Open Graph URLs, `sitemap.xml`, `robots.txt`), e.g. `https://babaflats.com`. Defaults to `https://babaflats.com`. |
   | `CONTACT_TO_EMAIL` | Recommended | Recipient inbox for contact-form leads. Defaults to `Contact@babaflats.com`. |
   | `CONTACT_APPS_SCRIPT_URL` | Optional | Google Apps Script Web App `/exec` URL for lead delivery (Google Sheet row + email). |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | Optional | Enable the contact form's SMTP email channel (nodemailer). |

4. Deploy. Each push to the connected branch then triggers an automatic Vercel
   build and deployment.

### Self-hosted (Docker)

A production [`Dockerfile`](./Dockerfile) is included as an alternative for
self-hosting. It runs `next build` and serves the self-contained standalone
output (`output: "standalone"`) on port `3000`:

```bash
docker build -t baba-flats .
docker run -p 3000:3000 --env-file .env baba-flats
```

Provide the same environment variables listed above (via `--env-file` or
individual `-e` flags).

## 📄 License

ISC