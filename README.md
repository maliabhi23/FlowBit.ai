# AI-Powered Invoice Analytics Dashboard

This project is a full-stack application for visualizing invoice data and querying it using natural language. It features an interactive dashboard, a "Chat with Data" interface powered by Groq AI, and a robust backend.

## ✨ Core Features

* **Interactive Dashboard:** Uses Recharts to display key metrics (total spend, average invoice value), top vendors, and category-wise spending.
* **AI-Powered Chat:** Leveres Groq (using the `llama-3.3-70b-versatile` model) and Vanna AI to translate natural language questions (e.g., "Top 5 vendors by spend?") into executable SQL queries.
* **Robust Backend:** A type-safe Node.js/Express API with Prisma ORM for handling data aggregation and standard requests.
* **AI Microservice:** A separate Python (FastAPI) service that interfaces with Groq to handle all natural language processing and SQL generation.
* **Monorepo Setup:** Uses `npm workspaces` and `Turborepo` to manage the frontend, backend, and AI service in a single repository.

## 🛠️ Tech Stack

| Area | Technology |
| :--- | :--- |
| **Frontend** | `Next.js 14`, `React`, `TypeScript`, `TailwindCSS`, `shadcn/ui`, `Recharts` |
| **Backend (API)** | `Node.js`, `Express.js`, `TypeScript`, `Prisma`, `PostgreSQL` |
| **AI Service** | `Python`, `FastAPI`, `Vanna AI`, `Groq` |

---

## 🏗️ Monorepo Structure
├── apps/ │ ├── web/ # Next.js 14 frontend │ └── api/ # Express.js backend ├── services/ │ └── vanna/ # Python FastAPI service (Groq AI) ├── data/ │ └── Analytics_Test_Data.json # Seed data ├── package.json # Monorepo root └── turbo.json # Turborepo config
---

## 🚀 Local Development Setup

### Prerequisites

* **Node.js** (v18+)
* **Python** (v3.11+)
* **PostgreSQL** (v15+)
* **Groq API Key:** (Get one from [Groq Console](https://console.groq.com/keys))

### Step 1: Install Dependencies

Clone the repository and install all dependencies from the root directory.

```bash
# Install root, web, and api dependencies
npm install

###Backend API (apps/api/.env

DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
PORT=3001
NODE_ENV=development
VANNA_SERVICE_URL=http://localhost:8000

###Frontend (apps/web/.env.local)
NEXT_PUBLIC_API_BASE=http://localhost:3001

###Vanna AI Service (services/vanna/.env)
DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
GROQ_API_KEY=your_groq_api_key_here
VANNA_PORT=8000
Here is the complete README.md file in a single block for you to copy and paste.

Markdown

# AI-Powered Invoice Analytics Dashboard

This project is a full-stack application for visualizing invoice data and querying it using natural language. It features an interactive dashboard, a "Chat with Data" interface powered by Groq AI, and a robust backend.

## ✨ Core Features

* **Interactive Dashboard:** Uses Recharts to display key metrics (total spend, average invoice value), top vendors, and category-wise spending.
* **AI-Powered Chat:** Leveres Groq (using the `llama-3.3-70b-versatile` model) and Vanna AI to translate natural language questions (e.g., "Top 5 vendors by spend?") into executable SQL queries.
* **Robust Backend:** A type-safe Node.js/Express API with Prisma ORM for handling data aggregation and standard requests.
* **AI Microservice:** A separate Python (FastAPI) service that interfaces with Groq to handle all natural language processing and SQL generation.
* **Monorepo Setup:** Uses `npm workspaces` and `Turborepo` to manage the frontend, backend, and AI service in a single repository.

## 🛠️ Tech Stack

| Area | Technology |
| :--- | :--- |
| **Monorepo** | `npm workspaces`, `Turborepo` |
| **Frontend** | `Next.js 14`, `React`, `TypeScript`, `TailwindCSS`, `shadcn/ui`, `Recharts` |
| **Backend (API)** | `Node.js`, `Express.js`, `TypeScript`, `Prisma`, `PostgreSQL` |
| **AI Service** | `Python`, `FastAPI`, `Vanna AI`, `Groq` |

---

## 🏗️ Monorepo Structure

. ├── apps/ │ ├── web/ # Next.js 14 frontend │ └── api/ # Express.js backend ├── services/ │ └── vanna/ # Python FastAPI service (Groq AI) ├── data/ │ └── Analytics_Test_Data.json # Seed data ├── package.json # Monorepo root └── turbo.json # Turborepo config


---

## 🚀 Local Development Setup

### Prerequisites

* **Node.js** (v18+)
* **Python** (v3.11+)
* **PostgreSQL** (v15+)
* **Groq API Key:** (Get one from [Groq Console](https://console.groq.com/keys))

### Step 1: Install Dependencies

Clone the repository and install all dependencies from the root directory.

```bash
# Install root, web, and api dependencies
npm install
Step 2: Set Up PostgreSQL
You need a running PostgreSQL database. You can install it locally or use a cloud-based provider.

Create a new database (e.g., flowbit_db).

Create a user and password (e.g., flowbit / flowbit_password).

Ensure the user has all privileges on the database.

Step 3: Configure Environment Variables
Create .env files for each service and add the required variables.

1. Backend API (apps/api/.env)

Ini, TOML

DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
PORT=3001
NODE_ENV=development
VANNA_SERVICE_URL=http://localhost:8000
2. Frontend (apps/web/.env.local)

Ini, TOML

NEXT_PUBLIC_API_BASE=http://localhost:3001
3. Vanna AI Service (services/vanna/.env)

Ini, TOML

DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
GROQ_API_KEY=your_groq_api_key_here
VANNA_PORT=8000

###Step 4: Set Up the Database

cd apps/api

# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Seed the database with sample data
npm run db:seed

Terminal 1: Start the Backend API (Express.js)
cd apps/api
npm run dev

Terminal 2: Start the Vanna AI Service (FastAPI)
cd services/vanna

# Install Python requirements
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000

Terminal 3: Start the Frontend (Next.js)
cd apps/web
npm run dev

Step 6: Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:3001

Vanna AI Service: http://localhost:8000
Here is the complete README.md file in a single block for you to copy and paste.

Markdown

# AI-Powered Invoice Analytics Dashboard

This project is a full-stack application for visualizing invoice data and querying it using natural language. It features an interactive dashboard, a "Chat with Data" interface powered by Groq AI, and a robust backend.

## ✨ Core Features

* **Interactive Dashboard:** Uses Recharts to display key metrics (total spend, average invoice value), top vendors, and category-wise spending.
* **AI-Powered Chat:** Leveres Groq (using the `llama-3.3-70b-versatile` model) and Vanna AI to translate natural language questions (e.g., "Top 5 vendors by spend?") into executable SQL queries.
* **Robust Backend:** A type-safe Node.js/Express API with Prisma ORM for handling data aggregation and standard requests.
* **AI Microservice:** A separate Python (FastAPI) service that interfaces with Groq to handle all natural language processing and SQL generation.
* **Monorepo Setup:** Uses `npm workspaces` and `Turborepo` to manage the frontend, backend, and AI service in a single repository.

## 🛠️ Tech Stack

| Area | Technology |
| :--- | :--- |
| **Monorepo** | `npm workspaces`, `Turborepo` |
| **Frontend** | `Next.js 14`, `React`, `TypeScript`, `TailwindCSS`, `shadcn/ui`, `Recharts` |
| **Backend (API)** | `Node.js`, `Express.js`, `TypeScript`, `Prisma`, `PostgreSQL` |
| **AI Service** | `Python`, `FastAPI`, `Vanna AI`, `Groq` |

---

## 🏗️ Monorepo Structure

. ├── apps/ │ ├── web/ # Next.js 14 frontend │ └── api/ # Express.js backend ├── services/ │ └── vanna/ # Python FastAPI service (Groq AI) ├── data/ │ └── Analytics_Test_Data.json # Seed data ├── package.json # Monorepo root └── turbo.json # Turborepo config


---

## 🚀 Local Development Setup

### Prerequisites

* **Node.js** (v18+)
* **Python** (v3.11+)
* **PostgreSQL** (v15+)
* **Groq API Key:** (Get one from [Groq Console](https://console.groq.com/keys))

### Step 1: Install Dependencies

Clone the repository and install all dependencies from the root directory.

```bash
# Install root, web, and api dependencies
npm install
Step 2: Set Up PostgreSQL
You need a running PostgreSQL database. You can install it locally or use a cloud-based provider.

Create a new database (e.g., flowbit_db).

Create a user and password (e.g., flowbit / flowbit_password).

Ensure the user has all privileges on the database.

Step 3: Configure Environment Variables
Create .env files for each service and add the required variables.

1. Backend API (apps/api/.env)

Ini, TOML

DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
PORT=3001
NODE_ENV=development
VANNA_SERVICE_URL=http://localhost:8000
2. Frontend (apps/web/.env.local)

Ini, TOML

NEXT_PUBLIC_API_BASE=http://localhost:3001
3. Vanna AI Service (services/vanna/.env)

Ini, TOML

DATABASE_URL=postgresql://flowbit:flowbit_password@localhost:5432/flowbit_db
GROQ_API_KEY=your_groq_api_key_here
VANNA_PORT=8000
Step 4: Set Up the Database
Navigate to the api directory to run Prisma commands to sync your schema and seed the database.

Bash

cd apps/api

# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Seed the database with sample data
npm run db:seed
Step 5: Start All Services
You will need to run each service in a separate terminal.

Terminal 1: Start the Backend API (Express.js)

Bash

cd apps/api
npm run dev
Terminal 2: Start the Vanna AI Service (FastAPI)

Bash

cd services/vanna

# Install Python requirements
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
Terminal 3: Start the Frontend (Next.js)

Bash

cd apps/web
npm run dev
Step 6: Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:3001

Vanna AI Service: http://localhost:8000

📊 Database Schema
The schema uses two main tables, Invoice and LineItem, with a one-to-many relationship.

Invoice → LineItem: One-to-Many

Foreign Key: LineItem.invoiceId references Invoice.id

🤖 AI Chat Workflow
The "Chat with Data" feature translates natural language into a database result.

User Query: The user asks a question in the frontend (e.g., "What's the total spend last month?").

Frontend to Backend: The Next.js app sends this query to the Express.js backend's /chat-with-data endpoint.

Backend to AI Service: The Express API acts as a proxy, forwarding the request to the Python FastAPI (Vanna) service.

SQL Generation (Groq): The FastAPI service uses the Vanna library to send the user's question and the database schema to the Groq API (llama-3.3-70b-versatile).

Database Execution: The FastAPI service receives the generated SQL, connects to the PostgreSQL database, and executes the query.

Response: The data is returned (along with the SQL query) through the chain, back to the frontend, where it's displayed to the user.

