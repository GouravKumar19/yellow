const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Project = require('../models/Project');
const ChatMessage = require('../models/ChatMessage');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/chat
// @desc    Send a chat message and get AI response
// @access  Private
router.post(
  '/',
  [
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { projectId, message } = req.body;

      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        user: req.user.id,
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Save user message
      const userMessage = await ChatMessage.create({
        project: projectId,
        user: req.user.id,
        role: 'user',
        content: message,
      });

      // Get conversation history (last 10 messages for context)
      const recentMessages = await ChatMessage.find({
        project: projectId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .sort({ createdAt: 1 });

      // Build messages array for LLM
      const messages = [
        { role: 'system', content: project.systemPrompt },
        ...recentMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // Call OpenRouter API
      const aiResponse = await callOpenRouter(project.model, messages);

      // Save assistant response
      const assistantMessage = await ChatMessage.create({
        project: projectId,
        user: req.user.id,
        role: 'assistant',
        content: aiResponse,
      });

      res.json({
        message: aiResponse,
        userMessage: {
          id: userMessage._id,
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage._id,
          content: assistantMessage.content,
          role: assistantMessage.role,
          createdAt: assistantMessage.createdAt,
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        message: error.response?.data?.error?.message || 'Error generating response',
      });
    }
  }
);

// @route   GET /api/chat/:projectId
// @desc    Get chat history for a project
// @access  Private
router.get('/:projectId', async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const messages = await ChatMessage.find({ project: req.params.projectId })
      .sort({ createdAt: 1 })
      .select('-__v');

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid project ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to call OpenRouter API
async function callOpenRouter(model, messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: model || 'openai/gpt-3.5-turbo',
      messages: messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Chatbot Platform',
      },
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = router;
