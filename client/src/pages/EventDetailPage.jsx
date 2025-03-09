import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        const data = await response.json();
        setEvent(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      navigate('/events');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading event details...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!event) return <div className="p-4">Event not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to="/events" className="text-blue-500 hover:text-blue-600">
          &larr; Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex space-x-2">
              <Link 
                to={`/events/${id}/edit`} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </Link>
              <button 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
              <Link 
                to={`/events/${id}/registrations`} 
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Registrations
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Time:</span> {event.time || 'Not specified'}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Location:</span> {event.location || 'Not specified'}
            </p>
            {event.price !== undefined && (
              <p className="text-gray-600">
                <span className="font-semibold">Price:</span> ${event.price.toFixed(2)}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">{event.description}</p>
          </div>

          {event.brochureUrl && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Brochure</h2>
              <a 
                href={event.brochureUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                Download Brochure
              </a>
            </div>
          )}

          <div className="mt-8">
            <Link 
              to={`/events/${id}/eventbooking`} 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-bold text-lg"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;