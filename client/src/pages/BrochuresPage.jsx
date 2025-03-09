import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrochuresPage = () => {
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBrochures = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/brochures');
        if (!response.ok) {
          throw new Error('Failed to fetch brochures');
        }
        const data = await response.json();
        setBrochures(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBrochures();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brochure?')) {
      return;
    }

    try {
      const response = await fetch(`/api/brochures/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brochure');
      }

      setBrochures(brochures.filter(brochure => brochure.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBrochures = brochures.filter(brochure => {
    // Apply text search
    const matchesSearch = 
      brochure.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      brochure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brochure.eventTitle && brochure.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply category filter
    const matchesFilter = filter === 'all' || 
      (filter === 'with-event' && brochure.eventId) || 
      (filter === 'without-event' && !brochure.eventId);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex justify-center p-8">Loading brochures...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brochures</h1>
        <Link 
          to="/brochures/upload" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload New Brochure
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search brochures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="shadow border rounded w-full md:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">All Brochures</option>
            <option value="with-event">With Event</option>
            <option value="without-event">Without Event</option>
          </select>
        </div>
      </div>

      {brochures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No brochures found. Upload one to get started!</p>
        </div>
      ) : filteredBrochures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No brochures match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrochures.map(brochure => (
            <div 
              key={brochure.id} 
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{brochure.title}</h2>
                  <span className="text-sm bg-gray-100 rounded px-2 py-1">
                    {new Date(brochure.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                
                {brochure.eventId && (
                  <div className="mb-2">
                    <Link 
                      to={`/events/${brochure.eventId}`}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Event: {brochure.eventTitle}
                    </Link>
                  </div>
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-2">{brochure.description}</p>
                
                <div className="flex justify-between items-center">
                  <a 
                    href={brochure.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(brochure.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrochuresPage;