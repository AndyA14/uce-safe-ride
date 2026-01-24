💻 UCE Safe Ride - Student Web Portal

The Student Web Portal is the client-side interface of the UCE Safe Ride ecosystem. Built with modern web technologies, it provides a fast, accessible, and adaptive experience for students to request rides, track drivers in real-time, and manage their safety preferences.

🚀 Overview

This application serves as the main entry point for students, connecting to the backend microservices via REST APIs and WebSockets to offer:

Interactive Maps: Real-time visualization of routes and driver locations.

Trip Management: An intuitive interface for booking, canceling, and tracking trips.

Responsive Design: Optimized for both mobile devices and desktop use within the campus.

High Performance: Powered by Vite and Bun for ultra-fast development and build times.

🛠 Tech Stack

Based on the project setup:

Category	Technology	Use
Framework	React (v18+)	Component-based UI architecture.
Language	TypeScript	Static typing for robust code.
Build Tool	Vite	Next-gen frontend bundler.
Runtime / PM	Bun	Fast runtime and package manager (bun.lockb).
Styling	Tailwind CSS	Utility-first CSS framework.
UI Library	Shadcn/ui	Reusable components (components.json).
Deployment	Docker + Nginx	Containerized production deployment (nginx.conf).
Linting	ESLint	Code consistency and error checking.
📂 Project Structure

The directory structure follows a scalable standard for React projects:

frontend/web-student/
├── public/             # Static files (favicons, manifest)
├── src/                # Source code
│   ├── components/     # Reusable components (buttons, inputs)
│   ├── pages/          # Route-based views (Login, Home, RideRequest)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service integrations (Axios/Fetch)
│   └── utils/          # Helper functions and constants
├── .env                # Environment variables (API URLs)
├── docker-entrypoint.sh # Container entrypoint script
├── nginx.conf          # Nginx configuration for production
├── tailwind.config.ts  # Tailwind theme configuration
├── vite.config.ts      # Vite bundler configuration
└── bun.lockb           # Bun lock file for dependency versions

⚡ Getting Started
Prerequisites

Bun (v1.0 or higher): Recommended due to the presence of the bun.lockb file.

Docker (Optional, for containerized testing).

Installation

Navigate to the frontend directory:

cd frontend/web-student


Install dependencies using Bun:

bun install


Configure environment variables:
Create a .env file (or duplicate the .env.example if available) and set the backend URLs:

VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws

Development Server

Start the development server with hot-reloading:

bun dev


The application will be available at http://localhost:5173
.

🐳 Docker Deployment

The project includes a production-ready Docker setup with a multi-stage build process using Nginx.

Build and run:

Build the image:

docker build -t uce-safe-ride-student .


Run the container:

docker run -p 3000:80 uce-safe-ride-student


The application will use nginx.conf to serve static assets and handle routing (SPA fallback). The docker-entrypoint.sh script handles the injection of environment variables at runtime if configured.

🧪 Scripts

The following standard scripts are defined in package.json:

bun dev: Starts the development server.

bun run build: Compiles the TypeScript code to production assets in dist/.

bun run lint: Runs ESLint to check for code quality issues.

bun run preview: Preview the production build locally.

🤝 Contributing

UI Components: When adding new UI elements, use the components/ui folder if you're using Shadcn.

State Management: Keep state local when possible; use Context API or Zustand for global state.

Responsiveness: Always test layouts in mobile views using Chrome DevTools.

📄 License

This is an internal university project.
All rights reserved © 2025.