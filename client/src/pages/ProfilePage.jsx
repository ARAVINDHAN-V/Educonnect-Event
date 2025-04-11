import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Convert fetchProfile to useCallback to prevent unnecessary re-creation
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        // Add cache-busting parameter to prevent browser caching
        params: { _t: new Date().getTime() }
      });

      if (!data) throw new Error("Empty response from server");

      setProfile({
        name: data.name || "User",
        organization: data.organization || "Coordinator",
        bio: data.bio || "No bio available",
        email: data.email || "",
        profileImage: data.profileImage
          ? `${API_BASE_URL}/uploads/${data.profileImage}`
          : "https://thumbs.dreamstime.com/b/business-man-profile-icon-male-avatar-hipster-style-fashion-cartoon-guy-beard-portrait-casual-businessman-person-face-flat-design-69046219.jpg",
        eventsCreated: data.eventsCreated || 0,
        eventsAttended: data.eventsAttended || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    setIsLoading(true);
    fetchProfile();
  
    if (location.state?.timestamp) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.key, location.state?.timestamp, fetchProfile]);
  
  

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
          <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button
            onClick={() => navigate("/edit-profile")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={profile?.profileImage}
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-semibold">{profile?.name}</h2>
          <p className="text-gray-600">{profile?.organization}</p>
          <p className="text-gray-500">{profile?.email}</p>
        </div>

        <div className="mt-6">
          <p className="text-lg">
            <strong>Bio:</strong><p>Student</p> {profile?.bio}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Events Created</p>
            <p className="text-2xl font-bold">{profile?.eventsCreated}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Events Attended</p>
            <p className="text-2xl font-bold">{profile?.eventsAttended}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;