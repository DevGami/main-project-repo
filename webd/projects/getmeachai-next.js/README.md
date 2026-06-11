# ☕ Get Me A Chai

A **Patreon-style crowdfunding platform** where fans can support their favourite creators by buying them a virtual chai.

Built with **Next.js 14 (App Router)**, **MongoDB**, **NextAuth.js**, and **Razorpay** (test mode).

---

## ✨ Features

- 🔐 Social authentication (GitHub, Google, LinkedIn) via NextAuth.js
- 👤 Creator profiles with custom cover & profile pictures
- 💳 Razorpay payment integration (test mode)
- 🏆 Top supporters leaderboard per creator
- 📊 Personal dashboard for configuring Razorpay and profile details
- 📱 Fully responsive design

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB Atlas (free tier) |
| Auth | NextAuth.js v4 |
| Payments | Razorpay (test mode) |
| Styling | Tailwind CSS |
| ORM | Mongoose |

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/getmeachai.git
cd getmeachai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in every value (see table below).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `MONGO_URI` | MongoDB connection string | [mongodb.com/atlas](https://mongodb.com/atlas) → Free cluster |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` (dev) |
| `NEXT_PUBLIC_URL` | Public base URL | Same as `NEXTAUTH_URL` |
| `GITHUB_ID` | GitHub OAuth Client ID | See below |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | See below |
| `GOOGLE_ID` | Google OAuth Client ID | See below |
| `GOOGLE_SECRET` | Google OAuth Client Secret | See below |
| `LINKEDIN_CLIENT_ID` | LinkedIn App Client ID | See below |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn App Client Secret | See below |

---

## 🔐 OAuth Setup Guides

### GitHub OAuth
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and **Client Secret** into `.env.local`

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API** or **People API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Set **Application type** to **Web application**
6. Add **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** into `.env.local`

### LinkedIn OAuth
1. Go to [developer.linkedin.com](https://developer.linkedin.com)
2. Click **Create App**
3. Under the **Auth** tab, add redirect URL: `http://localhost:3000/api/auth/callback/linkedin`
4. Under the **Products** tab, request **Sign In with LinkedIn using OpenID Connect**
5. Copy **Client ID** and **Client Secret** into `.env.local`

> ⚠️ LinkedIn may require your app to be reviewed before Google/LinkedIn sign-in works for users other than yourself.

---

## 💳 Razorpay Test Mode Setup

This app uses **Razorpay Test Mode** — no real money is transferred.

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com) (free)
2. Toggle to **Test Mode** (top-left switch in dashboard)
3. Go to **Settings → API Keys → Generate Test Key**
4. Copy your **Key ID** (starts with `rzp_test_`) and **Key Secret**
5. Log in to your app, go to **Dashboard**, and paste the keys in the Razorpay ID and Razorpay Secret fields
6. Save your profile

### Test Payment Cards (no real money)
| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| `4111 1111 1111 1111` | Any 3 digits | Any future date | Success |
| `4000 0000 0000 0002` | Any 3 digits | Any future date | Failure |

---

## 🌐 Deploy to Vercel (Free)

1. Push this repository to GitHub (see GitHub Upload section)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** → import your repository
4. Add the environment variables from your `.env.local` file (except `MONGO_URI` if it needs a prod database).
   - Change `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to your Vercel URL (e.g., `https://getmeachai.vercel.app`)
5. Click **Deploy** → your app is live with a free `.vercel.app` domain
6. Update OAuth callback URLs in GitHub/Google/LinkedIn to include your Vercel URL:
   - `https://your-app.vercel.app/api/auth/callback/github`
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/linkedin`

---

## 📁 Project Structure

```
65proj6/
├── app/
│   ├── [username]/        # Public creator page
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   └── razorpay/            # Payment verification webhook
│   ├── dashboard/         # Protected creator dashboard
│   ├── login/             # Login page
│   ├── about/             # About page
│   ├── layout.js          # Root layout with Navbar/Footer
│   └── page.js            # Landing page
├── actions/
│   └── useractions.js     # Server Actions (DB operations)
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── Dashboard.js
│   ├── PaymentPage.js
│   └── SessionWrapper.js
├── db/
│   └── connectDb.js       # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   └── Payment.js         # Payment schema
├── public/                # Static assets (GIFs, images)
├── .env.local.example     # ← Copy this to .env.local
└── .gitignore             # .env.local is excluded
```

---

## 🔒 Security Notes

- `.env.local` is excluded from git by `.gitignore` — never commit it
- Razorpay payment signatures are verified server-side before marking payments as complete
- NextAuth JWT is signed with `NEXTAUTH_SECRET`
- User Razorpay secrets are stored per-user in MongoDB (not as global env vars)

---

## 📜 License

This project is for educational purposes. MIT License.
