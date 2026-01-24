🚕 UCE Safe Ride - Secure Campus Mobility Platform
UCE Safe Ride is a modern, distributed transportation platform designed to ensure safe, efficient, and real-time commuting for the university community. It connects the institutional transport fleet with students and faculty, optimizing routes and prioritizing passenger safety through advanced telemetry.

🛡️ What is UCE Safe Ride?
UCE Safe Ride is a distributed system based on microservices that transforms how the university community moves. Unlike traditional transport, our platform offers:

Intelligent Fleet Management: Drivers associate with specific vehicles and active routes in real-time.

Secure Access: Strict validation using University credentials to ensure all passengers are verified community members.

Live Telemetry: Real-time location tracking using WebSockets and Kafka for high-frequency updates.

Smart Alerts: Integrated notifications for traffic anomalies, route deviations, and arrival estimates.

The platform leverages cloud-native technologies and geospatial services to ensure high availability, low latency, and a secure environment for all users.

🎯 Objectives
Enhance Student Safety: Create a trusted network where every unit and passenger is monitored.

Optimize Mobility: Reduce uncertainty by providing accurate ETAs and live bus positions.

Sustainability: Promote the use of collective institutional transport to lower the carbon footprint.

Technical Excellence: Demonstrate a scalable, fault-tolerant architecture capable of handling peak traffic hours using event-driven patterns.

🔍 Key Features
For Students (Passenger App)
Live Geolocation: View active units moving on the map in real-time with smooth animations.

Route Discovery: Filter visible units by specific routes (e.g., "Ruta Norte", "Ruta Valles").

Digital Boarding: "Check-in" feature to register presence on the unit.

Rich Notifications: Floating alerts for service status, traffic incidents, and arrival notices.

For Drivers (Driver App)
Trip Management: Easy configuration of Vehicle + Route to start broadcasting.

Passenger Counter: Real-time visibility of onboarded students.

Incident Reporting: One-tap alerts to notify the control center and students of delays or issues.

📚 Tech Stack
The project utilizes a robust, polyglot tech stack optimized for performance and scalability:

Frontend (Web & Mobile)
Framework: React + Vite (TypeScript)

Styling: Tailwind CSS + ShadcnUI

Maps: Google Maps Javascript API

State: Context API + Custom Hooks

Backend (Microservices)
Language: Python 3.11+

Framework: FastAPI

Gateway: WebSocket Gateway (Custom implementation)

Data & Messaging (The Core)
Event Streaming: Apache Kafka (Real-time telemetry)

Message Broker: RabbitMQ (Async tasks & inter-service comms)

Caching: Redis (Session & Live location cache)

Databases: PostgreSQL (Relational data), MongoDB (Logs/History)

DevOps & Infrastructure
Containerization: Docker & Docker Compose

IaC: Terraform

Cloud Provider: AWS (EC2, RDS, EKS ready)

CI/CD: GitHub Actions (Automated Build & Push)

🌎 Who is it for?
University Students: Seeking reliable transport with predictable schedules.

Transport Operators: Needing modern tools to manage their routes and communicate with passengers.

University Administration: To monitor fleet usage and enhance campus security.

Developers: As a reference implementation of a geospatial distributed system.

📄 License
This project was developed as part of the Distributed Systems academic course at Universidad Central del Ecuador. All rights reserved © 2026.