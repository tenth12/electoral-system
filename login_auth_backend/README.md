# Electoral System - Backend

This is the backend service for the Electoral System group project. It serves as the core API, handling business logic, database operations, and authentication for the application. It is built using the **NestJS** framework and **MongoDB**.

## Features

- **RESTful API:** Provides endpoints for the frontend application.
- **Authentication & Authorization:** Implemented using Passport and JWT tokens. Passwords are securely hashed with Argon2.
- **User Management:** CRUD operations for voters and administrators.
- **Candidate Management:** Endpoints to manage election candidates, including image data.
- **Voting System Logic:** Securely handles vote casting and vote counting.
- **Voting Status Control:** Allows admins to toggle the voting period (open/close).

## Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** MongoDB
- **ODM:** Mongoose
- **Language:** TypeScript
- **Authentication:** Passport, JWT, Argon2

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed and a running instance of **MongoDB** (local or Atlas).

### Installation

1. Navigate to the backend directory:
   ```bash
   cd login_auth_backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root of the `login_auth_backend` directory based on your configuration:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/electoral_system
JWT_SECRET=your_jwt_secret_key
```

### Running the Application

```bash
# development mode
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

The backend server will typically run on **http://localhost:3000**.

### Project Structure (NestJS)

- `src/` - Contains the application source code (Controllers, Services, Modules).
- `src/main.ts` - The entry file of the application.
