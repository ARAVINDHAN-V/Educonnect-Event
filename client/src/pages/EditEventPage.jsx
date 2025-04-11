import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EditEventPage = () => {
  const { id } = useParams() || {};  // ✅ Prevents error if id is undefined
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  console.log("ID:", id);


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    imageUrl: '',
  });

  const [selectedImageOption, setSelectedImageOption] = useState('upload'); // 'upload' or 'url'
  const [previewImage, setPreviewImage] = useState('');

  // Fetch event data on mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error('Failed to fetch event');
        const eventData = await response.json();

        const formattedDate = eventData.date
          ? new Date(eventData.date).toISOString().split('T')[0]
          : '';

        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          date: formattedDate,
          time: eventData.time || '',
          location: eventData.location || '',
          price: eventData.price !== undefined ? eventData.price.toString() : '',
          imageUrl: eventData.imageUrl || '',
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Preview image logic
  useEffect(() => {
    if (formData.imageUrl instanceof File) {
      const fileURL = URL.createObjectURL(formData.imageUrl);
      setPreviewImage(fileURL);
      return () => URL.revokeObjectURL(fileURL);
    } else if (typeof formData.imageUrl === 'string') {
      setPreviewImage(formData.imageUrl);
    }
  }, [formData.imageUrl]);

  // ✅ Your requested console log
  useEffect(() => {
    console.log('Preview Image is now:', previewImage);
  }, [previewImage]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: file,
      }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
  
      if (selectedImageOption === 'upload' && formData.imageUrl instanceof File) {
        formDataToSend.append('image', formData.imageUrl);
      } else if (selectedImageOption === 'url' && typeof formData.imageUrl === 'string') {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }
  
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formDataToSend,
      });
  
      // ✅ Add safe JSON parsing here
      let data;
      try {
        if (res.headers.get('content-type')?.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || 'Server returned no response');
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        throw new Error('Server response not in JSON format');
      }
  
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update event');
      }
  
      // Redirect or update UI
      navigate(`/events/${id}`);
    } catch (err) {
      console.error('Update error:', err.message);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="p-4 text-center">Loading event...</div>;
  if (error && !saving) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to={`/events/${id}`} className="text-blue-500 hover:text-blue-600">
          &larr; Back to Event
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

        {error && saving && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
        


          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date*
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
              Time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Image Upload</label>
        <div className="flex space-x-4 mb-2">
          <button
            type="button"
            className={`py-1 px-3 rounded border ${selectedImageOption === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setSelectedImageOption('upload')}
          >
            Upload from Device
          </button>
          <button
            type="button"
            className={`py-1 px-3 rounded border ${selectedImageOption === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setSelectedImageOption('url')}
          >
            Paste Image Link
          </button>
        </div>

        {selectedImageOption === 'upload' && (
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData((prev) => ({
                  ...prev,
                  imageUrl: file,
                }));
              }
            }}
          />
        )}

        {selectedImageOption === 'url' && (
          <input
            type="text"
            placeholder="Paste image URL"
            className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            value={typeof formData.imageUrl === 'string' ? formData.imageUrl : ''}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                imageUrl: e.target.value,
              }));
            }}
          />
        )}

{previewImage && (
  <div className="mt-2">
    <p className="text-sm font-medium">Current Selected Image:</p>
    <img
      src={previewImage}
      alt="Selected Preview"
      className="mt-1 max-h-40 rounded-lg border p-1 object-contain"
    />
  </div>
)}

      </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to={`/events/${id}`}
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

export default EditEventPage;