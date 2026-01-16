# Architecture & Design Documentation

## Overview

The Chatbot Platform is a full-stack web application built with the MERN stack, designed to allow users to create, manage, and interact with AI agents through a chat interface. The architecture follows a client-server model with a RESTful API backend and a single-page React frontend.

## System Architecture

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │         │   Express   │         │   MongoDB   │
│  Frontend   │◄───────►│   Backend   │◄───────►│  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   OpenAI/   │
                       │  OpenRouter │
                       │     API     │
                       └─────────────┘
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **File Upload**: Multer

### Directory Structure

```
backend/
├── models/          # Data models (User, Project, Prompt, ChatMessage)
├── routes/          # API route handlers
├── middleware/     # Custom middleware (authentication)
├── server.js       # Application entry point
└── package.json    # Dependencies
```

### Data Models

#### User Model
- Stores user authentication information
- Fields: name, email, password (hashed), createdAt
- Password hashing using bcrypt with salt rounds

#### Project Model
- Represents an AI agent/project
- Fields: name, description, user (reference), llmProvider, model, systemPrompt, files, timestamps
- Linked to User via reference

#### Prompt Model
- Stores reusable prompts for projects
- Fields: name, content, project (reference), user (reference), timestamps
- Linked to both User and Project

#### ChatMessage Model
- Stores chat conversation history
- Fields: project (reference), user (reference), role, content, createdAt
- Supports conversation context for LLM interactions

### API Design

#### RESTful Principles
- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- JSON request/response format
- Standard HTTP status codes

#### Authentication Flow
1. User registers/logs in
2. Server validates credentials
3. JWT token generated and returned
4. Client stores token in localStorage
5. Token sent in Authorization header for protected routes
6. Middleware validates token on each request

#### Route Organization
- `/api/auth/*` - Authentication endpoints
- `/api/projects/*` - Project CRUD operations
- `/api/prompts/*` - Prompt management
- `/api/chat/*` - Chat interactions
- `/api/files/*` - File uploads

### Security Measures

1. **Password Security**
   - Bcrypt hashing with salt
   - Minimum password length validation
   - Passwords never returned in API responses

2. **Authentication**
   - JWT tokens with expiration
   - Token stored securely (localStorage)
   - Protected routes require valid token

3. **Input Validation**
   - express-validator for request validation
   - Sanitization of user inputs
   - Type checking and format validation

4. **Error Handling**
   - Centralized error handling middleware
   - Detailed error messages in development
   - Generic messages in production

## Frontend Architecture

### Technology Stack
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Build Tool**: Create React App

### Directory Structure

```
frontend/src/
├── components/      # Reusable components (Navbar, PrivateRoute)
├── pages/           # Page components (Login, Dashboard, Chat, etc.)
├── context/         # React Context (AuthContext)
├── App.js           # Main application component
└── index.js         # Application entry point
```

### Component Hierarchy

```
App
├── Router
    ├── Login
    ├── Register
    ├── Dashboard (PrivateRoute)
    │   └── Navbar
    ├── ProjectDetail (PrivateRoute)
    │   └── Navbar
    └── Chat (PrivateRoute)
        └── Navbar
```

### State Management

- **AuthContext**: Manages user authentication state
  - User information
  - Login/logout functions
  - Token management

- **Local Component State**: Used for UI state and form data
  - Modal visibility
  - Form inputs
  - Loading states

### Routing Strategy

- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/project/:id`, `/project/:id/chat`
- PrivateRoute component handles authentication checks
- Automatic redirect to login for unauthenticated users

## Data Flow

### User Registration Flow
1. User submits registration form
2. Frontend sends POST request to `/api/auth/register`
3. Backend validates input, hashes password, creates user
4. JWT token generated and returned
5. Frontend stores token, updates AuthContext
6. User redirected to dashboard

### Chat Flow
1. User sends message in chat interface
2. Frontend sends POST to `/api/chat` with projectId and message
3. Backend retrieves project and recent chat history
4. Backend constructs messages array with system prompt
5. Backend calls OpenAI/OpenRouter API
6. Response saved to database
7. Frontend receives and displays response

### Project Management Flow
1. User creates/updates project
2. Frontend sends request to `/api/projects`
3. Backend validates and saves to MongoDB
4. Response returned with project data
5. Frontend updates UI with new data

## Scalability Considerations

### Database
- MongoDB's horizontal scaling capabilities
- Indexed fields for faster queries
- Reference-based relationships (not embedded documents)
- Efficient query patterns

### API
- Stateless design (JWT tokens)
- No server-side session storage
- Can be horizontally scaled
- Load balancer compatible

### Frontend
- Static assets can be CDN-hosted
- Client-side routing reduces server load
- Efficient re-rendering with React

## Performance Optimizations

1. **Database**
   - Indexed user and project fields
   - Efficient query patterns
   - Limited chat history retrieval (last 10 messages)

2. **API**
   - Async/await for non-blocking operations
   - Error handling prevents crashes
   - Response compression (Express default)

3. **Frontend**
   - React component optimization
   - Lazy loading potential
   - Efficient state updates

## Security Architecture

### Authentication & Authorization
- JWT-based stateless authentication
- Token expiration (7 days default)
- Protected routes on both frontend and backend
- User ownership verification for resources

### Data Protection
- Password hashing (bcrypt)
- Input validation and sanitization
- CORS configuration
- Environment variables for secrets

### API Security
- Rate limiting potential (can be added)
- Request validation
- Error message sanitization
- HTTPS recommended for production

## Extensibility

### Adding New LLM Providers
1. Add provider name to Project model enum
2. Create helper function in chat route
3. Add provider selection in frontend
4. Update API key configuration

### Adding New Features
- Modular route structure
- Reusable components
- Context-based state management
- Clear separation of concerns

### Integration Points
- WebSocket support for real-time chat
- Analytics service integration
- Third-party authentication (OAuth)
- File storage services (S3, etc.)

## Deployment Considerations

### Environment Variables
- Separate development and production configs
- Secure secret management
- Database connection strings
- API keys

### Production Checklist
- Enable HTTPS
- Set secure JWT secret
- Configure CORS properly
- Set up MongoDB Atlas or secure database
- Enable error logging
- Set up monitoring
- Configure build optimization

## Error Handling Strategy

### Backend
- Try-catch blocks in async functions
- Centralized error middleware
- Appropriate HTTP status codes
- Detailed logging

### Frontend
- Try-catch in async operations
- User-friendly error messages
- Loading states during operations
- Fallback UI for errors

## Testing Strategy (Future)

- Unit tests for models and utilities
- Integration tests for API endpoints
- Frontend component tests
- End-to-end tests for critical flows

## Conclusion

This architecture provides a solid foundation for a scalable chatbot platform. The separation of concerns, modular design, and use of industry-standard technologies make it maintainable and extensible. The stateless API design and efficient database structure support horizontal scaling as the user base grows.
