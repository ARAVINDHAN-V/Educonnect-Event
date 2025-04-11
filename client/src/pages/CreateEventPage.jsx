import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';



const CreateEventPage = () => {
  const { showNotification } = useNotification();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageOption, setSelectedImageOption] = useState('upload'); // default option



  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    imageUrl: '',
    registrationLimit: '',
    enableLastMinutePass: false,
    lastMinutePassCount: ''
  });
  

  const [imageFile, setImageFile] = useState(null); // ✅ Actual file upload


  // Comprehensive debugging useEffect
  useEffect(() => {
    console.group('Authentication Debug');
    console.log('Token from Context:', token);
    console.log('User from Context:', user);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('User Data from localStorage:', localStorage.getItem('userData'));
    console.groupEnd();
  }, [token, user, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
  
    const storedToken = token || localStorage.getItem('token') || (user && user.token);
    if (!storedToken) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }
  
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('date', formData.date);
      payload.append('time', formData.time);
      payload.append('location', formData.location);
      payload.append('price', formData.price);
      payload.append('registrationLimit', formData.registrationLimit);
payload.append('enableLastMinutePass', formData.enableLastMinutePass);
payload.append('lastMinutePassCount', formData.lastMinutePassCount || 0);

      if (imageFile) payload.append('image', imageFile);
      payload.append('imageUrl', formData.imageUrl || '');
  
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        body: payload,
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create event');
  
      // console.log("✅ Event created:", result);
      // setSuccess("Event created successfully!");

      setPopupMessage("✅ Event Created Successfully!");
setShowPopup(true);
setTimeout(() => setShowPopup(false), 6000); // Hide popup after 6 seconds
showNotification('🎉 Event Created Successfully!');


  
      // ✅ Add this to navigate to Event Detail Page
      setTimeout(() => {
        navigate('/events');
      }, 1000); // 1 second delay to show success message
  
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
     
  {showPopup && (
    <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
      {popupMessage}
    </div>
  )}
  
  
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to="/events" className="text-blue-500 hover:text-blue-600">
          &larr; Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
        {success && <p className="text-green-600">{success}</p>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Event Title*
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

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
  <label className="block text-gray-700 text-sm font-bold mb-2">Event Image</label>

  {/* Radio buttons */}
  <div className="flex items-center gap-6 mb-2">
    <label className="flex items-center">
      <input
        type="radio"
        name="imageOption"
        value="upload"
        checked={selectedImageOption === 'upload'}
        onChange={() => {
          setSelectedImageOption('upload');
          setImageFile(null);
          setFormData((prev) => ({ ...prev, imageUrl: '' }));
        }}
        className="mr-2"
      />
      Upload from Device
    </label>
    <label className="flex items-center">
      <input
        type="radio"
        name="imageOption"
        value="url"
        checked={selectedImageOption === 'url'}
        onChange={() => {
          setSelectedImageOption('url');
          setImageFile(null);
          setFormData((prev) => ({ ...prev, imageUrl: '' }));
        }}
        className="mr-2"
      />
      Paste Image URL
    </label>
  </div>

  {/* Show input based on option */}
  {selectedImageOption === 'upload' && (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setImageFile(e.target.files[0])}
      className="w-full border border-gray-300 rounded px-3 py-2"
    />
  )}

  {selectedImageOption === 'url' && (
    <input
      type="text"
      name="imageUrl"
      placeholder="Paste image link..."
      value={formData.imageUrl}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded px-3 py-2"
    />
  )}
</div>

{/* Registration Limit */}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registrationLimit">
    Registration Count*
  </label>
  <input
    id="registrationLimit"
    name="registrationLimit"
    type="number"
    min="1"
    required
    value={formData.registrationLimit}
    onChange={handleChange}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>

{/* Enable Last Minute Pass */}
<div className="mb-4">
  <label className="inline-flex items-center">
    <input
      type="checkbox"
      name="enableLastMinutePass"
      checked={formData.enableLastMinutePass}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          enableLastMinutePass: e.target.checked,
          lastMinutePassCount: e.target.checked ? prev.lastMinutePassCount : ''
        }))
      }
      className="form-checkbox mr-2"
    />
    Enable Last Minute Pass
  </label>
</div>

{/* Last Minute Pass Count */}
{formData.enableLastMinutePass && (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastMinutePassCount">
      Last Minute Pass Count
    </label>
    <input
      id="lastMinutePassCount"
      name="lastMinutePassCount"
      type="number"
      min="1"
      value={formData.lastMinutePassCount}
      onChange={handleChange}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
  </div>
)}



          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <Link
              to="/events"
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

export default CreateEventPage;