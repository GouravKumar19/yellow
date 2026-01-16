const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('llmProvider').optional().isIn(['openrouter']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, llmProvider, model, systemPrompt } = req.body;

      const project = await Project.create({
        name,
        description,
        user: req.user.id,
        llmProvider: llmProvider || 'openrouter',
        model: model || 'openai/gpt-3.5-turbo',
        systemPrompt: systemPrompt || 'You are a helpful assistant.',
      });

      res.status(201).json({ project });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('llmProvider').optional().isIn(['openrouter']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = await Project.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const { name, description, llmProvider, model, systemPrompt } = req.body;

      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      if (llmProvider) project.llmProvider = llmProvider;
      if (model) project.model = model;
      if (systemPrompt !== undefined) project.systemPrompt = systemPrompt;

      await project.save();

      res.json({ project });
    } catch (error) {
      console.error('Update project error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
