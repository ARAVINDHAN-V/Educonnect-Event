import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusIcon, CalendarIcon, UsersIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch events with proper API path and authorization
        const eventsResponse = await axios.get('/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Check if events is an array
        if (!Array.isArray(eventsResponse.data)) {
          throw new Error('Unexpected data format from API');
        }

        // Filter events by department if user has a department and is not admin
        const departmentEvents = user?.role === 'admin' 
          ? eventsResponse.data 
          : user?.department
            ? eventsResponse.data.filter(event => 
                event.department === user.department || 
                event.createdBy === user?.id)
            : eventsResponse.data.filter(event => event.createdBy === user?.id);

        // Calculate current date for upcoming events calculation
        const currentDate = new Date();
        
        // Calculate upcoming events
        const upcomingEvents = departmentEvents.filter(
          event => new Date(event.date) > currentDate
        );

        // Fetch registrations for each event to get accurate counts
        let totalRegistrations = 0;
        let totalRevenue = 0;

        // Enhanced event data with registration counts
        const enhancedEvents = await Promise.all(departmentEvents.map(async (event) => {
          try {
            // Only fetch registrations if user is creator or admin
            if (event.createdBy === user?.id || user?.role === 'admin') {
              const registrationsResponse = await axios.get(`/api/events/${event._id}/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const registrationsCount = registrationsResponse.data.length;
              totalRegistrations += registrationsCount;
              
              // Calculate revenue (registration fee * count)
              const eventRevenue = registrationsCount * (event.price || 0);
              totalRevenue += eventRevenue;
              
              return {
                ...event,
                registrationsCount,
                revenue: eventRevenue
              };
            } else {
              return {
                ...event,
                registrationsCount: 0,
                revenue: 0
              };
            }
          } catch (error) {
            console.error(`Error fetching registrations for event ${event._id}:`, error);
            return {
              ...event,
              registrationsCount: 0,
              revenue: 0
            };
          }
        }));

        // Sort events by date (upcoming first, then most recent completed)
        const sortedEvents = enhancedEvents.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          // First separate upcoming and past events
          const aIsPast = dateA < currentDate;
          const bIsPast = dateB < currentDate;
          
          if (aIsPast && !bIsPast) return 1;  // b comes first (upcoming)
          if (!aIsPast && bIsPast) return -1; // a comes first (upcoming)
          
          // For upcoming events, sort by soonest
          if (!aIsPast && !bIsPast) {
            return dateA - dateB;
          }
          
          // For past events, sort by most recent
          return dateB - dateA;
        });

        setEvents(sortedEvents);
        setStats({
          totalEvents: departmentEvents.length,
          upcomingEvents: upcomingEvents.length,
          totalRegistrations,
          totalRevenue
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [token, user, isAuthenticated]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove event from state after successful deletion
      setEvents(events.filter(event => event._id !== eventId));
      
      // Update stats
      const deletedEvent = events.find(event => event._id === eventId);
      const isUpcoming = new Date(deletedEvent.date) > new Date();
      
      setStats(prevStats => ({
        totalEvents: prevStats.totalEvents - 1,
        upcomingEvents: isUpcoming ? prevStats.upcomingEvents - 1 : prevStats.upcomingEvents,
        totalRegistrations: prevStats.totalRegistrations - (deletedEvent.registrationsCount || 0),
        totalRevenue: prevStats.totalRevenue - (deletedEvent.revenue || 0)
      }));
      
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <div className="text-center">
          <p className="text-2xl mb-4">Error Loading Dashboard</p>
          <p>{error}</p>
          <Link 
            to="/login" 
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {user?.department} Department • {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Events</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.upcomingEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Registrations</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalRegistrations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-3xl font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/events/create"
            className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Event
          </Link>
          <Link
            to="/brochures/upload"
            className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
            Upload Event Brochure
          </Link>
          <Link
            to="/payments"
            className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CreditCardIcon className="h-5 w-5 mr-2 text-gray-500" />
            Manage Payments
          </Link>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Your Events</h3>
        </div>
        <div className="overflow-x-auto">
          {events.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrations
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{event.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">{event.registrationsCount || 0}</div>
  <div className="text-sm text-gray-500">
    {event.capacity ? 
      `${((event.registrationsCount || 0) / event.capacity * 100).toFixed(0)}% capacity` : 
      'No capacity set'}
  </div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">₹{(event.revenue || 0).toLocaleString()}</div>
  <div className="text-sm text-gray-500">{event.price ? `₹${event.price} per person` : 'Free'}</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
    ${new Date(event.date) > new Date() 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'}`}>
    {new Date(event.date) > new Date() ? 'Upcoming' : 'Completed'}
  </span>
</td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <div className="flex justify-end space-x-2">
    <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-900">
      View
    </Link>
    <Link to={`/events/${event._id}/edit`} className="text-blue-600 hover:text-blue-900">
      Edit
    </Link>
    <button
      onClick={() => handleDeleteEvent(event._id)}
      className="text-red-600 hover:text-red-900"
    >
      Delete
    </button>
  </div>
</td>
</tr>
))}
</tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found</p>
              <Link to="/events/create" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
                Create your first event
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;