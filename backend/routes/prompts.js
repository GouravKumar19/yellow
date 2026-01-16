const express = require('express');
const { body, validationResult } = require('express-validator');
const Prompt = require('../models/Prompt');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/prompts/project/:projectId
// @desc    Get all prompts for a project
// @access  Private
router.get('/project/:projectId', async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const prompts = await Prompt.find({ project: req.params.projectId })
      .sort({ createdAt: -1 });

    res.json({ prompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid project ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/prompts
// @desc    Create a new prompt
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Prompt name is required'),
    body('content').notEmpty().withMessage('Prompt content is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, content, project } = req.body;

      // Verify project belongs to user
      const projectDoc = await Project.findOne({
        _id: project,
        user: req.user.id,
      });

      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const prompt = await Prompt.create({
        name,
        content,
        project,
        user: req.user.id,
      });

      res.status(201).json({ prompt });
    } catch (error) {
      console.error('Create prompt error:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/prompts/:id
// @desc    Update a prompt
// @access  Private
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Prompt name cannot be empty'),
    body('content').optional().notEmpty().withMessage('Prompt content cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prompt = await Prompt.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!prompt) {
        return res.status(404).json({ message: 'Prompt not found' });
      }

      const { name, content } = req.body;

      if (name) prompt.name = name;
      if (content !== undefined) prompt.content = content;

      await prompt.save();

      res.json({ prompt });
    } catch (error) {
      console.error('Update prompt error:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'Prompt not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/prompts/:id
// @desc    Delete a prompt
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    await Prompt.deleteOne({ _id: req.params.id });

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete prompt error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
