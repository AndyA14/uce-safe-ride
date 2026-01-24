💻 UCE Safe Ride - Student Web PortalStudent Web Portal is the client-side interface of the UCE Safe Ride ecosystem. Built with modern web technologies, it provides a responsive, fast, and accessible experience for students to request rides, track drivers in real-time, and manage their safety preferences.🚀 OverviewThis application serves as the primary entry point for students. It connects to the backend microservices via REST APIs and WebSockets to deliver:Interactive Maps: Real-time visualization of routes and driver locations.Ride Management: Intuitive interface to book, cancel, and monitor trips.Responsive Design: Optimized for mobile and desktop usage within the campus.High Performance: Powered by Vite and Bun for ultra-fast development and build times.🛠 Tech StackBased on the project configuration:CategoryTechnologyUsageFrameworkReact (v18+)Component-based UI architecture.LanguageTypeScriptStatic typing for robust code quality.Build ToolViteNext-generation frontend tooling.Runtime / PMBunFast JavaScript runtime and package manager (bun.lockb).StylingTailwind CSSUtility-first CSS framework.UI LibraryShadcn/uiReusable components (components.json).DeploymentDocker + NginxContainerized production serving (nginx.conf).LintingESLintCode consistency and error checking.📂 Project StructureThe directory structure follows a standard scalable React pattern:Plaintextfrontend/web-student/
├── public/                   # Static assets (favicons, manifest)
├── src/                      # Source code
│   ├── components/           # Reusable UI components (buttons, inputs)
│   ├── pages/                # Route-based views (Login, Home, RideRequest)
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service integrations (Axios/Fetch)
│   └── utils/                # Helper functions and constants
├── .env                      # Environment variables (API URLs)
├── docker-entrypoint.sh      # Script for container initialization
├── nginx.conf                # Nginx configuration for production
├── tailwind.config.ts        # Tailwind theme configuration
├── vite.config.ts            # Vite bundler configuration
└── bun.lockb                 # Bun lockfile for dependency versions
⚡ Getting StartedPrerequisitesBun (v1.0 or higher) - Recommended due to bun.lockb presence.Docker (Optional, for containerized testing).InstallationNavigate to the frontend directory:Bashcd frontend/web-student
Install dependencies using Bun:Bashbun install
Configure environment variables:Create a .env file (or duplicate .env.example if available) and set your backend URL:Fragmento de códigoVITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
Development ServerStart the development server with hot-reload:Bashbun dev
The app will be available at http://localhost:5173.🐳 Docker DeploymentThe project includes a production-ready Docker setup using a multi-stage build process with Nginx.Build & RunBash# Build the image
docker build -t uce-safe-ride-student .

# Run the container
docker run -p 3000:80 uce-safe-ride-student
The application uses nginx.conf to serve static assets and handle routing (SPA fallback).The docker-entrypoint.sh script handles runtime environment variable injection if configured.🧪 ScriptsStandard scripts defined in package.json:bun dev: Starts the dev server.bun run build: Compiles the TypeScript code to production assets in dist/.bun run lint: Runs ESLint to check for code quality issues.bun run preview: Locally previews the production build.🤝 Contribution GuidelinesUI Components: When adding new UI elements, use the components/ui folder if using Shadcn.State Management: Keep state local when possible; use Context API or Zustand for global state.Responsiveness: Always test layouts on mobile viewports using Chrome DevTools.📄 LicenseInternal University Project.All rights reserved © 2025.