# MERN SocioGram - Soical Media Platform

This is a full-stack social media application built using the MERN (MongoDB, Express.js, React, Node.js) stack. It provides various features commonly found in social media platforms.

## Features

### User Authentication

- **Registration**: Users can create accounts with unique usernames and passwords.

- **Login**: Registered users can log in to their accounts.

- **Authentication**: Token-based authentication is used to secure routes.

### User Profiles

- **View Profiles**: Users can view their own and others' profiles.

- **Profile Picture**: Users can upload and update their profile pictures.

- **Friend List**: Users can view their friends' list.

### Posts

- **Create Posts**: Users can create and publish posts with text and images.

- **Like Posts**: Users can like and unlike posts.

- **View Posts**: Users can view a feed of posts from friends.

### Friendships

- **Add Friends**: Users can send friend requests to others.

- **Accept/Reject Requests**: Users can accept or reject friend requests.

- **Remove Friends**: Users can remove friends from their friend list.

### Dark and Light Mode

- **Toggle Mode**: Users can switch between dark and light mode.

## Technologies Used

### Frontend

- **React**: The user interface is built using React.

- **Redux**: State management is handled with Redux.

- **Material-UI**: Material-UI components provide the UI.

- **React Router**: Used for client-side routing.

- **Axios**: Used for making API requests.

### Backend

- **Node.js**: The server is built with Node.js.

- **Express.js**: The Express.js framework is used for API routing.

- **MongoDB**: Data is stored in a MongoDB database.

- **Mongoose**: Mongoose is used as an Object Data Modeling (ODM) library for MongoDB.

- **JWT**: JSON Web Tokens are used for user authentication.

- **bcrypt**: Used for password hashing.

- **Multer**: Handles file uploads.

## Installation

### Frontend

1. Clone the repository.

2. Navigate to the `frontend` directory.

3. Run `npm install` to install dependencies.

4. Create a `.env` file with your backend API URL (e.g., `REACT_APP_API_URL=http://localhost:3001`).

5. Run `npm start` to start the frontend server.

### Backend

1. Clone the repository.

2. Navigate to the `backend` directory.

3. Run `npm install` to install dependencies.

4. Create a `.env` file with your MongoDB URI, JWT secret, and other configurations.

5. Run `npm start` to start the backend server.

## Usage

1. Register a new account or log in with existing credentials.

2. Explore user profiles, send friend requests, and accept/reject requests.

3. Create and like posts, toggle between dark and light mode.

4. Enjoy the features of your MERN social media application!
