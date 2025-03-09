import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events'); // Use relative path
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
      setLoading(false);
    }
  };
  fetchEvents();
}, []);
  
  if (loading) return <div className="flex justify-center p-8">Loading events...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link 
          to="/events/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p>No events found. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {events.map(event => (
  <div 
    key={event._id} 
    className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
  >
    {event.imageUrl && (
      <img 
        src={event.imageUrl} 
        alt={event.title} 
        className="w-full h-40 object-cover"
      />
    )}
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
      <p className="text-gray-600 mb-2">
        {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="mb-4 line-clamp-2">{event.description}</p>
      <div className="flex justify-between">
        <Link 
          to={`/events/${event._id}`} 
          className="text-blue-500 hover:text-blue-600"
        >
          View Details
        </Link>
        <Link 
          to={`/events/${event._id}/edit`} 
          className="text-gray-500 hover:text-gray-600"
        >
          Edit
        </Link>
      </div>
    </div>
  </div>
))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;