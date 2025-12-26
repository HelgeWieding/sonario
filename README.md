# Sonario

AI-powered feature request aggregation app that processes Gmail emails and extracts feature requests.

## Tech Stack

- **Nuxt 4** - Frontend framework with server-side API
- **Clerk** - Authentication & authorization
- **PostgreSQL + Drizzle ORM** - Database
- **Claude API** - AI for detecting and extracting feature requests
- **Gmail API + Pub/Sub** - Real-time email processing
- **TailwindCSS** - Styling

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Google Cloud project with Gmail API enabled
- Anthropic API key

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Install Dependencies

```bash
npm install
```

### Setup Database

Run migrations:

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

## Project Structure

```
sonario/
├── app/                    # Frontend (Nuxt 4)
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── layouts/            # Page layouts
│   ├── middleware/         # Route middleware
│   └── pages/              # File-based routing
├── server/                 # Backend
│   ├── api/                # API routes
│   ├── db/                 # Database schema & migrations
│   ├── services/           # Business logic services
│   └── utils/              # Server utilities
├── shared/                 # Shared code
│   ├── types/              # TypeScript types
│   └── constants/          # Constants & enums
```

## Features

- **Product Management**: Create multiple products to track feature requests separately
- **Gmail Integration**: Connect Gmail to automatically process incoming emails
- **AI-Powered Detection**: Uses Claude to detect feature requests in emails
- **Smart Matching**: Matches similar feature requests and groups feedback
- **Full Extraction**: Extracts title, description, category, and sentiment
- **Dashboard**: Overview of all products and feature requests

## Gmail Setup

1. Create a Google Cloud project
2. Enable Gmail API and Pub/Sub API
3. Create OAuth 2.0 credentials (Web application)
4. Create a Pub/Sub topic for Gmail notifications
5. Grant `gmail-api-push@system.gserviceaccount.com` the Publisher role on the topic
6. Create a Push subscription pointing to your webhook URL

For local development, use ngrok to expose your local server.

## Deployment

The app is configured for deployment on Railway:

```bash
npm run build
```

Set all environment variables in Railway and connect your PostgreSQL database.
