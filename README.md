# Chatbot Platform

A minimal Chatbot Platform built with the MERN stack (MongoDB, Express, React, Node.js) that allows users to create AI agents, manage prompts, and interact with them through a chat interface.

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Project/Agent Management**: Create and manage multiple AI projects/agents
- **Prompt Management**: Store and associate prompts with projects
- **Chat Interface**: Real-time chat interface to interact with AI agents
- **LLM Integration**: Uses OpenRouter API for chat completions
- **File Uploads**: Upload files to projects using OpenAI Files API (optional)

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios
- **Authentication**: JWT (JSON Web Tokens)
- **LLM Integration**: OpenRouter API (supports multiple models)
- **File Storage**: OpenAI Files API

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose (for MongoDB) OR MongoDB (local installation or MongoDB Atlas)
- OpenRouter API key (for chat functionality)
- OpenAI API key (for file uploads - optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yellow
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create a `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatbot-platform
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   NODE_ENV=development
   ```
   
   **Note**: 
   - `OPENROUTER_API_KEY` is required for chat functionality
   - `OPENAI_API_KEY` is optional, only needed for file uploads

   Create a `frontend/.env` file (optional, defaults to localhost:5000):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB using Docker (Recommended)**
   
   ```bash
   docker-compose up -d
   ```
   
   This will start MongoDB in a Docker container on port 27017.
   
   **OR** use local MongoDB:
   
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in the `.env` file.

5. **Run the application**

   Development mode (runs both backend and frontend):
   ```bash
   npm run dev
   ```

   Or run separately:
   
   Backend only:
   ```bash
   npm run server
   ```
   
   Frontend only:
   ```bash
   npm run client
   ```

6. **Access the application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - Get all projects (protected)
- `GET /api/projects/:id` - Get a single project (protected)
- `POST /api/projects` - Create a new project (protected)
- `PUT /api/projects/:id` - Update a project (protected)
- `DELETE /api/projects/:id` - Delete a project (protected)

### Prompts
- `GET /api/prompts/project/:projectId` - Get all prompts for a project (protected)
- `POST /api/prompts` - Create a new prompt (protected)
- `PUT /api/prompts/:id` - Update a prompt (protected)
- `DELETE /api/prompts/:id` - Delete a prompt (protected)

### Chat
- `POST /api/chat` - Send a chat message (protected)
- `GET /api/chat/:projectId` - Get chat history (protected)

### Files
- `POST /api/files/upload/:projectId` - Upload a file (protected)
- `GET /api/files/:projectId` - Get all files for a project (protected)
- `DELETE /api/files/:projectId/:fileId` - Delete a file (protected)

## Project Structure

```
yellow/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.js
│   └── package.json
├── README.md
└── package.json
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Project**: Click "New Project" to create an AI agent/project
3. **Configure Project**: Set the LLM provider, model, and system prompt
4. **Manage Prompts**: Add reusable prompts to your project
5. **Chat**: Open the chat interface to interact with your AI agent
6. **Upload Files** (optional): Upload files to enhance your agent's capabilities

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Protected routes on both frontend and backend
- Input validation using express-validator
- CORS configuration

## Scalability Considerations

- MongoDB for scalable data storage
- Stateless JWT authentication
- Modular code structure for easy extension
- RESTful API design

## Future Enhancements

- Analytics dashboard
- Integration with more LLM providers
- Real-time chat using WebSockets
- Team collaboration features
- Export/import functionality
- Advanced prompt templates

## Testing

### Automated Testing

Run the test script to verify all requirements:

```bash
# Make sure backend is running first
cd backend
npm install axios  # If not already installed
node ../test-setup.js
```

Or use the bash script:
```bash
chmod +x test-api.sh
./test-api.sh
```

### Manual Testing

1. Start the application
2. Register a new user
3. Create a project
4. Add prompts to the project
5. Test the chat interface
6. (Optional) Upload files to the project

## Troubleshooting

**MongoDB connection error**: 
- If using Docker: Ensure `docker-compose up -d` is running
- If using local MongoDB: Ensure MongoDB is running and the connection string in `.env` is correct
- Check MongoDB logs: `docker-compose logs mongodb`

**API key errors**: Verify your OpenAI or OpenRouter API keys are correctly set in the `backend/.env` file.

**Port already in use**: Change the PORT in `backend/.env` or kill the process using the port.

**Docker issues**: 
- Make sure Docker is running
- Check container status: `docker ps`
- View logs: `docker-compose logs`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
