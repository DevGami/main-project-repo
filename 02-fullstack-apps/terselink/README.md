# TerseLink

TerseLink is a URL shortener built with Next.js App Router, React, Tailwind
CSS, and MongoDB. It supports automatically generated or custom aliases,
duplicate protection, validation, and root-level redirects.

## Requirements

- Node.js 20 or newer
- MongoDB

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and update:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017
   MONGODB_DB=bitlinks
   GITHUB_PROFILE_URL=https://github.com/your-username
   ```

   `GITHUB_PROFILE_URL` controls the GitHub button in the navigation. Replace
   the example with the project creator's profile URL.

3. Start development:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm start
```

## API

`POST /api/generate`

```json
{
  "url": "https://example.com/a/long/path",
  "shorturl": "example"
}
```

`shorturl` is optional. When omitted, TerseLink generates an alias.

Successful requests return `201 Created`:

```json
{
  "success": true,
  "message": "Short link created.",
  "data": {
    "shorturl": "example",
    "shortUrl": "http://localhost:3000/example",
    "url": "https://example.com/a/long/path"
  }
}
```

Validation errors return `422`, duplicate aliases return `409`, and rate
limits return `429`.

## Deployment

Configure `MONGODB_URI`, `MONGODB_DB`, and `GITHUB_PROFILE_URL` in the hosting
provider. The application creates a unique MongoDB index for `shorturl` on
first database use. Existing duplicate aliases must be resolved before that
index can be created.

The built-in rate limiter is a per-process abuse guard. A shared external rate
limit store is recommended when deploying across multiple server instances.
