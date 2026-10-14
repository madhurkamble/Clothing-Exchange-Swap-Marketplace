# Clothing Exchange & Swap Marketplace

A beginner‑friendly web application that lets users **swap clothing items** instead of buying new ones. The project was built over a 5‑day sprint using a simple stack:

- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Quick Start
```bash
# Clone the repository (if applicable)
# Install dependencies
npm install

# Start the server (runs on http://localhost:5000)
npm start
```

Open `http://localhost:5000` in a browser. Use the demo credentials from `PROJECT_PROGRESS.md` to log in as an **admin** or a **regular user**.

## Project Structure
```
Clothing Exchange & Swap Marketplace/
├─ backend/          # Express server, routes, models, middleware
├─ frontend/         # Static HTML, CSS, JS assets
│   ├─ css/          # Stylesheets (including spinner.css)
│   └─ js/           # Client‑side scripts
├─ scratch/          # Temporary test scripts
├─ .env.example      # Environment variable template
├─ package.json
└─ README.md
```

## Scripts
- `npm start` – Starts the Express server.
- `npm test` – Runs the Mocha test suite (uses `scratch/test-day5.js`).

## Testing
The test suite spins up the live server and performs end‑to‑end API checks (authentication, listings, swaps, chat, admin routes). To run:
```bash
npm test
```
All tests should pass (`1 passing`).

## UI Loading Spinner
A CSS spinner is displayed during asynchronous network calls to improve perceived performance. Files added:
- `frontend/css/spinner.css`
- `frontend/js/spinner.js`
Pages now import these assets and the client code calls `showSpinner()` / `hideSpinner()` around `fetch` operations.

## Deployment to Vercel

The application is configured to deploy directly to [Vercel](https://vercel.com) using `@vercel/node` and static frontend asset routing.

### Prerequisites: MongoDB Atlas Database (Free)
Because Vercel functions run in a serverless environment without a local MongoDB service, you must use a cloud database like **MongoDB Atlas**:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`).
3. Under **Database Access**, create a database user and note the password.
4. Obtain the connection URI (e.g. `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/clothing_swap_marketplace?retryWrites=true&w=majority`).

### Option A: Deploy via GitHub (Recommended)
1. Commit and push your changes to GitHub:
   ```bash
   git add -A
   git commit -m "Configure Vercel deployment export and routing"
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project** and import your repository.
3. **IMPORTANT**: In **Root Directory**, keep the default `.` (project root). Do **not** set it to `backend`.
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: your secret key (e.g. `clothswap_jwt_super_secret_key_2026`)
   - `NODE_ENV`: `production`
5. Click **Deploy**.

### Option B: Deploy via Vercel CLI
From the root directory of the project:
```bash
# 1. Install CLI
npm install -g vercel

# 2. Log in
vercel login

# 3. Deploy
vercel

# 4. Set Environment Variables
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production

# 5. Deploy to Production
vercel --prod
```

### Health Check Verification
After deployment, verify that the backend API is live:
```
https://<your-vercel-domain>.vercel.app/api/health
```
A successful response will return:
```json
{
  "status": "ok",
  "message": "Clothing Exchange & Swap Marketplace API is healthy and running",
  "database": "connected",
  "timestamp": "..."
}
```

## License
MIT – Feel free to fork, modify, and improve!

