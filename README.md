# Notification Service

A robust notification service that handles email and SMS notifications using Kafka for message queuing. This service provides a scalable and reliable way to send notifications to users through multiple channels.

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Add your license here] 