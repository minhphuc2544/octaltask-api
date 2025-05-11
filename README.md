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
└── README.md
```

## 🏨 Microservice Architecture
<image src="./microservice_architecture.svg"></image>

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Docker (optional, for running services in containers)

### Preparation

Prepare a `.env` file looks like this and place it in the root folder (`octaltask-api`):
```env
# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=<mail-address>
MAIL_PASSWORD=<mail-app-password>
MAIL_FROM=<mail-from>

# Database Configuration
DB_TYPE=<database-type>
DB_HOST=<database-host>
DB_PORT=<database-port>
DB_USERNAME=<database-username>
DB_PASSWORD=<database-password>
DB_DATABASE=<database-name>

# JWT Token Configuration
JWT_SECRET=<jwt-secret>
TOKEN_EXPIRE_TIME=<token-expire-time>

# Config the server's port
SERVER_PORT=3000
```

### Installation

Install dependencies for the project:

```bash
cd octaltask-api
npm install
```

### Running Services

Run each service separately in ***its own terminal window***:
1. `auth-service`
    ```bash
    cd auth-service
    npm run build
    npm run start
    ```
2. `task-service`
    ```bash
    cd auth-service
    npm run build
    npm run start
    ```
3. `user-service`
    ```bash
    cd user-service
    npm run build
    npm run start
    ```
4. `team-service`
    ```bash
    cd team-service
    npm run build
    npm run start
    ```
5. `file-service`
    ```bash
    cd file-service
    npm run build
    npm run start
    ```

### Running the API Gateway

```bash
cd api-gateway
npm run build
npm run start
```
- The API will be available at http://localhost:3000
- The API Documentation will be available at http://localhost:3000/api
- The API Gateway will expose HTTP endpoints and forward them to microservices via gRPC.

## 📦 Proto Files

The `.proto` files for gRPC are stored in the `octaltask-api/**/src/proto` directory and should be kept in sync across services.

## 🔧 Tech Stack

- **NestJS**: Progressive Node.js framework
- **gRPC**: High-performance RPC framework
- **Protocol Buffers**: Language-neutral serialization
- **TypeScript**: Static typing for better maintainability

## Credits
Contributors:
- Tran Dong Truc Lam  (Student ID: 22520746)  
Github link: [limelight-hub](https://github.com/limelight-hub)
- Le Ngoc Duy Linh (Student ID: 22520762)  
Github link: [YuilRin](https://github.com/YuilRin)
- Vo Tran Phi  (Student ID: 22521081)  
Github link: [votranphi](https://github.com/votranphi)
- Thai Kieu Phuong  (Student ID: 22521170)  
Github link: [kPhuong08](https://github.com/kPhuong08)