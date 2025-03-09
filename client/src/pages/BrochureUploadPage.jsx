import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const BrochureUploadPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size exceeds the 5MB limit');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    setProgress(0);
    
    // Create FormData object to send file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('eventId', eventId || '');
    
    try {
      // Simulating upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Replace with your actual API endpoint
      const response = await fetch('/api/brochures', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Failed to upload brochure');
      }
      
      setProgress(100);
      
      // Navigate to brochures page or back to event after successful upload
      setTimeout(() => {
        if (eventId) {
          navigate(`/events/${eventId}`);
        } else {
          navigate('/brochures');
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to={eventId ? `/events/${eventId}` : "/brochures"} className="text-blue-500 hover:text-blue-600">
          &larr; {eventId ? 'Back to Event' : 'Back to Brochures'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Brochure</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Brochure File (PDF only, max 5MB)*
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-sm text-gray-500 mt-1">
              {file ? `Selected file: ${file.name}` : 'No file selected'}
            </p>
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {progress < 100 ? `Uploading: ${progress}%` : 'Upload complete!'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Brochure'}
            </button>
            <Link
              to={eventId ? `/events/${eventId}` : "/brochures"}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrochureUploadPage;