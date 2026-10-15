# Clothing Exchange & Swap Marketplace
## Website Documentation

**Project Type:** Sustainable Clothing Exchange Web Application  
**Version:** 1.0.0  
**Deployment:** Vercel  
**Backend Status:** Deployed with MongoDB Atlas connectivity

---

## 1. Project Overview

The Clothing Exchange & Swap Marketplace is a web-based platform that promotes sustainable fashion by allowing users to exchange pre-owned clothing instead of purchasing new items.

Users can create accounts, list clothing items, browse available products, send swap requests, communicate with other users, and manage their exchange history. Administrators can manage users, clothing listings, and swap activities.

The platform aims to reduce textile waste, encourage clothing reuse, and support a circular fashion economy without monetary transactions.

## 2. Website and Deployment URLs

| Component | URL |
|---|---|
| Live frontend website | https://clothing-exchange-swap-marketplace-sandy.vercel.app |
| Backend API | https://clothing-exchange-backend.vercel.app |
| API health check | https://clothing-exchange-backend.vercel.app/api/health |
| GitHub repository | https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace |

### Frontend Pages (Direct & Clean URLs)

| Page | Direct URL | Clean URL |
|------|------------|-----------|
| Home | https://clothing-exchange-swap-marketplace-sandy.vercel.app/index.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/ |
| Login | https://clothing-exchange-swap-marketplace-sandy.vercel.app/login.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/login |
| Register | https://clothing-exchange-swap-marketplace-sandy.vercel.app/register.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/register |
| Dashboard | https://clothing-exchange-swap-marketplace-sandy.vercel.app/dashboard.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/dashboard |
| Listings | https://clothing-exchange-swap-marketplace-sandy.vercel.app/listings.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/listings |
| Item Details | https://clothing-exchange-swap-marketplace-sandy.vercel.app/item-details.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/item-details |
| Swap Requests | https://clothing-exchange-swap-marketplace-sandy.vercel.app/swap-requests.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/swap-requests |
| Chat | https://clothing-exchange-swap-marketplace-sandy.vercel.app/chat.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/chat |
| Admin Panel | https://clothing-exchange-swap-marketplace-sandy.vercel.app/admin.html | https://clothing-exchange-swap-marketplace-sandy.vercel.app/admin |

The frontend communicates with the backend through REST API requests secured by HTTPS in production. The API health endpoint reports real-time MongoDB database connection status.

## 3. Objectives

- Provide a platform for exchanging pre-owned clothes.
- Encourage sustainable and environmentally friendly fashion.
- Allow users to manage clothing listings and swap requests.
- Facilitate communication between users.
- Provide administrators with tools to manage platform activities.
- Eliminate the need for direct monetary transactions between users.

## 4. Technologies Used

### Frontend
- HTML5
- CSS3 (Responsive layouts, custom modal styling, CSS variables)
- JavaScript (Vanilla ES6+ modules and async/await API integration)
- Responsive web design

### Backend
- Node.js
- Express.js
- REST API architecture

### Database
- MongoDB Atlas (Cloud Database)
- Mongoose ODM

### Authentication and Security
- Password hashing using bcryptjs
- JSON Web Tokens (JWT) for stateless session authorization
- Role-based access control (User and Admin)
- Production CORS origin whitelisting

## 5. Main Features

### 5.1 User Registration and Login
Users can register for an account and log in with their credentials. Authentication allows the platform to identify users and provide access to authorized functionality.

### 5.2 Clothing Listings
Users can create clothing listings containing item information, such as the title, category, condition, description, and images, according to the implemented listing form.

### 5.3 Browse and Search
Users can explore available clothing items and use supported search and filtering options to find suitable items.

### 5.4 Clothing Details
Users can view information about individual clothing items before deciding whether to request an exchange.

### 5.5 Swap Requests
Users can initiate clothing exchange requests. Requests can be managed according to the statuses supported by the application (Pending, Accepted, Negotiating, Completed, Rejected, Cancelled).

### 5.6 Chat and Communication
Users can communicate about potential clothing exchanges through the platform's messaging functionality.

### 5.7 User Dashboard
Users can manage their account and view relevant clothing listings and swap activity.

### 5.8 Administration
Authorized administrators can manage platform users, clothing listings, swap requests, and other supported administrative features.

## 6. System Architecture

The application uses a client-server architecture:

1. The user opens the frontend website through a browser.
2. The frontend sends API requests to the Express.js backend.
3. The backend validates incoming requests and applies business logic.
4. The backend communicates with MongoDB Atlas to retrieve or update data.
5. The backend returns a response to the frontend.
6. The frontend displays the response to the user.

**Architecture flow:**

Browser → HTTPS Frontend → Backend REST API → MongoDB Atlas

## 7. Backend API Endpoints

The deployed backend exposes the following API routes:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend and database status |
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Authenticate credentials and receive JWT |
| GET | `/api/auth/me` | Retrieve authenticated user profile |
| PUT | `/api/auth/profile` | Update profile details |
| GET | `/api/clothing` | Browse garments with search & filtering |
| POST | `/api/clothing` | Publish a new clothing listing |
| GET | `/api/clothing/my/items` | Retrieve authenticated user's wardrobe listings |
| GET | `/api/clothing/nearby/matches` | Find matching items based on location |
| GET | `/api/clothing/:id` | Get details for an individual garment |
| PUT | `/api/clothing/:id` | Update garment details (Owner or Admin) |
| DELETE | `/api/clothing/:id` | Delete garment listing (Owner or Admin) |
| POST | `/api/swaps` | Propose a new trade / swap request |
| GET | `/api/swaps/incoming` | Retrieve swap requests received by user |
| GET | `/api/swaps/outgoing` | Retrieve swap requests sent by user |
| GET | `/api/swaps/counts` | Metrics summary for user dashboard |
| GET | `/api/swaps/:id` | View specific swap details |
| PUT | `/api/swaps/:id/accept` | Accept an incoming trade proposal |
| PUT | `/api/swaps/:id/reject` | Decline an incoming trade proposal |
| PUT | `/api/swaps/:id/cancel` | Cancel an outgoing trade proposal |
| PUT | `/api/swaps/:id/status` | Update trade progress (Negotiating, Completed) |
| POST | `/api/swaps/calculate-value` | Calculate barter fairness score between garments |
| GET | `/api/chat/:swapRequestId` | Load conversation thread for a swap |
| POST | `/api/chat/messages` | Post a message in negotiation chat |
| GET | `/api/admin/analytics` | Overall platform stats & metrics (Admin only) |
| GET | `/api/admin/users` | List platform users (Admin only) |
| PUT | `/api/admin/users/:id/role` | Promote/demote user permissions (Admin only) |
| GET | `/api/admin/clothing` | Inspect all platform listings (Admin only) |
| DELETE | `/api/admin/clothing/:id` | Content moderation removal (Admin only) |
| GET | `/api/admin/swaps` | Monitor all platform trades (Admin only) |

**Base URL:**

`https://clothing-exchange-backend.vercel.app`

## 8. Database Configuration

The application uses MongoDB Atlas as its cloud database.

The database stores application data such as user accounts, clothing listings, swap requests, and messages.

### Environment Variables

Configure the required variables in the backend deployment settings.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens |
| `FRONTEND_URL` | Deployed frontend domain for explicit CORS whitelist |

**Security note:** Never publish actual database passwords, JWT secrets, or private environment-variable values in documentation or source control.

## 9. Installation and Local Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB Atlas account or local MongoDB instance

### Step 1: Clone the Repository

```bash
git clone https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace.git
cd Clothing-Exchange-Swap-Marketplace
```

### Step 2: Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
FRONTEND_URL=http://localhost:5500
```

### Step 3: Start the Backend

```bash
npm start
```

### Step 4: Run the Frontend

Open `frontend/index.html` with a static web server (such as Live Server in VS Code, or `npx serve frontend`).

## 10. HTTPS and Deployment

The production application is hosted on Vercel with automatic HTTPS.

To maintain secure production communication:

- Use HTTPS URLs for all frontend-to-backend requests.
- Configure CORS to allow the deployed frontend origin (`https://clothing-exchange-swap-marketplace-sandy.vercel.app`).
- Store secrets in Vercel environment variables (`MONGODB_URI`, `JWT_SECRET`).
- Keep MongoDB credentials private.

## 11. Security Considerations

- Do not store plain-text passwords (passwords are automatically hashed via bcryptjs pre-save hooks).
- Validate user input on the backend.
- Protect administrator routes with authorization checks (`protect` + `admin` middleware).
- Verify authentication tokens on protected requests.
- Avoid exposing sensitive server credentials in logs or errors.
- Keep credentials and secrets out of GitHub.
- Configure CORS for the required frontend origin.

---

**Project Repository:**  
https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace

**Live Website:**  
https://clothing-exchange-swap-marketplace-sandy.vercel.app

**Backend Health Check:**  
https://clothing-exchange-backend.vercel.app/api/health
