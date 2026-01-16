# Running the Application Locally

## Quick Start

### Prerequisites
- ✅ MongoDB running in Docker
- ✅ Node.js installed
- ✅ Dependencies installed

### Steps to Run

1. **Start MongoDB** (if not already running):
   ```bash
   docker-compose up -d
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

3. **Start Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on: http://localhost:3000

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### First Steps

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Create your first project
4. Start chatting with your AI agent!

### Troubleshooting

**Backend not starting?**
- Check if MongoDB is running: `docker ps`
- Verify `.env` file exists in `backend/` folder
- Check if port 5000 is available

**Frontend not starting?**
- Check if port 3000 is available
- Verify `node_modules` are installed
- Check browser console for errors

**MongoDB connection issues?**
- Ensure Docker container is running: `docker ps`
- Check MongoDB logs: `docker logs chatbot-mongodb`
- Verify connection string in `backend/.env`

### Environment Variables

Make sure `backend/.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatbot-platform
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
OPENAI_API_KEY=your-key-here (optional)
OPENROUTER_API_KEY=your-key-here (optional)
NODE_ENV=development
```

### Stopping the Application

1. Stop frontend: Press `Ctrl+C` in frontend terminal
2. Stop backend: Press `Ctrl+C` in backend terminal
3. Stop MongoDB: `docker-compose down`
