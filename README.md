<<<<<<< HEAD
# Philip's Blog

A complete, full-stack personal blog — dynamic single-page React app on the
front end, Express + MongoDB API on the back end. Readers can register, follow
the blog, subscribe by email, like posts, comment, and share. Philip (admin)
gets a full dashboard for writing posts and moderating the community.

## Features

**Readers**
- Browse published posts with search, tag filtering, and pagination
- Read full posts rendered from Markdown, with cover images and tags
- Like posts (toggle), comment on posts, delete own comments
- Share via X, Facebook, copy-link, or the native Web Share API — every share is counted
- Follow the blog (follower count shown in the header) and subscribe by email
- Contact form to send Philip a message

**Admin (Philip)**
- Dashboard with stats: posts, subscribers, followers, comments, messages
- Write, edit, publish/unpublish, and delete posts (Markdown editor)
- Moderate comments, view subscriber list, read contact messages

## Project structure

```
blog-site/
├── render.yaml            # Render blueprint (API + static client)
├── README.md
├── server/                # Backend: Node + Express + Mongoose
│   ├── Dockerfile
│   ├── .env.example
│   ├── server.js          # app setup, route mounting, error handler
│   ├── seed.js            # idempotent admin + welcome-post seeding
│   ├── config/db.js
│   ├── middleware/auth.js # JWT auth + admin guard
│   ├── models/            # User, Post, Like, Comment, ShareCount, Subscriber, Follow, Message
│   └── routes/            # auth, posts, comments, follow, subscribe, contact, admin
└── client/                # Frontend: React 18 + Vite
    ├── Dockerfile         # multi-stage build -> nginx static serve
    ├── nginx.conf         # SPA fallback + asset caching
    ├── .env.example
    └── src/
        ├── api.js         # axios instance (VITE_API_URL)
        ├── auth.jsx       # AuthContext + localStorage token
        ├── components/    # Header, Footer, PostCard, LikeButton, ShareButtons,
        │                  # CommentSection, FollowButton, SubscribeForm, ProtectedRoute
        ├── pages/         # Home, PostDetail, About, Contact, Login, Register,
        │                  # Subscribe, Admin
        └── index.css      # single global stylesheet
```

## Prerequisites

- Node.js 20+
- MongoDB — either running locally (`mongod`) or a free MongoDB Atlas cluster (see Deployment)

## Run it locally

**1. Backend**

```bash
cd server
cp .env.example .env
# edit .env: set ADMIN_EMAIL and ADMIN_PASSWORD (your admin login)
npm install
npm run seed    # creates the admin user + a welcome post (safe to re-run)
npm start       # API on http://localhost:5000/api
```

**2. Frontend** (new terminal)

```bash
cd client
npm install
npm run dev     # app on http://localhost:5173
```

The client talks to the API at `VITE_API_URL` (defaults to
`http://localhost:5000/api`). Log in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD`
you seeded to reach the admin dashboard at `/admin`.

## API overview

Base: `http://localhost:5000/api`. Auth: `Authorization: Bearer <token>`.

| Method & path | Auth | What it does |
|---|---|---|
| POST /auth/register, POST /auth/login, GET /auth/me | — / — / token | accounts + session |
| GET /posts?tag=&search=&page=&limit= | public | published posts, newest first |
| GET /posts/all | admin | everything incl. drafts |
| GET /posts/:slug | public | post + likeCount, commentCount, shareCounts |
| POST /posts, PUT /posts/:id, DELETE /posts/:id | admin | manage posts (slug auto-generated) |
| POST /posts/:id/like | token | toggle like -> {liked, likeCount} |
| GET /posts/:id/comments, POST /posts/:id/comments | public / token | read + write comments |
| DELETE /comments/:id | owner or admin | remove a comment |
| POST /posts/:id/share {platform} | public | count a share (x\|facebook\|link\|other) |
| POST /follow, GET /follow/count | token / public | follow the blog |
| POST /subscribe {email}, GET /subscribers | public / admin | email subscriptions |
| POST /contact, GET /contact | public / admin | contact messages |
| GET /admin/stats | admin | dashboard counters |

## Deployment

### Database: MongoDB Atlas (free)

1. Create a free account at cloud.mongodb.com and create an **M0 (free tier)** cluster.
2. Under Database Access, create a database user (username + password).
3. Under Network Access, allow connections from anywhere (`0.0.0.0/0`) — required for hosted platforms.
4. Connect -> Drivers -> copy the connection string. It looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/blogdb`.
   Use it as `MONGO_URI` below.

### Recommended $0 path: Render

`render.yaml` in the repo root is a Render Blueprint that defines both
services. In the Render dashboard: **New -> Blueprint**, point it at this repo.

**Order matters** (each URL is needed by the other side):

1. Deploy the Blueprint. Set `MONGO_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` on
   `philip-blog-api` when prompted (`JWT_SECRET` is auto-generated).
2. The seed script runs automatically before each deploy (`preDeployCommand`)
   and creates your admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
3. Once the API is live (e.g. `https://philip-blog-api.onrender.com`), set
   `VITE_API_URL=https://philip-blog-api.onrender.com/api` on
   `philip-blog-client` and trigger a redeploy.
4. Once the client is live (e.g. `https://philip-blog-client.onrender.com`),
   set `CLIENT_URL` to that origin on `philip-blog-api` and redeploy the API
   (this locks CORS to your frontend).

Note: Render's free tier spins services down after inactivity, so the first
request after idle can take ~30-60s to wake up.

### Alternatives

- **Railway** — `railway init`, add a MongoDB plugin or paste Atlas `MONGO_URI`,
  set the env vars below; deploy `server/` as one service and `client/` (static
  or via its Dockerfile) as another.
- **Fly.io** — `fly launch` in `server/` (Dockerfile included); `fly launch` in
  `client/` with the nginx Dockerfile; `fly secrets set` for env vars.
- **Frontend-only: Vercel / Netlify** — point at `client/`, build command
  `npm run build`, publish directory `dist`, and set `VITE_API_URL` in the
  project environment variables. The API still needs a home (Render/Railway/Fly
  above, or anywhere Node runs).

### Production environment variables

**Server** (`philip-blog-api`):

| Var | Required | Purpose |
|---|---|---|
| `MONGO_URI` | yes | MongoDB Atlas M0 connection string |
| `JWT_SECRET` | yes | long random string for signing tokens |
| `CLIENT_URL` | yes | frontend origin(s), comma-separated, for CORS |
| `ADMIN_EMAIL` | yes | admin login (used by seed) |
| `ADMIN_PASSWORD` | yes | admin password (used by seed) |
| `PORT` | no | defaults to 5000 (hosts usually inject their own) |

**Client** (`philip-blog-client`):

| Var | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | yes | full API base URL, e.g. `https://philip-blog-api.onrender.com/api` |

Vite bakes `VITE_API_URL` into the bundle **at build time** — changing it
requires a rebuild/redeploy of the client. Locally, copy `client/.env.example`
to `client/.env` or rely on the `http://localhost:5000/api` fallback.

## What Philip needs to do

1. Install MongoDB locally **or** create the free Atlas M0 cluster above.
2. Fill in `server/.env` (from `.env.example`) — at minimum `ADMIN_EMAIL` and
   `ADMIN_PASSWORD`.
3. `npm install`, `npm run seed`, `npm start` in `server/`; `npm install`,
   `npm run dev` in `client/`.
4. Open `http://localhost:5173`, log in, visit `/admin`, and write the first
   real post.
=======
# personal-blog
>>>>>>> fa136a7 (Initial commit)
