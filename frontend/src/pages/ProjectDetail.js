import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptForm, setPromptForm] = useState({ name: '', content: '' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProject();
    fetchPrompts();
    fetchFiles();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await axios.get(`${API_URL}/prompts/project/${id}`);
      setPrompts(response.data.prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files/${id}`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.put(`${API_URL}/projects/${id}`, project);
      setProject(response.data.project);
      alert('Project updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/prompts`, {
        ...promptForm,
        project: id,
      });
      setPrompts([response.data.prompt, ...prompts]);
      setShowPromptModal(false);
      setPromptForm({ name: '', content: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create prompt');
    }
  };

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/prompts/${promptId}`);
      setPrompts(prompts.filter((p) => p._id !== promptId));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploadingFile(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API_URL}/files/upload/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setFiles([...files, response.data.file]);
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/files/${id}/${fileId}`);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="spinner"></div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <p>Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="project-detail-header">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          <h1>{project.name}</h1>
        </div>

        <div className="project-detail-content">
          <div className="card">
            <h2>Project Settings</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) =>
                    setProject({ ...project, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) =>
                    setProject({ ...project, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={project.model}
                  onChange={(e) =>
                    setProject({ ...project, model: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>System Prompt</label>
                <textarea
                  value={project.systemPrompt}
                  onChange={(e) =>
                    setProject({ ...project, systemPrompt: e.target.value })
                  }
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn-primary">
                Update Project
              </button>
            </form>
          </div>

          <div className="card">
            <div className="prompts-header">
              <h2>Prompts</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowPromptModal(true)}
              >
                + Add Prompt
              </button>
            </div>
            {prompts.length === 0 ? (
              <p className="empty-state-text">No prompts yet</p>
            ) : (
              <div className="prompts-list">
                {prompts.map((prompt) => (
                  <div key={prompt._id} className="prompt-item">
                    <h4>{prompt.name}</h4>
                    <p>{prompt.content}</p>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePrompt(prompt._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="files-header">
              <h2>Files</h2>
              <div className="file-upload-wrapper">
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  {uploadingFile ? 'Uploading...' : '+ Upload File'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {files.length === 0 ? (
              <p className="empty-state-text">No files uploaded yet</p>
            ) : (
              <div className="files-list">
                {files.map((file) => (
                  <div key={file.id || file.fileId} className="file-item">
                    <div className="file-info">
                      <span className="file-name">
                        {file.fileName || file.name}
                      </span>
                      {file.uploadedAt && (
                        <span className="file-date">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteFile(file.id || file.fileId)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="file-upload-note">
              Files are uploaded to OpenAI and can be used with your AI agent.
              Max file size: 50MB
            </p>
          </div>

          <div className="card">
            <h2>Chat Interface</h2>
            <p>Start chatting with your agent</p>
            <Link to={`/project/${id}/chat`} className="btn btn-primary">
              Open Chat
            </Link>
          </div>
        </div>

        {showPromptModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowPromptModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Add New Prompt</h2>
              <form onSubmit={handleCreatePrompt}>
                <div className="form-group">
                  <label>Prompt Name</label>
                  <input
                    type="text"
                    value={promptForm.name}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prompt Content</label>
                  <textarea
                    value={promptForm.content}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        content: e.target.value,
                      })
                    }
                    required
                    rows="6"
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPromptModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetail;
