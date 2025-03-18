import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Search, Filter, X } from "lucide-react";

// Import components
import Button from "../components/ui/Button";
import EventCard from "../components/EventCard";
import Skeleton from "../components/ui/Skeleton";
import ViewModeToggle from "../components/ViewModeToggle";

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid");
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(data.map((event) => event.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    // Filter and sort events
    let result = [...events];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          (event.description &&
            event.description.toLowerCase().includes(term)) ||
          (event.location && event.location.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((event) => event.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case "date":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popularity":
        result.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
        break;
      default:
        break;
    }

    setFilteredEvents(result);
  }, [events, searchTerm, selectedCategory, sortBy]);

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((event) => event._id !== eventId));
  };

  const renderSkeletonLoader = () => {
    return (
      <div
        className={`grid grid-cols-1 ${
          viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : ""
        } gap-6`}
      >
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-md"
          >
            <Skeleton height="48" className="w-full" />
            <div className="p-4">
              <Skeleton height="6" className="w-3/4 mb-4" />
              <Skeleton height="4" className="w-1/2 mb-2" />
              <Skeleton height="4" className="w-1/3 mb-2" />
              <Skeleton height="4" className="w-2/3 mb-4" />
              <Skeleton height="16" className="w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton height="8" className="w-1/4" />
                <Skeleton height="8" className="w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mx-auto max-w-3xl my-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading events
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button size="sm" variant="danger" onClick={fetchEvents}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Events Calendar
              </h1>
              <Button
                variant="primary"
                className="mt-4 md:mt-0"
                icon={<Plus size={16} />}
                onClick={() => navigate("/events/create")}
              >
                Create New Event
              </Button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant={showFilters ? "primary" : "secondary"}
                  icon={<Filter size={16} />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>

                {/* View mode toggle */}
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
            </div>

            {/* Extended filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sortBy"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="date">Date (Upcoming first)</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                      setSortBy("date");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Events grid/list */}
        <div className="mt-6">
          {loading ? (
            renderSkeletonLoader()
          ) : (
            <>
              {filteredEvents.length === 0 ? (
                <div className="bg-white border rounded-lg py-12 px-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100">
                    <Calendar size={48} className="text-blue-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">
                    No events found
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {searchTerm || selectedCategory
                      ? "Try adjusting your filters to find more events."
                      : "There are no events scheduled. Create one to get started!"}
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/events/create")}
                    >
                      Create New Event
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onDelete={handleDeleteEvent}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Results summary */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-6 text-sm text-gray-500">
            Showing {filteredEvents.length} of {events.length} events
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedCategory && ` in category "${selectedCategory}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;