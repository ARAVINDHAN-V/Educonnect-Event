import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    organization: "",
    bio: "",
    email: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("/default-avatar.png"); // Default avatar
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        const { data } = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfileData({
          name: data.name || "",
          organization: data.organization || "",
          bio: data.bio || "",
          email: data.email || "",
        });

        if (data.profileImage) {
          setPreviewImage(`${API_BASE_URL}/uploads/${data.profileImage}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again.");
      }
    };

    fetchProfile();
  }, [API_BASE_URL, navigate]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const formData = new FormData();
      if (profileData.name) formData.append("name", profileData.name);
      if (profileData.organization) formData.append("organization", profileData.organization);
      if (profileData.bio) formData.append("bio", profileData.bio);
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      await axios.put(`${API_BASE_URL}/api/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/profile", { 
        state: { updated: true, timestamp: new Date().getTime() } 
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <img
            src={previewImage}
            alt="Profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-600">Profile Image</span>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Full Name</span>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Organization</span>
            <input
              type="text"
              name="organization"
              value={profileData.organization}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Bio</span>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Email (Not Editable)</span>
            <input
              type="email"
              name="email"
              value={profileData.email}
              readOnly
              className="w-full p-2 border bg-gray-200 rounded-md mt-1 cursor-not-allowed"
            />
          </label>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-300 text-gray-800 p-2 rounded-md w-full hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white p-2 rounded-md w-full hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
