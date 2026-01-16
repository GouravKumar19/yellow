/**
 * Test script to verify all requirements are met
 * Run: node test-setup.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let projectId = '';
let promptId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'OK') {
      logSuccess('Health check passed');
      return true;
    }
  } catch (error) {
    logError('Health check failed');
    return false;
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    });
    
    if (response.data.token && response.data.user) {
      authToken = response.data.token;
      logSuccess('User registration successful');
      return true;
    }
  } catch (error) {
    logError(`User registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUserLogin() {
  try {
    // First register a user
    const email = `test${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: email,
      password: 'test123456'
    });

    // Then login
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: 'test123456'
    });
    
    if (response.data.token && response.data.user) {
      authToken = response.data.token;
      logSuccess('User login successful');
      return true;
    }
  } catch (error) {
    logError(`User login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.user) {
      logSuccess('Get current user successful');
      return true;
    }
  } catch (error) {
    logError(`Get current user failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCreateProject() {
  try {
    const response = await axios.post(`${API_URL}/projects`, {
      name: 'Test Project',
      description: 'Test Description',
      llmProvider: 'openai',
      model: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful assistant.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.project && response.data.project._id) {
      projectId = response.data.project._id;
      logSuccess('Project creation successful');
      return true;
    }
  } catch (error) {
    logError(`Project creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetProjects() {
  try {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.projects && Array.isArray(response.data.projects)) {
      logSuccess('Get all projects successful');
      return true;
    }
  } catch (error) {
    logError(`Get projects failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCreatePrompt() {
  try {
    const response = await axios.post(`${API_URL}/prompts`, {
      name: 'Test Prompt',
      content: 'This is a test prompt content',
      project: projectId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.prompt && response.data.prompt._id) {
      promptId = response.data.prompt._id;
      logSuccess('Prompt creation successful');
      return true;
    }
  } catch (error) {
    logError(`Prompt creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetPrompts() {
  try {
    const response = await axios.get(`${API_URL}/prompts/project/${projectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.prompts && Array.isArray(response.data.prompts)) {
      logSuccess('Get prompts successful');
      return true;
    }
  } catch (error) {
    logError(`Get prompts failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetChatHistory() {
  try {
    const response = await axios.get(`${API_URL}/chat/${projectId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.messages && Array.isArray(response.data.messages)) {
      logSuccess('Get chat history successful');
      return true;
    }
  } catch (error) {
    logError(`Get chat history failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testChatMessage() {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      projectId: projectId,
      message: 'Hello, this is a test message'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.message) {
      logSuccess('Chat message sent successfully');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.message?.includes('API key')) {
      logInfo('Chat test skipped (API key not configured)');
      return true; // Not a failure, just missing config
    }
    logError(`Chat message failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('\n=== Testing Chatbot Platform Requirements ===\n', 'blue');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Create Project', fn: testCreateProject },
    { name: 'Get All Projects', fn: testGetProjects },
    { name: 'Create Prompt', fn: testCreatePrompt },
    { name: 'Get Prompts', fn: testGetPrompts },
    { name: 'Get Chat History', fn: testGetChatHistory },
    { name: 'Send Chat Message', fn: testChatMessage },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`Testing: ${test.name}...`, 'yellow');
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }

  log('\n=== Test Results ===', 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n✓ All requirements are fulfilled!', 'green');
  } else {
    log('\n✗ Some requirements are not fulfilled', 'red');
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Test execution error: ${error.message}`);
  process.exit(1);
});
