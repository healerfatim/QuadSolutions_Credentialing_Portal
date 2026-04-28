# QuadSolutions Credentialing Portal

A full-stack web application that streamlines the healthcare provider credentialing process. Healthcare professionals can register, submit credentialing applications, upload supporting documents, and track their request status — while administrators manage and moderate all submissions from a dedicated control panel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Application Screens](#application-screens)
- [License](#license)

---

## Features

### Provider (User) Side
- **Registration & Login** — Secure account creation and authentication using JWT
- **Service Catalog** — Apply for Medical License Renewal, Insurance Enrollment, or DEA Certification
- **Document Upload** — Attach proof-of-identity documents to each application
- **Request Tracking** — Monitor the real-time status of all submitted applications (Pending / Approved / Rejected)
- **Support Tickets** — Submit help-desk tickets directly to the support team

### Admin Side
- **Dashboard Stats** — At-a-glance view of total clients, pending reviews, and approved applications
- **Request Management** — View all submitted applications with provider name, service type, and document reference
- **Moderation** — Approve or reject individual credentialing requests with one click

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, React Router DOM v6, Axios            |
| UI Icons   | Lucide React                                    |
| Backend    | Node.js, Express 5                              |
| Database   | MongoDB Atlas (Mongoose ODM)                    |
| Auth       | JSON Web Tokens (JWT), bcryptjs                 |
| Dev Tools  | dotenv, CORS                                    |

---

## Project Structure

```
QuadSolutions_Credentialing_Portal/
├── client/                     # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── Login.js        # All views (landing, auth, dashboards)
│       ├── App.js
│       └── index.js
└── server/                     # Express backend
    ├── models/
    │   ├── User.js             # User schema (name, email, password, role)
    │   └── Request.js          # Credentialing request schema
    ├── routes/
    │   ├── auth.js             # Register & login routes
    │   └── requests.js         # Submit & fetch request routes
    ├── index.js                # Main server entry point
    └── .env                    # Environment variables (not committed)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [npm](https://www.npmjs.com/) v8+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account and cluster

### Environment Variables

Create a `.env` file inside the `server/` directory with the following keys:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/healerfatim/QuadSolutions_Credentialing_Portal.git
   cd QuadSolutions_Credentialing_Portal
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server** (runs on `http://localhost:5000`)
   ```bash
   cd server
   node index.js
   ```

2. **Start the React frontend** (runs on `http://localhost:3000`)
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## API Reference

### Authentication

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/auth/register`   | Register a new user      |
| POST   | `/api/auth/login`      | Login and receive a JWT  |

### User — Requests

| Method | Endpoint                      | Description                         |
|--------|-------------------------------|-------------------------------------|
| POST   | `/api/requests/submit`        | Submit a credentialing application  |
| GET    | `/api/requests/user/:id`      | Get all requests for a specific user|

### User — Support

| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| POST   | `/api/support/ticket`   | Submit a support ticket   |

### Admin

| Method | Endpoint                    | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/api/admin/dashboard`      | Get all requests and summary statistics  |
| PUT    | `/api/admin/status/:id`     | Update the status of a request           |

---

## User Roles

| Role    | Access Level                                             |
|---------|----------------------------------------------------------|
| `user`  | Register, login, submit applications, track status, open support tickets |
| `admin` | View all requests, approve or reject applications, view dashboard statistics |

> **Note:** Admin access is available via the *Internal Admin Access* button on the landing page.

---

## Application Screens

| Screen              | Description                                                      |
|---------------------|------------------------------------------------------------------|
| Landing             | Entry page with options for new providers and existing clients   |
| Register            | New provider account creation form                               |
| Login               | Existing client / admin sign-in form                             |
| User Dashboard      | Service catalog and application tracking tabs                    |
| Admin Control Panel | Stats cards and full request moderation table                    |

---

## License

This project is proprietary software developed by **QuadSolutions**. All rights reserved.
