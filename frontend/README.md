# Electoral System - Frontend

This is the frontend application for the Electoral System group project. It provides the user interface for voters to cast their ballots and an admin dashboard to manage the election process. It is built using **Next.js** and **Tailwind CSS**.

## Features

- **Authentication System:** Secure login for users and administrators.
- **Voting Interface:** Clean and formal UI for voters to view candidates and cast votes securely.
- **Admin Dashboard:**
  - Manage user accounts (view, edit, delete).
  - Manage candidates (add, update, delete, including image display).
  - Global toggle to open or close the voting system.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Security:** React Turnstile (Cloudflare)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The frontend will run on **http://localhost:3001** (as configured in `package.json`).

### Environment Variables

If needed, create a `.env.local` file in the root of the `frontend` directory and add the necessary environment variables (e.g., API base URL, Turnstile site key).

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```
