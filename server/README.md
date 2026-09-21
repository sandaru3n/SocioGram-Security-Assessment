# SocioGram - Backend ( Server Side)

This is the backend for a Social Media Platform, built with Node.js and Express, designed to support features such as user authentication, posts, comments, friend management, and more.

## Technologies Used

- Node.js

- Express.js

- MongoDB (with Mongoose)

- JSON Web Tokens (JWT) for authentication

- bcrypt for password hashing

- Multer and Multer GridFS Storage for file uploads

- CORS for handling cross-origin requests
- Helmet for setting HTTP headers securely

- Morgan for request logging

- GridFS-Stream for working with GridFS

## Features

- User authentication and authorization

- User profiles

- Friend management

- Posts, comments, and likes

- File uploads for user avatars and posts

- Secure password storage

- Middleware for route protection and error handling

## Getting Started

1. Clone the repository.

2. Install the required dependencies using `npm install`.

3. Set up your environment variables in a `.env` file.

4. Start the server using `npm start`.

5. The server will be running on `http://localhost:3001` by default. You can configure the port and other settings in the `.env` file.

## API Routes

• Authentication

- `POST /api/login`: Log in with valid credentials.

• Posts

- `GET /api/posts`: Retrieve a feed of posts.

- `GET /api/posts/:userId`: Retrieve posts for a specific user.

- `PATCH /api/posts/:id/like`: Like or unlike a post.

• Users

- `GET /api/users/:id`: Retrieve user profile information.

- `GET /api/users/:id/friends`: Retrieve a list of user's friends.

- `PATCH /api/users/:id/:friendId`: Add or remove friends.

• File Uploads

- `POST /api/upload`: Upload files, such as user avatars and post images.

Make sure to include authentication details, request and response formats, and any additional information that might be useful for other developers who want to use your API.

## Environment Variables

- `MONGO_URI`: MongoDB connection string

- `JWT_SECRET`: Secret key for JWT authentication

- `PORT`: Port for the server to listen on

- Other environment variables as needed
