# Weather Assistant App

A real-time weather assistant application using OpenAI's GPT-4 with voice capabilities.

## Project Structure

The project is split into two main directories:

- `client/` - React frontend application
- `server/` - Node.js backend server

The client queries the Node.js server to get ephemeral token from OpenAI. Then, client connects to the OpenAI server using WebRTC and listens for user's audio input.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Server Setup

1. Navigate to the server directory:
   `cd server`

2. Install dependencies:
   `npm install`

3. Start the server:
   `node index.js`

### Client Setup

1. Navigate to the client directory:
   `cd client`

2. Install dependencies:
   `npm i`

3. Start the client:
   `npm run dev`

### Running the Application

1. Navigate to localhost:5173
2. Click on the "Start Call" button
3. Speak with the AI assistant in real-time and get the weather information
