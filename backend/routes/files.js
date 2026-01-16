const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// @route   POST /api/files/upload/:projectId
// @desc    Upload a file to OpenAI and associate with project
// @access  Private
router.post('/upload/:projectId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id,
    });

    if (!project) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Project not found' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    // Upload file to OpenAI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
    formData.append('purpose', 'assistants');

    const response = await axios.post(
      'https://api.openai.com/v1/files',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    const fileData = response.data;

    // Add file to project
    project.files.push({
      fileId: fileData.id,
      fileName: req.file.originalname,
    });

    await project.save();

    // Clean up local file
    fs.unlinkSync(req.file.path);

    res.json({
      file: {
        id: fileData.id,
        fileName: req.file.originalname,
        uploadedAt: project.files[project.files.length - 1].uploadedAt,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.response?.data?.error?.message || 'Error uploading file',
    });
  }
});

// @route   DELETE /api/files/:projectId/:fileId
// @desc    Delete a file from OpenAI and remove from project
// @access  Private
router.delete('/:projectId/:fileId', async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fileIndex = project.files.findIndex(
      (f) => f.fileId === req.params.fileId
    );

    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in project' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    // Delete file from OpenAI
    try {
      await axios.delete(`https://api.openai.com/v1/files/${req.params.fileId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
    } catch (error) {
      console.error('Error deleting file from OpenAI:', error);
      // Continue to remove from project even if OpenAI deletion fails
    }

    // Remove file from project
    project.files.splice(fileIndex, 1);
    await project.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid project or file ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/files/:projectId
// @desc    Get all files for a project
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

    res.json({ files: project.files });
  } catch (error) {
    console.error('Get files error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid project ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
