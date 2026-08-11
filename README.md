# 🌾 Farm2Market

Farm2Market is a full-stack web-based marketplace that connects farmers directly with buyers, helping reduce dependency on intermediaries, improve price transparency, and provide farmers with better access to potential buyers.

The platform allows farmers to list their crops, while buyers can browse available products, place order requests, communicate with farmers, and track order status.

---

## ✨ Features

### 👨‍🌾 Farmer

- Register and securely log in
- Create and manage crop listings
- Upload crop images
- Specify crop quantity and price
- Accept or reject buyer order requests
- Track order status
- Communicate with buyers
- View crop price trends and analytics

### 🛒 Buyer

- Register and securely log in
- Browse available crop listings
- View crop details, price, and quantity
- Place order requests
- Track order status
- Communicate with farmers
- View market price information

### 📊 Analytics

- Crop price tracking
- Average price analysis
- Price trend visualization
- Demand-related insights
- Price history through price logs

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Separate farmer and buyer workflows
- Protected API routes
- Role-based dashboard access

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Axios
- React Router
- Chart.js / Recharts

### Backend

- Python
- Flask
- Flask-JWT-Extended
- Flask-SQLAlchemy
- Flask-CORS

### Database

- SQLite (Development)
- PostgreSQL (Production-ready)

### Other

- REST APIs
- JWT Authentication
- Image Uploads

---

## 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │      Users       │
                    │ Farmer / Buyer   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  React Frontend  │
                    │     + Vite       │
                    └────────┬─────────┘
                             │
                        REST APIs
                             │
                             ▼
                    ┌──────────────────┐
                    │  Flask Backend   │
                    │                  │
                    │ Authentication   │
                    │ Crop Management  │
                    │ Order Management │
                    │ Analytics        │
                    │ Messaging        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Database      │
                    │ SQLite/Postgres  │
                    └──────────────────┘
```

---

## 🔄 Application Workflow

### Farmer Workflow

```text
Farmer Registration/Login
          ↓
    Farmer Dashboard
          ↓
     Add Crop Listing
          ↓
 Buyer Places Order Request
          ↓
 Farmer Reviews Request
          ↓
   Accept / Reject
          ↓
    Order Processing
          ↓
       Completed
```

### Buyer Workflow

```text
Buyer Registration/Login
          ↓
     Buyer Dashboard
          ↓
   Browse Crop Listings
          ↓
    View Crop Details
          ↓
   Place Order Request
          ↓
 Farmer Accepts / Rejects
          ↓
    Track Order Status
```

---

## 📂 Project Structure

```text
Farm2Market/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── extensions/
│   ├── utils/
│   └── app.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   └── hooks/
│   │
│   └── package.json
│
├── uploads/
│
├── requirements.txt
└── README.md
```

---

## 🗄️ Database Design

The application uses a relational database to manage users, crops, orders, messages, and price history.

### Main Tables

| Table | Purpose |
|---|---|
| `users` | Stores farmer and buyer accounts |
| `crops` | Stores crop listings |
| `orders` | Stores buyer order requests and status |
| `messages` | Handles farmer-buyer communication |
| `price_logs` | Maintains crop price history |

---

## 🔌 REST API Modules

The backend provides REST APIs for different application modules.

```text
Authentication
      │
      ├── Register
      └── Login

Crops
      │
      ├── Create Listing
      ├── View Listings
      ├── Update Listing
      └── Delete Listing

Orders
      │
      ├── Create Order Request
      ├── View Orders
      ├── Accept / Reject
      └── Update Order Status

Analytics
      │
      ├── Average Prices
      ├── Price Trends
      └── Demand Information

Messages
      │
      ├── Send Message
      └── Retrieve Messages
```

---

## 🔐 Authentication Flow

Farm2Market uses JWT-based authentication for securing the application.

```text
User Login
    ↓
Flask Authentication API
    ↓
Credentials Validation
    ↓
JWT Token Generated
    ↓
Token Stored by Frontend
    ↓
Token Sent with Protected Requests
    ↓
Backend Validates Token
    ↓
Access Granted
```

Role-based authorization ensures that farmers and buyers can access only the functionality relevant to their roles.

---

## 📊 Crop & Order Management

Farmers can create crop listings containing information such as:

- Crop name
- Quantity
- Price
- Crop image
- Other relevant details

Buyers can submit order requests for available crops.

The order lifecycle follows:

```text
Pending
   ↓
Approved
   ↓
Completed
```

Farmers can accept or reject pending requests, while available crop quantities are validated and updated during order processing.

---

## 📈 Price Analytics

Farm2Market maintains price history whenever crop prices are updated.

This enables the application to provide:

- Average crop prices
- Historical price information
- Price trend visualization
- Market-related insights

Charts are displayed through the frontend to make the information easier to understand.

---

## 💬 Farmer-Buyer Communication

The platform provides order-related communication between farmers and buyers.

Users can exchange messages to discuss their transactions and coordinate the buying process.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Farm2Market.git
```

```bash
cd Farm2Market
```

---

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/macOS:**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🎯 Project Objectives

Farm2Market was developed to address common challenges in agricultural marketplaces by providing:

- Direct farmer-to-buyer interaction
- Reduced dependency on intermediaries
- Improved price transparency
- Digital crop listing and discovery
- Simplified order management
- Market price insights
- Secure role-based access

---

## 🔮 Future Improvements

- Online payment integration
- Real-time notifications
- Advanced demand prediction
- AI-based crop price prediction
- Location-based crop discovery
- Farmer verification
- Delivery and logistics tracking
- Mobile application
- Cloud deployment

---

## 📚 Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack web application development
- REST API development
- React.js frontend development
- Flask backend development
- JWT authentication
- Role-based authorization
- Relational database design
- CRUD operations
- API integration using Axios
- Data visualization
- Application architecture
- Frontend-backend integration

---

## 👨‍💻 Author

**Yogesh Patil**

Bachelor of Artificial Intelligence and Data Science

---

⭐ If you found this project interesting, consider giving the repository a star!
