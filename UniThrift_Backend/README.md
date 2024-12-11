# UniThrift : University Buy-Sell Application
## Introduction
UniThrift is a platform created to support university students in addressing rising living and educational expenses. By offering an affordable and sustainable way to buy essential items from fellow students, UniThrift promotes second-hand shopping, which aligns with the growing trends of sustainability and minimalism. This student-exclusive marketplace allows users to resell books, electronics, furniture, and other items, fostering community connections while encouraging eco-friendly practices on university campuses.

By focusing on a **secure**, **user-friendly**, and **sustainable** shopping experience, UniThrift streamlines buying and selling among verified students, ensuring smooth transactions and trust within the campus community. Its backend, powered by **FastAPI** and **MongoDB**, delivers a reliable and scalable infrastructure hosted on **AWS**. APIs are accessible via **Swagger** and **Postman**, facilitating seamless integration and testing. Key features include real-time sales queues, transaction history tracking, and admin analytics for a better user experience.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB

### Hosting
- **Cloud Provider**: AWS
  - EC2 for backend hosting
  - S3 for static files and media storage

### Containerization
- **Docker**: The application can be containerized for ease of deployment using Docker.

### API Testing
- **Swagger UI**: Integrated for live API documentation and testing.
- **Postman**: Supported for advanced API testing.

---

## Features
### 1. User Management

UniThrift supports two types of users: **Admin** and **Student**, each with distinct login credentials and features tailored to their roles:

#### 1. **Admin Features**
- **User Management**: Ability to manage student accounts, including verifying new users and handling reported issues.
- **Analytics and Insights**: Access to platform analytics, including sales trends, top-selling categories, revenue trends over months and overall user engagement.
- **Moderation Tools**: Add, edit or delete item categories, flag inappropriate listings or delete them helping resolve disputes to maintain a safe environment.

#### 2. **Student Features**
- **Secure Login**: Students are verified during sign up to ensure a trusted community of users.
- **Listing Creation**: Easily post items for sale, complete with images, description, and price.
- **Queue Management**: Mark interest with their comments posted to the seller in a real-time queueing system. Share contact details for sale or reject the buyer if not interested.
- **Transaction History**: Track all previous transactions for future reference.

### 2. **Buy-Sell Module**
The heart of UniThrift, this module facilitates the buying and selling of second-hand goods within the university community.
- **Listing Creation**: Students can create detailed listings for items they wish to sell, including images, descriptions, and price.
- **My Listings**: Sellers can access the listings they have posted, edit them, or interact with potential buyers.
- **Secure Interactions**: All buy sell interactions occur within a verified community of University students, reducing risks and ensuring trust.
- **Item Categories**: Accessed only by Admin users to add, edit or delete broad categories of items like books, electronics, furniture, and more.

### 3. **Queueing Module**
Designed for high-demand items, the queueing module ensures fairness in transactions.
- **Mark Interest**: Buyers express interest in an item by joining a queue, ensuring a fair chance for all.
- **Real-Time Queues**: Buyers are placed in a queue for the listings they are interested in, listed based on the time interest was expressed.
- **Notifications**: Users receive updates when the seller shares their contact details with them. With the seller details, buyer and sellers can carry on the sale offline. Seller can reject the buyer if they are not interested in selling to them and the buyer will be removed from the queue updating the status to the buyer.
- **Progress tracking**: The seller can then mark the item as sold completing the transaction, so that the item is no more available for sale.

### 4. **History Tracking Module**
This module allows users to view a complete sales on the platform.
- **My Listings history**: Students can review all the items they have sold, including details like price, buyer, and date of sale.
- **Items bought history**: Students can view all the items they have purchased, including details like price, seller, and date of purchase.

### 5. **Admin Analytics Module**
Empowering admins to monitor and manage platform activity effectively.
- **Sales Insights**: Visualizations of sale trends, item categories, and popular listings.
- **Revenue Tracking**: Monthly revenue trends over months and total revenue generated.

---


## Installation

### Prerequisites
- Python 3.8 or higher
- MongoDB installed locally or a MongoDB Atlas connection string.
- AWS account (for EC2 and S3 integration)
- Docker installed (if using containerization)


## Configuration
### 1. **Environment Setup**
- **Python Version**: Python 3.8 or later is recommended. Ensure that Python is installed on your system.
- **Virtual Environment**: Use a virtual environment to isolate dependencies for the project.
  ```bash
  python -m venv env
  source env/bin/activate  # For Linux/Mac
  .\env\Scripts\activate  # For Windows
  ```

### 2. **Install Dependencies**: Install the required packages using pip.
  ```bash
  pip install -r requirements.txt
  ```

### 3. **Environment variables and MongoDB Setup**
Create a new .env file in the root directory and add the following environment variables:
```bash
MONGO_URI=                # MongoDB connection string
AWS_REGION=               # AWS region
AWS_ACCESS_ID=            # AWS access key
AWS_SECRET_KEY=           # AWS secret key
AWS_STORAGE_BUCKET=       # AWS S3 bucket name
AUTH_SERVICE_BASE_URL=https://127.0.0.1:8000/api/v1
SENDGRID_API_KEY=         # Sendgrid API key
EMAIL_SENDER=             # Sender email address
```

### 4. **Run the Application**
- **Development Server**: Run the FastAPI development server using the following command:
```bash
uvicorn app.main:app --reload
```

### 5. **Containerization with Docker**
- UniThrift can be containerized for simplified deployment. Below are the details of the required Docker files.
- Dockerfile
```bash
# Use a smaller base image
FROM python:3.10-slim AS builder

WORKDIR /code

# Don't write bytecode to disk to prevent `.pyc` files
ENV PYTHONDONTWRITEBYTECODE 1

# Don't store pip cache
ENV PIP_NO_CACHE_DIR=off

# Install gcc and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc

COPY ./requirements.txt /code/requirements.txt

# Install requirements and remove unnecessary files
RUN pip install --no-cache-dir -r /code/requirements.txt

# Multi-stage build
FROM python:3.10-slim

WORKDIR /code

# Copy the entire Python install directory from the previous stage
COPY --from=builder /usr/local /usr/local

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--proxy-headers", "--host", "0.0.0.0", "--workers", "1", "--timeout-keep-alive", "5", "--timeout-graceful-shutdown", "15", "--port", "4000"]
# Other settings
# "--limit-max-requests", "1000"
# Alternate way to use dynamic port from environment variable
# CMD uvicorn app.main:app --proxy-headers --host 0.0.0.0 --port $PORT
```

- docker-compose.yml
```bash
version: '3.4'

services:
  fastapi_backend:
    image: fastapi_backend
    build:
      context: .
      dockerfile: ./Dockerfile
    volumes:
      - ../docker_container_logs:/code/logs
    ports:
      - 4001:4000

    env_file: .env
    logging:
      driver: local
      options:
        mode: "non-blocking"
        max-buffer-size: "2m"
        max-size: "10m"
        max-file: "3"

    restart: always
```
- **Running the Application with Docker**
  - Build and run the application:
```bash
docker-compose up --build
```
  - Access the application from Swagger UI: http://localhost:8000/docs

### 6. Testing the Application
- **Swagger UI**: Access the Swagger UI at `http://localhost:8000/docs` to test the API endpoints.
- **Postman**: Access the API endpoints by using above local URL or the deployed URL at `http://18.117.164.164:4001/docs#/`
- **Pytest**: Unit test for each module have been developed using `pytest` library. These can be run by simply running the following command in the app directory.
```bash
pytest
```

## Dataset
UniThrift utilizes a **master table(universities)** containing information for all participating universities. This dataset is used in creation of new user including Student and Admin. No additional external or third-party master datasets are used.


## AI Models
Currently, **UniThrift does not integrate any AI or machine learning models**. Future enhancements may explore AI for recommendations and user insights, but the platform presently relies on robust deterministic processes.
