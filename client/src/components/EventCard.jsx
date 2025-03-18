import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, ChevronDown, Trash2, Edit, Eye } from "lucide-react";

import Button from "./ui/Button";
import Badge from "./ui/Badge";

const EventCard = ({ event, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (isDeleteConfirming) {
      try {
        const response = await fetch(`/api/events/${event._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onDelete(event._id);
        } else {
          throw new Error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    } else {
      setIsDeleteConfirming(true);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getEventStatusBadge = () => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (eventDate < now) {
      return <Badge variant="danger">Past</Badge>;
    }

    const daysDiff = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));

    if (daysDiff < 7) {
      return <Badge variant="warning">Upcoming</Badge>;
    }

    return <Badge variant="success">Scheduled</Badge>;
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <h3 className="text-white text-xl font-semibold px-4 text-center">
              {event.title}
            </h3>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          {getEventStatusBadge()}
          {event.category && <Badge variant="primary">{event.category}</Badge>}
        </div>
      </div>

      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h2>

        <div className="mb-3 space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>{formatTime(event.date)}</span>
          </div>

          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-2" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.attendees && (
            <div className="flex items-center text-gray-600">
              <Users size={16} className="mr-2" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => navigate(`/events/${event._id}`)}
        >
          View
        </Button>

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
              <div className="py-1" role="menu" aria-orientation="vertical">
                <Link
                  to={`/events/${event._id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Event
                </Link>

                <button
                  className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                    isDeleteConfirming
                      ? "text-red-700 font-semibold"
                      : "text-gray-700"
                  } hover:bg-gray-100`}
                  onClick={handleDelete}
                  role="menuitem"
                >
                  <Trash2 size={16} className="mr-2" />
                  {isDeleteConfirming ? "Confirm Delete?" : "Delete Event"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;