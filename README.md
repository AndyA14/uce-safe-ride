🚕 UCE Safe Ride - Secure Campus Mobility Platform
UCE Safe Ride is a modern, distributed transportation platform designed to ensure safe, efficient, and real-time movement for the university community. It connects the institutional fleet with students and faculty, optimizing routes and prioritizing passenger safety through advanced telemetry.

🛡️ What is UCE Safe Ride?
UCE Safe Ride is a distributed microservices-based system that transforms the way the university community moves. Unlike traditional transportation, our platform offers:

Intelligent Fleet Management: Drivers are paired with specific vehicles and active routes in real-time.

Secure Access: Strict validation using university credentials to ensure all passengers are verified members of the community.

Live Telemetry: Real-time tracking of vehicle location via WebSockets and Kafka for high-frequency updates.

Smart Alerts: Integrated notifications for traffic anomalies, route detours, and arrival estimates.

The platform leverages cloud-native technologies and geospatial services to ensure high availability, low latency, and a secure environment for all users.

🎯 Objectives

Improve Student Safety: Create a reliable network where each unit and passenger is monitored.

Optimize Mobility: Reduce uncertainty by providing accurate ETAs and real-time location of vehicles.

Sustainability: Promote the use of institutional collective transport to reduce the carbon footprint.

Technical Excellence: Demonstrate a scalable, fault-tolerant architecture capable of handling traffic spikes using event-driven patterns.

🔍 Key Features

For Students (Passenger App)

Live Geolocation: View active units moving on the map in real-time with smooth animations.

Route Discovery: Filter visible units by specific routes (e.g., "North Route," "Valleys Route").

Digital Boarding: "Check-in" function to register presence on the vehicle.

Rich Notifications: Floating alerts for service status, traffic incidents, and arrival notices.

For Drivers (Driver App)

Trip Management: Easy setup of Vehicle + Route to start broadcasting.

Passenger Counter: Real-time visibility of boarded students.

Incident Reporting: One-touch alert to notify control center and students about delays or issues.

📚 Tech Stack
The project uses a robust, polyglot technology stack optimized for performance and scalability:

Frontend (Web & Mobile)

Framework: React + Vite (TypeScript)

Styling: Tailwind CSS + ShadcnUI

Maps: Google Maps JavaScript API

State: Context API + Custom Hooks

Backend (Microservices)

Language: Python 3.11+

Framework: FastAPI

Gateway: WebSocket Gateway (Custom implementation)

Data & Messaging (Core)

Event Streaming: Apache Kafka (Real-time telemetry)

Message Broker: RabbitMQ (Asynchronous tasks and service communication)

Caching: Redis (Session cache and live location)

Databases: PostgreSQL (Relational data), MongoDB (Logs/History)

DevOps & Infrastructure

Containerization: Docker & Docker Compose

IaC: Terraform

Cloud Provider: AWS (EC2, RDS, EKS ready)

CI/CD: GitHub Actions (Automated build and deployment)

🌎 Who are the beneficiaries?

University Students: Seeking reliable transportation with predictable schedules.

Transport Operators: Needing modern tools to manage their routes and communicate with passengers.

University Administration: For monitoring fleet usage and improving campus safety.

Developers: As a reference implementation of a distributed geospatial system.

📄 License
This project was developed as part of the Distributed Systems course at the Central University of Ecuador.
All rights reserved © 2026.