# 🌙 Overthinker's Spot

> *A safe, anonymous place for the thoughts you never shared.*

A full-stack anonymous emotional expression platform. Users can post thoughts anonymously, react with empathy, and browse messages across three curated sections — all without creating an account.

---

## 📁 Project Structure

```
overthinkers-spot/
├── public/
│   └── index.html          ← Single-page frontend (all HTML/CSS/JS)
├── api/
│   ├── messages.js         ← GET list + POST create messages
│   ├── stats.js            ← GET message counts & emotion breakdown
│   ├── admin.js            ← Admin: list all + delete messages
│   └── react/
│       └── [id].js         ← POST reaction to a specific message
├── database/
│   └── schema.sql          ← Postgres schema + seed data (run once)
├── package.json
├── vercel.json             ← Vercel routing config
└── README.md
```

---

## ⚡ How It Works

### Sections
| Section | What goes here | Endpoint filter |
|---|---|---|
| **Read** | General thoughts, everyday emotions | `section=general` |
| **Midnight Thoughts** | Late-night reflections, overthinking, loneliness | `section=midnight` |
| **Hope Wall** | Recovery stories, gratitude, small victories | `section=hope` |

When writing a message, users pick **one** section. That message only appears in that section's feed — never in the others.

### Features
- ✍️ Anonymous message submission (no account, no email)
- 📚 Filterable message feed (by emotion)
- ❤️ 4 positive-only reactions: I Relate, Sending Support, Stay Strong, You're Not Alone
- 🌙 Midnight Thoughts — animated starfield, immersive dark layout
- 🌱 Hope Wall — warm uplifting section
- 🌙/☀️ Dark/Light theme toggle
- 🛡️ Admin panel with password-protected message deletion
- 📱 Fully responsive (mobile & desktop)
- 🔄 **Offline fallback** — works as a local file using localStorage if no backend is available

---

## 🚀 Deploy to Vercel (Recommended)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create overthinkers-spot --public --push
# or push to your existing GitHub repo
```

### Step 2 — Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework Preset: **Other**
4. Root Directory: leave blank (project root)
5. Click **Deploy**

### Step 3 — Add Vercel Postgres Database
1. In your Vercel project → **Storage** tab → **Create Database** → **Postgres**
2. Name it anything (e.g. `overthinkers-db`)
3. Click **Connect** → this auto-adds `POSTGRES_URL` and related env vars

### Step 4 — Run the SQL Schema
1. In Vercel → Storage → your database → **Query** tab
2. Paste the contents of `database/schema.sql` and run it
3. This creates the `messages` table and seeds 10 sample messages

### Step 5 — Set Admin Secret Key
1. In Vercel → Project Settings → **Environment Variables**
2. Add:
   ```
   Name:  ADMIN_SECRET_KEY
   Value: your-secret-password-here
   ```
3. Set for: Production, Preview, Development

### Step 6 — Redeploy
```bash
# Either push a commit, or in Vercel dashboard → Deployments → Redeploy
```

Your site is live at `https://your-project.vercel.app` 🎉

---

## 🏃 Run Locally (Development)

### Prerequisites
- Node.js 18+
- A Vercel account with Postgres database (for shared data)
- Vercel CLI

### Install
```bash
npm install -g vercel
npm install
```

### Link to Vercel project (pulls env vars)
```bash
vercel link
vercel env pull .env.local
```

### Start dev server
```bash
vercel dev
```
Open [http://localhost:3000](http://localhost:3000)

> **No backend?** Open `public/index.html` directly in your browser.
> The app auto-detects the `file://` protocol and switches to localStorage mode —
> messages are stored in your browser and won't be shared with others.

---

## 🔌 API Reference

All endpoints are Vercel Edge Functions under `/api/`.

### `GET /api/messages`
Returns a list of approved messages.

| Query param | Type | Description |
|---|---|---|
| `section` | string | Filter by section: `general`, `midnight`, or `hope` |
| `emotion` | string | Filter by emotion (e.g. `Anxiety`, `Hope`) |
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset (default 0) |

**Response:** `200 OK` — array of message objects

```json
[
  {
    "id": "uuid",
    "emotion": "Loneliness",
    "recipient": "You",
    "content": "I keep replaying...",
    "section": "midnight",
    "approved": true,
    "created_at": "2026-06-15T02:00:00Z",
    "react_relate": 14,
    "react_support": 8,
    "react_strong": 11,
    "react_notalone": 19
  }
]
```

---

### `POST /api/messages`
Submit a new anonymous message.

**Body (JSON):**
```json
{
  "emotion": "Anxiety",
  "recipient": "Past Me",
  "content": "You survived every bad day so far.",
  "section": "general"
}
```

**Validations:**
- `emotion` must be one of: `Anxiety`, `Loneliness`, `Hope`, `Heartbreak`, `Stress`, `Gratitude`, `Self-Doubt`, `Other`
- `content` must be 10–1000 characters
- `section` must be `general`, `midnight`, or `hope`
- `recipient` is optional, max 60 characters

**Response:** `201 Created` — the created message object

---

### `POST /api/react/[id]`
Add an empathetic reaction to a message.

**Body (JSON):**
```json
{ "reaction": "relate" }
```

Valid reactions: `relate`, `support`, `strong`, `notalone`

**Response:** `200 OK` — updated message object with new reaction counts

---

### `GET /api/stats`
Returns message statistics.

**Response:**
```json
{
  "total": 42,
  "by_emotion": {
    "Anxiety": 8,
    "Loneliness": 12,
    "Hope": 7
  }
}
```

---

### `GET /api/admin` *(Admin only)*
Returns ALL messages including metadata.

**Headers:** `X-Admin-Key: your-secret-key`

| Query param | Description |
|---|---|
| `limit` | Max results (default 50, max 200) |
| `offset` | Pagination offset |

**Response:**
```json
{
  "total": 42,
  "messages": [...]
}
```

---

### `DELETE /api/admin` *(Admin only)*
Permanently delete a message.

**Headers:** `X-Admin-Key: your-secret-key`

**Body (JSON):**
```json
{ "id": "message-uuid-here" }
```

**Response:** `200 OK` — `{ "success": true }`

---

## 🛡️ Admin Panel

1. On the live site, click the 🔑 key icon in the bottom-right corner
2. Enter your `ADMIN_SECRET_KEY`
3. Browse all messages across all sections
4. Click **Delete** on any message to remove it permanently

The admin panel is client-side but protected by the secret key which is validated server-side on every request.

---

## 🗄️ Database Schema

```sql
CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emotion      TEXT NOT NULL,        -- e.g. 'Anxiety'
  recipient    TEXT,                 -- optional "To:" field
  content      TEXT NOT NULL,        -- the message (10–1000 chars)
  section      TEXT NOT NULL,        -- 'general' | 'midnight' | 'hope'
  approved     BOOLEAN DEFAULT true, -- admin can set false to hide
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  react_relate    INTEGER DEFAULT 0,
  react_support   INTEGER DEFAULT 0,
  react_strong    INTEGER DEFAULT 0,
  react_notalone  INTEGER DEFAULT 0
);
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_URL` | Yes (auto-set by Vercel Postgres) | Database connection string |
| `POSTGRES_URL_NON_POOLING` | Yes (auto-set) | For migrations |
| `ADMIN_SECRET_KEY` | Yes | Password for admin panel |

All Postgres variables are automatically set when you link a Vercel Postgres database.

---

## 🎨 Design System

| Token | Dark | Light | Use |
|---|---|---|---|
| `--accent` | `#9b7fe8` | `#6a4fd4` | Primary purple |
| `--green` | `#7fe8a8` | `#2a9050` | Hope Wall |
| `--rose` | `#e87f9b` | `#c44068` | Heartbreak / Anxiety |
| `--teal` | `#5ec4d0` | `#2a8a94` | Loneliness |
| `--amber` | `#e8c47f` | `#b07820` | Stress / Warnings |

---

## 🔒 Privacy Philosophy

- **No accounts** — no email, no password, no profile
- **No tracking** — no analytics, no cookies beyond theme preference
- **No comments** — only positive reactions to maintain safety
- **No negativity** — no dislike buttons, no reports from users
- **Admin-only moderation** — inappropriate content removed by admin key

---

## ⚠️ Mental Health Disclaimer

Overthinker's Spot is a creative expression platform, **not** a mental health service. It is **not** a substitute for professional support. If you or someone you know is in crisis, please contact a licensed mental health professional or a crisis helpline in your country.

---

*Made with quiet intention. All messages are anonymous.*
