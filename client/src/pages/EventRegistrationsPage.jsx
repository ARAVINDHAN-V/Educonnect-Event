import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EventRegistrationsPage = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('userToken');
        
        // Log diagnostic information
        console.log('Fetching event details and registrations', { 
          eventId: id, 
          tokenPresent: !!token 
        });

        // Fetch event details
        const eventResponse = await fetch(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Event Fetch Response Status:', eventResponse.status);

        if (!eventResponse.ok) {
          const errorText = await eventResponse.text();
          console.error('Event Fetch Error:', errorText);
          throw new Error(errorText || 'Failed to fetch event details');
        }

        const eventData = await eventResponse.json();
        setEventData(eventData);

        // Now fetch registrations with the correct URL
        const registrationsResponse = await fetch(`/api/events/${id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Registrations Fetch Response Status:', registrationsResponse.status);

        if (!registrationsResponse.ok) {
          const errorText = await registrationsResponse.text();
          console.error('Registrations Fetch Error:', errorText);
          throw new Error(errorText || 'Failed to fetch registrations');
        }

        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Complete Fetch Error:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedRegistrations = () => {
    const sortableItems = [...registrations];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const filteredRegistrations = getSortedRegistrations().filter(reg => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      reg.name?.toLowerCase().includes(searchTermLower) ||
      reg.email?.toLowerCase().includes(searchTermLower) ||
      reg.ticketType?.toLowerCase().includes(searchTermLower)
    );
  });

  const exportToCSV = () => {
    // Simple CSV export
    const headers = ['Name', 'Email', 'Registration Date', 'Ticket Type', 'Payment Status'];
    const dataRows = registrations.map(reg => [
      reg.name || '',
      reg.email || '',
      new Date(reg.registrationDate).toLocaleDateString() || '',
      reg.ticketType || '',
      reg.paymentStatus || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `registrations-event-${id}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle registration deletion
  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`/api/events/${id}/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete registration');
      }
      
      // Remove the deleted registration from state
      setRegistrations(registrations.filter(reg => reg._id !== registrationId));
      
    } catch (err) {
      console.error('Error deleting registration:', err);
      alert('Failed to delete registration: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8 min-h-screen">
      <div className="text-lg">Loading registrations data...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to={`/events/${id}`} className="text-blue-500 hover:text-blue-600">
          &larr; Back to Event Details
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{eventData?.title || 'Event'} Registrations</h1>
          <p className="text-gray-600 mb-6">
            {eventData && `${new Date(eventData.date).toLocaleDateString()} at ${eventData.time || 'TBD'}`}
          </p>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === 'name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === 'email' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('registrationDate')}
                  >
                    <div className="flex items-center">
                      Registration Date
                      {sortConfig.key === 'registrationDate' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('ticketType')}
                  >
                    <div className="flex items-center">
                      Ticket Type
                      {sortConfig.key === 'ticketType' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => sortData('paymentStatus')}
                  >
                    <div className="flex items-center">
                      Payment Status
                      {sortConfig.key === 'paymentStatus' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((registration) => (
                    <tr key={registration._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.ticketType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${registration.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                            registration.paymentStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {registration.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRegistration(registration._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No registrations match your search.' : 'No registrations found for this event.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-gray-500 text-sm">
            {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'registration' : 'registrations'} 
            {searchTerm && ' matching your search'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationsPage;