# OctalTask API

This is a **NestJS microservices architecture** project using **gRPC** for communication between services. It follows a modular, scalable design pattern where each service is self-contained and communicates through protocol buffers.

## 🧱 Project Structure

```
octaltask-api
├── api-gateway         # Entry point for external requests (acts as gRPC client)
├── auth-service        # Handles authentication and JWT token management
├── file-service        # Manages file uploads/downloads
├── task-service        # Handles task creation and management
├── team-service        # Manages teams and team-related operations
├── user-service        # Manages user profiles and data
├── proto               # Shared .proto definitions for all services
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Docker (optional, for running services in containers)

### Installation

Install dependencies for all services:

```bash
npm install --workspaces
```

> Or manually:
```bash
cd api-gateway && npm install
cd ../auth-service && npm install
# ... repeat for all other services
```

### Running Services

Run each service separately in its own terminal window:

```bash
# Example
cd auth-service
npm run start:dev
```

> Do the same for all other services.

### Running the API Gateway

```bash
cd api-gateway
npm run start:dev
```

The API Gateway will expose HTTP endpoints and forward them to microservices via gRPC.

## 📦 Proto Files

The `.proto` files for gRPC are stored in the `proto/` directory and should be kept in sync across services.

## 🔧 Tech Stack

- **NestJS**: Progressive Node.js framework
- **gRPC**: High-performance RPC framework
- **Protocol Buffers**: Language-neutral serialization
- **TypeScript**: Static typing for better maintainability

## 📂 Workspace Support

This project supports a **monorepo** setup using tools like `tsconfig.build.json` for each service and common linting rules.