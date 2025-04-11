import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const EventCard = ({ event, onDelete }) => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onDelete(event._id);
      } else {
        alert("Failed to delete event");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getEventStatusBadge = () => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const diffDays = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));

    if (eventDate < now) return <Badge variant="danger">Past</Badge>;
    if (diffDays < 7) return <Badge variant="warning">Upcoming</Badge>;
    return <Badge variant="success">Scheduled</Badge>;
  };

  const isCreator =
    user?._id === event?.createdBy?._id ||
    user?._id === event?.createdBy?.toString();

  return (
    <div className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative">
        {event.imageUrl?.trim() ? (
          <img
            src={
              event.imageUrl.trim().startsWith("http")
                ? event.imageUrl.trim()
                : `http://localhost:5000${event.imageUrl.trim()}`
            }
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <h3 className="text-white text-xl font-semibold text-center px-4">
              {event.title}
            </h3>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2 flex-wrap">
          {getEventStatusBadge()}
          {event.category && <Badge variant="primary">{event.category}</Badge>}
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h2>
        <div className="mb-3 space-y-2 text-gray-600">
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>{formatTime(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center">
              <MapPin size={16} className="mr-2" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.attendees && (
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>
        <p className="text-gray-700 line-clamp-2">{event.description}</p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => navigate(`/events/${event._id}`)}
        >
          View
        </Button>

        {/* Actions Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronDown size={16} />}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Actions
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <Link
                  to={`/events/${event._id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Event
                </Link>

                {isCreator && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDelete();
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Event
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
