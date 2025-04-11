import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from "../context/NotificationContext";
import { useLocation } from 'react-router-dom';

const EventRegistrationsPage = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'desc' });
  const { showNotification } = useNotification();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');

        const eventResponse = await fetch(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!eventResponse.ok) {
          const errorText = await eventResponse.text();
          throw new Error(errorText || 'Failed to fetch event details');
        }

        const eventData = await eventResponse.json();
        setEventData(eventData);

        const registrationsResponse = await fetch(`/api/events/${id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!registrationsResponse.ok) {
          const errorText = await registrationsResponse.text();
          throw new Error(errorText || 'Failed to fetch registrations');
        }

        const registrationsData = await registrationsResponse.json();
        setRegistrations(registrationsData);

        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
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
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const filteredRegistrations = getSortedRegistrations().filter(reg => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      reg.teamName?.toLowerCase().includes(searchTermLower) ||
      reg.paperTitle?.toLowerCase().includes(searchTermLower)
    );
  });

  const exportToCSV = () => {
    const headers = ['Team Name', 'Paper Title', 'Abstract', 'Total Fees'];
    const dataRows = registrations.map(reg => [
      reg.teamName || '',
      reg.paperTitle || '',
      `"${reg.abstract?.replace(/"/g, '""') || ''}"`,
      reg.totalFees || ''
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

  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;

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

      setRegistrations(registrations.filter(reg => reg._id !== registrationId));
      showNotification('Registration deleted successfully.', 'success');
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
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Team Name
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Paper Title
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Team Members
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Abstract
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Payment Proof
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Total Fees
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Type
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      Actions
    </th>
  </tr>
</thead>


<tbody className="divide-y divide-gray-200">
  {filteredRegistrations.length > 0 ? (
    filteredRegistrations.map((registration) => (
      <tr key={registration._id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {registration.teamName || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {registration.paperTitle}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <div className="space-y-1">
            {registration.teamMembers?.map((member, idx) => (
              <div key={idx} className="text-sm text-gray-600">
                <p><strong>Member {idx + 1}</strong>: {member.name}</p>
                <p className="ml-2 text-sm">
                  {member.college}, {member.studies}, {member.department}<br />
                  {member.email}, {member.phone}
                </p>
              </div>
            ))}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {registration.abstract.length > 100
            ? registration.abstract.substring(0, 100) + '...'
            : registration.abstract}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {registration.paymentProof ? (
            <img
              src={`http://localhost:5000/${registration.paymentProof}`}
              alt="Payment Proof"
              className="w-24 rounded-md border border-gray-300"
            />
          ) : (
            <span className="text-gray-400 italic">Not uploaded</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          ₹{registration.totalFees}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {registration.lastMinutePass ? (
            <span className="text-orange-600 font-semibold">Last Minute</span>
          ) : (
            <span className="text-green-600">Normal</span>
          )}
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
      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
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