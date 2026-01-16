# File Upload Implementation - OpenAI Files API

## Overview

File upload functionality has been fully implemented using the OpenAI Files API as specified in the requirements.

## Backend Implementation

### Endpoint: `POST /api/files/upload/:projectId`

**Location**: `backend/routes/files.js`

**Features**:
- ✅ Uses OpenAI Files API: `https://api.openai.com/v1/files`
- ✅ Multipart form data upload
- ✅ File purpose set to `'assistants'` (as per OpenAI API requirements)
- ✅ File size limit: 50MB
- ✅ Files stored in OpenAI and associated with projects
- ✅ Automatic cleanup of temporary files
- ✅ Error handling

**Implementation Details**:
```javascript
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
```

### Additional Endpoints

1. **GET /api/files/:projectId** - Get all files for a project
2. **DELETE /api/files/:projectId/:fileId** - Delete a file from OpenAI and project

## Frontend Implementation

### Location: `frontend/src/pages/ProjectDetail.js`

**Features**:
- ✅ File upload button with file input
- ✅ File list display with file names and upload dates
- ✅ Delete file functionality
- ✅ Upload progress indicator
- ✅ Error handling and display
- ✅ File size validation (50MB limit)

**UI Components**:
- File upload section in Project Detail page
- File list with delete buttons
- Upload status messages
- Error messages

## OpenAI Files API Compliance

The implementation follows OpenAI Files API documentation:
- ✅ **Endpoint**: `POST https://api.openai.com/v1/files`
- ✅ **Method**: POST
- ✅ **Content-Type**: `multipart/form-data`
- ✅ **Required Fields**:
  - `file`: The file to upload
  - `purpose`: Set to `'assistants'`
- ✅ **Authentication**: Bearer token via `OPENAI_API_KEY`
- ✅ **File Size**: Supports up to 50MB (configurable)

## Usage

### Prerequisites

1. Set `OPENAI_API_KEY` in `backend/.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

### Upload a File

1. Navigate to a project's detail page
2. Scroll to the "Files" section
3. Click "Upload File" button
4. Select a file from your computer
5. File will be uploaded to OpenAI and associated with the project

### View Files

- Files are displayed in the "Files" section of the project detail page
- Shows file name and upload date
- Files are stored in OpenAI's file storage

### Delete a File

1. Click "Delete" button next to the file
2. Confirm deletion
3. File will be removed from both OpenAI and the project

## File Storage

- Files are uploaded to OpenAI's file storage system
- File IDs are stored in the project's `files` array
- Original file names are preserved
- Upload timestamps are tracked

## Error Handling

- ✅ API key validation
- ✅ File size validation (50MB limit)
- ✅ Project ownership verification
- ✅ OpenAI API error handling
- ✅ User-friendly error messages

## Security

- ✅ Authentication required (JWT token)
- ✅ Project ownership verification
- ✅ File size limits
- ✅ Secure file handling
- ✅ Temporary file cleanup

## Testing

To test file upload:

1. Ensure `OPENAI_API_KEY` is set in backend `.env`
2. Start the backend server
3. Navigate to a project in the frontend
4. Click "Upload File" and select a file
5. Verify file appears in the list
6. Test delete functionality

## API Reference

### Upload File
```
POST /api/files/upload/:projectId
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <file>
```

### Get Files
```
GET /api/files/:projectId
Authorization: Bearer <token>
```

### Delete File
```
DELETE /api/files/:projectId/:fileId
Authorization: Bearer <token>
```

## Notes

- Files uploaded to OpenAI are stored in OpenAI's infrastructure
- File IDs returned by OpenAI are used for future reference
- Files can be used with OpenAI Assistants API
- Maximum file size: 50MB (configurable in multer config)
