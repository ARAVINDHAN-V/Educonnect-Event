import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EventBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ticketType: 'Standard',
    specialRequirements: '',
    agreeToTerms: false
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        const data = await response.json();
        setEvent(data);
        
        // Attempt to prefill user data if they're logged in
        const token = localStorage.getItem('userToken');
        if (token) {
          try {
            const userResponse = await fetch('/api/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || ''
              }));
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Continue without user data
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('You must be logged in to register for an event');
      }

      const response = await fetch(`/api/events/${id}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticketType: formData.ticketType,
          specialRequirements: formData.specialRequirements
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register for this event');
      }

      // Registration successful
      setSubmitStatus({ loading: false, error: null, success: true });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(`/events/${id}/confirmation`);
      }, 2000);
      
    } catch (err) {
      setSubmitStatus({ loading: false, error: err.message, success: false });
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading event details...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!event) return <div className="p-4">Event not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to={`/events/${id}`} className="text-blue-500 hover:text-blue-600">
          &larr; Back to Event Details
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Register for Event: {event.title}</h1>
          
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded mb-6">
              <h2 className="text-lg font-semibold mb-2">Event Information</h2>
              <p><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {event.time || 'Not specified'}</p>
              <p><span className="font-medium">Location:</span> {event.location || 'Not specified'}</p>
              {event.price !== undefined && (
                <p><span className="font-medium">Price:</span> ${event.price.toFixed(2)}</p>
              )}
            </div>
            
            {submitStatus.success ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Your registration was successful. Redirecting to confirmation page...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {submitStatus.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {submitStatus.error}</span>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="ticketType" className="block text-gray-700 font-medium mb-2">
                    Ticket Type
                  </label>
                  <select
                    id="ticketType"
                    name="ticketType"
                    value={formData.ticketType}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="Early Bird">Early Bird</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="specialRequirements" className="block text-gray-700 font-medium mb-2">
                    Special Requirements (optional)
                  </label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-700">
                      I agree to the terms and conditions for this event
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? 'Processing...' : 'Complete Registration'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBookingPage;