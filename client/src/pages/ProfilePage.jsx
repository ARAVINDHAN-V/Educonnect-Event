import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    bio: '',
    avatarUrl: '',
    joinedDate: '',
    eventsCreated: 0,
    eventsAttended: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        // Replace with your actual API call
        // const response = await fetch('/api/user/profile', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        //   }
        // });
        
        // if (!response.ok) throw new Error('Failed to fetch profile');
        // const data = await response.json();
        
        // Simulating API response for development
        const data = {
          name: 'Kapil',
          email: 'kapil.ag22@bitsathy.ac.in',
          role: 'Student',
          organization: 'Agri',
          bio: 'Graduate student interested in AI and machine learning. Event organizer for tech meetups.',
          avatarUrl: 'https://via.placeholder.com/150',
          joinedDate: '2024-01-15',
          eventsCreated: 5,
          eventsAttended: 12
        };
        
        setProfile(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and information
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </Link>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="flex flex-col items-center">
                  <img 
                    src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="h-40 w-40 rounded-full object-cover border-4 border-gray-200"
                  />
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                    <p className="text-gray-600">{profile.role}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.organization}</dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.bio || 'No bio available'}</dd>
                  </div>
                </dl>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Activity Overview</h3>
                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Events Created</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">{profile.eventsCreated}</dd>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Events Attended</dt>
                        <dd className="mt-1 text-3xl font-semibold text-indigo-600">{profile.eventsAttended}</dd>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex space-x-4">
                  <Link
                    to="/my-events"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    My Events
                  </Link>
                  <Link
                    to="/brochures"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    My Brochures
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;