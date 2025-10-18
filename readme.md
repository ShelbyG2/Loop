# Loop - Real-time Chat Application 🚀

A modern, full-stack chat application built with React, TypeScript, and Node.js. Loop provides seamless real-time messaging with a focus on security and user experience.

## ⚡️ Core Features

- 🔐 Secure authentication via Supabase
- 💬 Real-time messaging capabilities
- 👥 User profiles with customizable avatars
- 🌓 Modern UI with DaisyUI components
- 📱 Fully responsive design
- 🔔 Push Notifications for new messages

## 🛠 Tech Stack

### Frontend

- React 18 + TypeScript
- Vite for blazing fast builds
- TailwindCSS + DaisyUI
- React Router v6
- Supabase Client

### Backend

- Node.js + Express
- MongoDB with Mongoose
- Supabase Auth
- WebSocket for real-time features

## 🚀 Getting Started

### Prerequisites

```bash
node -v  # v16 or higher
npm -v   # v8 or higher
```

### Environment Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/loop.git
cd loop
```

2. **Set up environment variables**

Client (.env):

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:3000
```

Server (.env):

```bash
MONGO_URI=your_mongodb_uri
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=3000
```

### Installation

1. **Client Setup**

```bash
cd Client
npm install
npm run dev
```

2. **Server Setup**

```bash
cd Server
npm install
npm run dev
```

## 📚 Project Structure

```
Loop/
├── Client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── package.json
│
└── Server/                # Backend application
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   └── middleware/   # Custom middleware
    └── package.json
```

## 🔨 Development

### Available Scripts

**Client:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Server:**

```bash
npm run dev      # Start development server
npm run start    # Start production server
npm run test     # Run tests
```

## 🔑 API Routes

### Authentication

- `POST /api/auth/verify` - Verify user token
- `GET /api/auth/user` - Get current user

### Conversations

- `GET /api/conversations/userConversations` - Get user conversations
- `POST /api/conversations/createConvo` - Create new conversation
- `DELETE /api/conversations/deleteConvo` - Delete conversation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Joseph Njenga - Initial work - [GitHub](https://github.com/shelbyg2)

---

⭐️ If you found this project interesting, please consider giving it a star!
