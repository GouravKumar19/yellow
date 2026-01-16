# Quick Setup Guide

## Step-by-Step Setup

### 1. Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running (or MongoDB Atlas account)
- [ ] OpenAI API key (or OpenRouter API key)

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Backend

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatbot-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
OPENAI_API_KEY=your-openai-api-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
NODE_ENV=development
```

**Important**: Replace `your-super-secret-jwt-key-change-this-in-production` with a strong random string for production.

### 4. Configure Frontend (Optional)

Create `frontend/.env` file if you need to change the API URL:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**MongoDB Atlas:**
- Use your connection string in `MONGODB_URI`

### 6. Run the Application

**Development mode (both servers):**
```bash
npm run dev
```

**Or run separately:**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 8. First Steps

1. Register a new account at http://localhost:3000/register
2. Login with your credentials
3. Create your first project
4. Configure your AI agent (model, system prompt)
5. Start chatting!

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Change PORT in `backend/.env`
- Or kill the process: `lsof -ti:5000 | xargs kill` (macOS/Linux)

### API Key Errors
- Verify your OpenAI/OpenRouter API key is correct
- Check API key has sufficient credits
- Ensure key is set in `backend/.env`

### CORS Errors
- Ensure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or secure database
4. Enable HTTPS
5. Build frontend: `cd frontend && npm run build`
6. Serve frontend build with a web server (nginx, etc.)
