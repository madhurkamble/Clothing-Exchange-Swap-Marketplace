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
| Live frontend website | **[Add your frontend HTTPS URL here]** |
| Backend API | https://clothing-exchange-backend.vercel.app |
| API health check | https://clothing-exchange-backend.vercel.app/api/health |
| GitHub repository | https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace |

The frontend and backend are deployed separately on Vercel. The frontend communicates with the backend through HTTP API requests secured by HTTPS in production.

The API health endpoint can be used to check the backend service status and database connection.

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
- CSS3
- JavaScript
- Responsive web design

### Backend
- Node.js
- Express.js
- REST API architecture

### Database
- MongoDB Atlas
- Mongoose

### Authentication and Security
- Password hashing using bcrypt or bcryptjs
- JSON Web Tokens (JWT), where configured
- Environment variables for sensitive configuration
- Cross-Origin Resource Sharing (CORS)

### Deployment and Version Control
- Vercel for hosting
- Git and GitHub for version control

*The final technology list should match the dependencies and implementation in the actual repository.*

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
Users can initiate clothing exchange requests. Requests can be managed according to the statuses supported by the application.

### 5.6 Chat and Communication
Users can communicate about potential clothing exchanges through the platform's messaging functionality.

### 5.7 User Dashboard
Users can manage their account and view relevant clothing listings and swap activity.

### 5.8 Administration
Authorized administrators can manage platform users, clothing listings, swap requests, and other supported administrative features.

## 6. System Architecture

The application uses a client-server architecture.

1. The user opens the frontend website through a browser.
2. The frontend sends API requests to the Express.js backend.
3. The backend validates incoming requests and applies business logic.
4. The backend communicates with MongoDB Atlas to retrieve or update data.
5. The backend returns a response to the frontend.
6. The frontend displays the response to the user.

**Architecture flow:**

Browser → HTTPS Frontend → Backend REST API → MongoDB Atlas

## 7. Backend API Endpoints

The deployed backend advertises the following API endpoint groups:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check backend and database status |
| `/api/auth` | Authentication-related operations |
| `/api/clothing` | Clothing listing operations |
| `/api/swaps` | Swap request operations |
| `/api/chat` | Messaging operations |
| `/api/admin` | Administrative operations |

**Base URL:**

`https://clothing-exchange-backend.vercel.app`

For example, the health-check URL is:

https://clothing-exchange-backend.vercel.app/api/health

The endpoint groups above are confirmed by the deployed backend's root response. Individual routes, HTTP methods, request fields, and authorization requirements should be documented from the actual backend route files.

## 8. Database Configuration

The application uses MongoDB Atlas as its cloud database.

The database stores application data such as user accounts, clothing listings, swap requests, and messages, depending on the implemented schemas.

### Environment Variables

Configure the required variables in the backend deployment settings.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens, if JWT is implemented |

Other variables may be required by the project.

**Security note:** Never publish actual database passwords, JWT secrets, or private environment-variable values in documentation or source control.

## 9. Installation and Local Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB Atlas account or another supported MongoDB instance
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace.git
cd Clothing-Exchange-Swap-Marketplace
```

### Step 2: Configure the Backend

Open the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Use the variable names required by your actual code. Do not commit the `.env` file to GitHub.

### Step 3: Start the Backend

```bash
npm start
```

Use the start command defined in `backend/package.json` if it differs from this example.

### Step 4: Start the Frontend

Open the frontend directory and follow the scripts or setup instructions defined by the project. For a static HTML/CSS/JavaScript frontend, a local development server can be used.

### Step 5: Configure the API URL

Ensure the production frontend sends API requests to:

```text
https://clothing-exchange-backend.vercel.app
```

Use the appropriate API route paths and request payloads defined by the backend.

## 10. HTTPS and Deployment

The production backend is hosted on Vercel and uses an HTTPS URL.

To maintain secure production communication:

- Use HTTPS URLs for frontend-to-backend requests.
- Configure CORS to allow the actual deployed frontend origin.
- Store secrets in Vercel environment variables.
- Keep MongoDB credentials private.
- Restrict database network access where practical.
- Redeploy after changing production environment variables or deployment configuration.
- Verify authentication and database operations on the deployed website.

HTTPS encrypts data in transit, but it does not replace authentication, authorization, input validation, or secure database configuration.

## 11. Testing

The following checks should be performed before the final project demonstration:

1. Verify that the deployed website loads.
2. Check that the backend health endpoint responds successfully.
3. Register a new user and test login and logout.
4. Create and browse clothing listings.
5. Test supported search and filtering options.
6. Send and respond to swap requests.
7. Verify messaging functionality.
8. Test administrator permissions.
9. Refresh the website and confirm saved data persists.
10. Check browser developer tools for failed API requests, CORS errors, or server errors.

Record the actual results after testing each feature.

## 12. Security Considerations

- Do not store plain-text passwords.
- Validate user input on the backend.
- Protect administrator routes with authorization checks.
- Verify authentication tokens on protected requests.
- Avoid exposing sensitive server errors to users.
- Keep credentials and secrets out of GitHub.
- Configure CORS for the required frontend origin.
- Review MongoDB Atlas network-access rules and use least-privilege database permissions.
- Test access controls to ensure users cannot modify other users' data without authorization.

## 13. Limitations

The available documentation confirms the application architecture and deployed API endpoint groups. The exact implemented behavior of individual routes, image upload limits, swap rules, messaging permissions, and administrative reports should be verified against the source code.

Online payments, AI-based recommendations, augmented reality, and a dedicated mobile application are outside the originally defined project scope.

## 14. Future Enhancements

- Email notifications for swap requests.
- Improved location-based matching.
- Enhanced search and filtering.
- User ratings and feedback.
- Better moderation and dispute handling.
- Additional analytics and reporting.
- Automated deployment and integration tests.

## 15. Conclusion

The Clothing Exchange & Swap Marketplace provides a digital platform for sustainable clothing exchanges. It combines a browser-based frontend, a Node.js and Express backend, and MongoDB Atlas for data persistence.

The deployed backend provides HTTPS access and a health-check endpoint. After verifying all user-facing features on the live frontend, the project can be presented as a full-stack web application demonstrating authentication, REST APIs, database integration, and deployment.

---

**Project Repository:**  
https://github.com/madhurkamble/Clothing-Exchange-Swap-Marketplace

**Backend Health Check:**  
https://clothing-exchange-backend.vercel.app/api/health
