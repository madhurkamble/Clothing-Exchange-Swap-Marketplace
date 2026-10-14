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

## Deployment
The app can be deployed to any Node‑compatible platform (Vercel, Render, Railway, etc.). A typical deployment command:
```bash
npm install && npm start
```
Ensure the environment provides `MONGODB_URI` and `JWT_SECRET`.

## License
MIT – Feel free to fork, modify, and improve!
