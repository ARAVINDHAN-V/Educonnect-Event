// client/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-4">BIT WELCOMES YOU</h1>
        <p className="text-xl mb-6">Discover, register, and participate events in BIT</p>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/events" 
            className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Events
          </Link>
          <Link 
            to="/events" 
            className="bg-transparent border-2 border-white px-6 py-2 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
          >
            Register an Event
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link to="/events" className="text-indigo-600 hover:underline">View all</Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500">
                      <span className="text-white text-xl font-bold">{event.title.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                      {event.department}
                    </span>
                    <Link 
                      to={`/events/${event._id}`}
                      className="text-indigo-600 text-sm font-medium hover:underline"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No upcoming events found. Check back later!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-blue-600 text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">Register Events</h3>
          <p className="text-gray-600">
            Easily register your department's events and generate registration links
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-green-600 text-4xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Event Assistant</h3>
          <p className="text-gray-600">
            Our chatbot can answer questions based on event brochures
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-purple-600 text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">Payment Management</h3>
          <p className="text-gray-600">
            Collect and manage payments for your department events
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;