#!/bin/bash

# API Testing Script
# Make sure backend is running on http://localhost:5000

API_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=== Testing Chatbot Platform API ==="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (Status: $response)${NC}"
fi
echo ""

# Test 2: User Registration
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ User registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: User Login
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }')

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
    echo -e "${GREEN}✓ User login successful${NC}"
    TOKEN=$LOGIN_TOKEN
else
    echo -e "${RED}✗ User login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Get Current User
echo "4. Testing Get Current User..."
USER_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q "test@example.com"; then
    echo -e "${GREEN}✓ Get current user successful${NC}"
else
    echo -e "${RED}✗ Get current user failed${NC}"
    echo "Response: $USER_RESPONSE"
fi
echo ""

# Test 5: Create Project
echo "5. Testing Create Project..."
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Test Description",
    "llmProvider": "openai",
    "model": "gpt-3.5-turbo",
    "systemPrompt": "You are a helpful assistant."
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓ Project creation successful${NC}"
    echo "Project ID: $PROJECT_ID"
else
    echo -e "${RED}✗ Project creation failed${NC}"
    echo "Response: $PROJECT_RESPONSE"
    exit 1
fi
echo ""

# Test 6: Get All Projects
echo "6. Testing Get All Projects..."
PROJECTS_RESPONSE=$(curl -s -X GET "$API_URL/projects" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROJECTS_RESPONSE" | grep -q "Test Project"; then
    echo -e "${GREEN}✓ Get all projects successful${NC}"
else
    echo -e "${RED}✗ Get all projects failed${NC}"
    echo "Response: $PROJECTS_RESPONSE"
fi
echo ""

# Test 7: Create Prompt
echo "7. Testing Create Prompt..."
PROMPT_RESPONSE=$(curl -s -X POST "$API_URL/prompts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Prompt\",
    \"content\": \"This is a test prompt\",
    \"project\": \"$PROJECT_ID\"
  }")

PROMPT_ID=$(echo $PROMPT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PROMPT_ID" ]; then
    echo -e "${GREEN}✓ Prompt creation successful${NC}"
else
    echo -e "${RED}✗ Prompt creation failed${NC}"
    echo "Response: $PROMPT_RESPONSE"
fi
echo ""

# Test 8: Get Prompts for Project
echo "8. Testing Get Prompts for Project..."
PROMPTS_RESPONSE=$(curl -s -X GET "$API_URL/prompts/project/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROMPTS_RESPONSE" | grep -q "Test Prompt"; then
    echo -e "${GREEN}✓ Get prompts successful${NC}"
else
    echo -e "${RED}✗ Get prompts failed${NC}"
    echo "Response: $PROMPTS_RESPONSE"
fi
echo ""

# Test 9: Get Chat History (should be empty initially)
echo "9. Testing Get Chat History..."
CHAT_HISTORY=$(curl -s -X GET "$API_URL/chat/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CHAT_HISTORY" | grep -q "messages"; then
    echo -e "${GREEN}✓ Get chat history successful${NC}"
else
    echo -e "${RED}✗ Get chat history failed${NC}"
    echo "Response: $CHAT_HISTORY"
fi
echo ""

# Test 10: Send Chat Message (requires API key)
echo "10. Testing Send Chat Message..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}⚠ Skipping chat test (OPENAI_API_KEY not set)${NC}"
    echo "Set OPENAI_API_KEY environment variable to test chat functionality"
else
    CHAT_RESPONSE=$(curl -s -X POST "$API_URL/chat" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"projectId\": \"$PROJECT_ID\",
        \"message\": \"Hello, this is a test message\"
      }")
    
    if echo "$CHAT_RESPONSE" | grep -q "message"; then
        echo -e "${GREEN}✓ Chat message sent successfully${NC}"
    else
        echo -e "${RED}✗ Chat message failed${NC}"
        echo "Response: $CHAT_RESPONSE"
    fi
fi
echo ""

echo "=== API Testing Complete ==="
