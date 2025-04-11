import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';


const departments = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Information Science and Engineering', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Chemical Engineering', 'Biotechnology', 'Physics', 'Chemistry',
  'Mathematics', 'Management Studies', 'Humanities & Social Sciences', 'Student Affairs', 'Agriculture'
];

const EventBookingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState(null);
  const [isLastMinutePass, setIsLastMinutePass] = useState(false);
  const { user, token } = useAuth(); // ✅ get token directly



  const [formData, setFormData] = useState({
    teamName: '',
    teamMemberCount: 2,
    members: Array(4).fill(null).map(() => ({
      name: '', college: '', study: '', department: '', email: '', phone: ''
    })),
    paperTitle: '',
    abstract: '',
    paymentProof: null
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await axios.get(`/api/events/${id}`);
      setEvent(res.data);
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const checkRegistrationCount = async () => {
      try {
        const res = await axios.get(`/api/events/${id}/registration-count`);
        if (res.data.count >= event?.maxRegistrations) {
          setIsLastMinutePass(true);
        }
      } catch (err) {
        console.error('Error checking registration count:', err.message);
      }
    };
    if (event) checkRegistrationCount();
  }, [event]);

  const handleChange = (e, memberIndex, field) => {
    if (field !== undefined) {
      const updated = [...formData.members];
      updated[memberIndex][field] = e.target.value;
      setFormData({ ...formData, members: updated });
    } else {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const filledMembers = formData.members.filter(member => member.name.trim() !== '');
    const teamMemberCount = filledMembers.length;
  
    if (teamMemberCount < 2 || !formData.teamName || !formData.paperTitle || !formData.abstract || !formData.paymentProof) {
      return alert('❌ Please fill all required fields and have at least 2 team members.');
    }
  
    if (teamMemberCount > 4) {
      return alert('❌ Team size cannot exceed 4 members.');
    }
  
    const totalFees = isLastMinutePass
      ? Math.round(event.fee * 1.75 * teamMemberCount)
      : event.fee * teamMemberCount;
  
    const data = new FormData();
    data.append('teamName', formData.teamName);
    data.append('teamMemberCount', teamMemberCount.toString());
    data.append('paperTitle', formData.paperTitle);
    data.append('abstract', formData.abstract);
    data.append('isLastMinutePass', isLastMinutePass);
    data.append('paymentProof', formData.paymentProof);
    data.append('totalFees', totalFees);
    data.append('members', JSON.stringify(filledMembers));
  
    try {
      setLoading(true);
  
      const token = user?.token;
      console.log("🔐 Logged-in user:", user);
      console.log("🧾 Token:", token);
      console.log("🛠️ URL:", `/api/registrations/events/${event._id}/registrations`);
  
      const response = await axios.post(
        `/api/registrations/events/${event._id}/registrations`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('✅ Registration Success:', response.data);
  
      showNotification('✅ Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/my-events');
      }, 6000);
    } catch (err) {
      console.error('❌ Registration Error:', err.response?.data || err.message);
      setError('Registration failed. Please try again.');
      showNotification('❌ Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  if (loading) return <div className="flex justify-center p-8">Loading event details...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!event) return <div className="p-4">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Register for Event: {event.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="teamName"
            placeholder="Team Name *"
            required
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.teamName}
            onChange={handleChange}
          />
          <input
            type="number"
            name="teamMemberCount"
            min="1"
            max="4"
            required
            placeholder="Team Member Count *"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.teamMemberCount}
            onChange={handleChange}
          />
        </div>

        {[...Array(4)].map((_, index) => (
          <div key={index} className="border p-4 rounded-md bg-gray-50 space-y-2">
            <h4 className="font-semibold">Team Member {index + 1} (optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Name"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].name}
                onChange={(e) => handleChange(e, index, 'name')}
              />
              <input
                placeholder="College"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].college}
                onChange={(e) => handleChange(e, index, 'college')}
              />
              <input
                placeholder="UG/PG"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].study}
                onChange={(e) => handleChange(e, index, 'study')}
              />
              <select
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].department}
                onChange={(e) => handleChange(e, index, 'department')}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept}>{dept}</option>
                ))}
              </select>
              <input
                placeholder="Email"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].email}
                onChange={(e) => handleChange(e, index, 'email')}
              />
              <input
                placeholder="Phone Number"
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.members[index].phone}
                onChange={(e) => handleChange(e, index, 'phone')}
              />
            </div>
          </div>
        ))}

        <input
          name="paperTitle"
          placeholder="Paper Title *"
          required
          className="w-full border border-gray-300 rounded-md p-2"
          value={formData.paperTitle}
          onChange={handleChange}
        />
        <textarea
          name="abstract"
          placeholder="Abstract *"
          required
          className="w-full border border-gray-300 rounded-md p-2"
          rows="4"
          value={formData.abstract}
          onChange={handleChange}
        ></textarea>
        <div className="bg-gray-100 p-2 rounded-md">
        <input
  type="file"
  accept="image/*"
  onChange={(e) => setFormData({ ...formData, paymentProof: e.target.files[0] })}
/>
        </div>
        {isLastMinutePass && (
          <p className="text-red-600 font-semibold">
            ⚠ Last Minute Pass: 75% additional fee applies
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-2 rounded-md font-semibold hover:bg-teal-700"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default EventBookingPage;