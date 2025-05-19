# Notification Service
An internship task
Note-I am not able to deployed it because of the kafka 
The sms service i have choosen is of twillo so it is trial that is why showing these type of message

## Screenshots

### User Creation
![User Creation](assets/image%20(7).png)

### Notification Sending
![Notification Sending](assets/image%20(8).png)

### User List
![User List](assets/image%20(9).png)

### Notification History
![Notification History](assets/image%20(10).png)

### Kafka Setup
![Kafka Setup](assets/WhatsApp%20Image%202025-05-19%20at%209.16.23%20AM%20(1).jpeg)

## Features

- Email notifications
- SMS notifications
- Kafka message queuing for reliable delivery
- User management
- Notification history tracking
- RESTful API endpoints

## Prerequisites

- Node.js
- PostgreSQL
- Kafka (running on localhost:9092)
- Prisma ORM

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

## Running with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Build the Docker image:
   ```bash
   docker build -t notification-service .
   ```

3. Run the Docker container:
   ```bash
   docker run -p 3000:3000 notification-service
   ```

4. The application will be available at http://localhost:3000.

## API Endpoints

### User Management

- `POST /user`
  - Create a new user
  - Required fields: email, Name, Mobile_No
  - Returns: Created user object

### Notifications

- `POST /notifications`
  - Send a notification to a specific user
  - Required fields: id (user ID), data (notification content)
  - Returns: Success message

- `GET /not`
  - Get all users
  - Returns: List of all users

- `GET /notification/:id`
  - Get all notifications for a specific user
  - Required: user ID as URL parameter
  - Returns: List of notifications for the user

## Architecture

The service uses a message queue architecture with Kafka:

1. When a notification is requested, it's sent to a Kafka topic
2. A consumer processes the message and:
   - Sends email notification
   - Sends SMS notification
   - Stores the notification in the database
3. If processing fails, the message is requeued for retry

## Error Handling

- Failed notifications are automatically requeued
- Input validation for all endpoints
- Proper error responses with status codes

## Database Schema

The service uses Prisma with the following main models:
- User (email, Name, Mobile_No)
- Notification (Content, user_id)

