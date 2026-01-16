const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  llmProvider: {
    type: String,
    enum: ['openrouter'],
    default: 'openrouter',
  },
  model: {
    type: String,
    default: 'openai/gpt-3.5-turbo',
  },
  systemPrompt: {
    type: String,
    default: 'You are a helpful assistant.',
  },
  files: [{
    fileId: String,
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
