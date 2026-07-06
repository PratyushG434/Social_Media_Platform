# Social Media Platform

A full-stack social media application featuring real-time messaging, stories, posts, and user connections. Built with a modern tech stack to ensure performance, scalability, and a great user experience.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT and bcrypt.
- **Profiles**: Customizable user profiles with avatar uploads (via Cloudinary).
- **Feeds & Posts**: 
  - Discovery and Home feeds.
  - Support for text, image, and video posts.
  - Like, comment, and share functionalities.
- **Stories**: Ephemeral updates that disappear after 24 hours, with support for likes and reactions.
- **Real-time Chat**: Instant messaging between users powered by Socket.io.
- **Notifications**: Stay updated with in-app notifications for likes, comments, and follows.

## 🛠 Tech Stack

### Frontend
- **React.js** (via Vite)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS & Shadcn UI components
- **Network Requests**: Axios
- **Real-time Communication**: Socket.io-client

### Backend
- **Node.js & Express**: API framework
- **Database**: PostgreSQL (Neon)
- **Real-time Server**: Socket.io
- **Media Storage**: Cloudinary (handled via Multer)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL Database (Local or Neon/Supabase)
- Cloudinary Account (for media uploads)

### 1. Clone the repository
```bash
git clone https://github.com/PratyushG434/Social_Media_Platform.git
cd Social_Media_Platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=8000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following variables:
```env
VITE_APP_API_URL=http://localhost:8000
```

Start the frontend development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000` (or another port specified by Vite) and connected to your local backend.

## 🚀 Deployment

The project is structured to be deployed independently:
- **Frontend**: Recommended to be deployed on Vercel or Netlify. Make sure to set the `VITE_APP_API_URL` environment variable to your deployed backend URL.
- **Backend**: Recommended to be deployed on Render, Railway, or Heroku. Ensure all environment variables are correctly configured in the hosting provider's dashboard.

*Note: For the websocket (Socket.io) to work in production, ensure your backend hosting provider supports WebSocket connections.*
