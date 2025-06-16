# Fintech-Digital-Wallet-System-PayFlow-

A secure and scalable digital wallet backend built with Node.js, Express, and MongoDB. It supports JWT authentication, wallet-to-wallet transfers, transaction history, automated recurring payments, and multi-currency handling—ideal for modern fintech platforms or payment apps.

## ✨ Features

- 🔐 Secure user authentication with JWT
- 👛 Automatic wallet creation on registration
- 💸 Wallet-to-wallet transfers
- 📥 Fund deposits and withdrawals
- 📜 Transaction history with contextual formatting
- 🔁 Recurring scheduled payments (daily, weekly, monthly)
- 🌍 Multi-currency support (configurable)
- 📧 Email notifications for financial activity
- 🛡️ Middleware-protected routes
- 🧩 Modular MVCR architecture

## 🧰 Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for REST APIs
- **MongoDB** – NoSQL database for storing users, wallets, and transactions
- **Mongoose** – ODM for MongoDB schemas and queries
- **JSON Web Tokens (JWT)** – Authentication and session management
- **bcrypt** – Secure password hashing
- **nodemailer** – Email service for transaction alerts
- **node-cron** – Background task scheduler for recurring payments
- **dotenv** – Environment variable management

## 🗂️ Folder Structure

/fintech-wallet-api │ ├── /config # Database connection & app config ├── /controllers # Business logic for users, wallets, payments ├── /middleware # Authentication middleware ├── /models # Mongoose schemas for User, Wallet, Transaction, etc. ├── /routes # Express route definitions ├── /utils # Helper functions (email, currency conversion, cron jobs) ├── .env # Environment variables ├── index.js # Application entry point └── package.json # App metadata and dependencies

> This modular architecture makes the app easy to scale, test, and maintain.

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- Optional: [Postman](https://www.postman.com/) for testing APIs

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/yourusername/fincore-wallet-api.git
cd fincore-wallet-api

2. **Install dependencies**
npm install

3. **Configure your environment**
```Create a .env file in the root directory and add:
PORT=1000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

4. **Start the app**
npm run dev

## 📬 API Endpoints

> All protected routes require a Bearer token in the Authorization header.

### 👤 User Routes
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| POST   | /api/users/register  | Register a new user       |
| POST   | /api/users/login     | Log in and receive tokens |
| GET    | /api/transactions     | View transaction history |

### 👛 Wallet Routes
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | /api/wallet/balance   | View wallet balance            |
| POST   | /api/wallet/deposit   | Add funds to your wallet       |
| POST   | /api/wallet/withdraw  | Withdraw funds                 |
| POST   | /api/wallet/transfer  | Transfer funds to another user |

### 🔁 Recurring Payment Routes
| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| POST   | /api/payments/schedule       | Schedule a recurring payment      |
| GET    | /api/payments/schedule       | List all active schedules         |
| DELETE | /api/payments/schedule/:id   | Cancel a scheduled payment        |

## Example requests/responses

### 👤 Auth Routes

1. **Register a User**
POST /api/users/register
Content-Type: application/json

{
  "username": "salma",
  "email": "salma@example.com",
  "password": "securePass123"
}
✅ Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

2. **Login**
POST /api/users/login
Content-Type: application/json

{
  "email": "salma@example.com",
  "password": "securePass123"
}
✅ Response:
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "username": "salma",
    "email": "salma@example.com"
  }
}

3 **📜 Transaction History**
GET /api/transactions
Authorization: Bearer <accessToken>
✅ Response:
[
  {
    "amount": 200,
    "type": "debit",
    "otherParty": "JohnDoe",
    "timestamp": "2025-06-13T09:32:00Z"
  },
  {
    "amount": 1000,
    "type": "credit",
    "otherParty": "System",
    "timestamp": "2025-06-10T14:20:00Z"
  }
]

### 👛 Wallet Routes

1. **Deposit Funds**
POST /api/wallet/deposit
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "amount": 1000
}
✅ Response:
{
  "message": "Deposit successful",
  "balance": 2000
}

2. **Withdraw Funds**
POST /api/wallet/withdraw
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "amount": 500
}
✅ Response:
{
  "message": "Withdrawal successful",
  "balance": 1500
}

3. **Transfer Funds**
POST /api/wallet/transfer
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverWalletId": "643a0c1fbcf34e29bd9e57c0",
  "amount": 200
}
✅ Response:
{
  "message": "Transaction successful",
  "transaction": {
    "_id": "...",
    "amount": 200,
    "type": "debit",
    "timestamp": "2025-06-13T09:32:00Z"
  }
}

. **View Balance**
GET /api/wallet/balance
Authorization: Bearer <accessToken>
Content-Type: application/json
✅ Response:
{
  "balance": 1300
}

### 🔁 Scheduled Payment Routes

1. **Create a Scheduled Payment**
POST /api/payments/schedule
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverWalletId": "643a0c1fbcf34e29bd9e57c0",
  "amount": 100,
  "frequency": "weekly",
  "startDate": "2025-06-14"
}
✅ Response:
{
  "message": "Scheduled payment created",
  "scheduled": {
    "_id": "6641d02ec497f4726bd4fe55",
    "userId": "...",
    "receiverWalletId": "643a0c1fbcf34e29bd9e57c0",
    "amount": 100,
    "frequency": "weekly",
    "nextPaymentDate": "2025-06-14T00:00:00.000Z"
  }
}

2. **View All Scheduled Payments**
GET /api/payments/schedule
Authorization: Bearer <accessToken>
✅ Response:
{
  "count": 2,
  "schedules": [
    {
      "_id": "6641d02ec497f4726bd4fe55",
      "receiverWalletId": "643a0c1fbcf34e29bd9e57c0",
      "amount": 100,
      "frequency": "weekly",
      "nextPaymentDate": "2025-06-14T00:00:00.000Z"
    }
  ]
}

3. **Cancel a Scheduled Payment**
DELETE /api/payments/schedule/6641d02ec497f4726bd4fe55
Authorization: Bearer <accessToken>
✅ Response:
{
  "message": "Scheduled payment canceled"
}

## 📖 API Documentation

For detailed API endpoints and test requests, visit the Postman collection:

🔗 **Postman Documentation:** [Your API Collection Link]([https://your-postman-link-here](https://documenter.getpostman.com/view/44539199/2sB2x6msZS))

## 🙌 Acknowledgments

- I thank God for everything.
- I appreciate my parents for supporting me.
- My deepest gratitude to **Mr. David Samson**, whose mentorship made this project possible.
- Huge thanks to the entire **CareerEx team** for providing the platform and opportunity to learn, grow, and build this app.
- Inspired by the open-source fintech community.
- Special shoutout to contributors of Node.js, Express, MongoDB, and all the amazing libraries used.
- And of course, props to my AI sidekick Copilot—for the coffee-fueled, bug-squashing brainstorming sessions. 💙










