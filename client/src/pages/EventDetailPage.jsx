import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon, DocumentIcon, XMarkIcon, PaperAirplaneIcon, ArrowLeftIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi there! I can help answer any questions about this event. What would you like to know?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        const data = await response.json();
        setEvent(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      navigate('/events');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    // Add user message to chat
    setChatMessages([...chatMessages, { sender: 'user', text: userInput }]);
    setUserInput('');
    setIsTyping(true);
    
    // Simulate bot thinking and responding based on PDF data
    setTimeout(() => {
      let botResponse = '';
      const lowerCaseInput = userInput.toLowerCase();
      
      if (event) {
        if (lowerCaseInput.includes('date') || lowerCaseInput.includes('when')) {
          botResponse = `This event takes place on ${new Date(event.date).toLocaleDateString()}.`;
        } else if (lowerCaseInput.includes('time')) {
          botResponse = `The event starts at ${event.time || 'a time that is not yet specified'}.`;
        } else if (lowerCaseInput.includes('location') || lowerCaseInput.includes('where')) {
          botResponse = `The event will be held at ${event.location || 'a location that is not yet specified'}.`;
        } else if (lowerCaseInput.includes('price') || lowerCaseInput.includes('cost') || lowerCaseInput.includes('how much')) {
          botResponse = event.price !== undefined 
            ? `The event costs $${event.price.toFixed(2)} per person.` 
            : 'Price information is not available for this event.';
        } else if (lowerCaseInput.includes('register') || lowerCaseInput.includes('sign up') || lowerCaseInput.includes('join')) {
          botResponse = 'You can register for this event by clicking the "Register Now" button at the bottom of this page.';
        } else if (lowerCaseInput.includes('cancel') || lowerCaseInput.includes('refund')) {
          botResponse = 'For cancellation and refund policies, please check the event brochure or contact the event organizer directly.';
        } else {
          botResponse = "I'm not sure about that. You might find more details in the event description or brochure. Is there something specific you'd like to know about the event date, location, price, or registration process?";
        }
      } else {
        botResponse = "I'm having trouble accessing the event details right now. Please try again later.";
      }
      
      setChatMessages(prevMessages => [...prevMessages, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-xl text-gray-700 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen flex justify-center items-center bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-xl text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Link to="/events" className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200">
            Return to Events
          </Link>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="h-screen flex justify-center items-center bg-teal-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-xl text-center">
          <div className="text-teal-500 text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the event you're looking for.</p>
          <Link to="/events" className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200">
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  // Format date for display
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* Back button with improved styling */}
        <div className="mb-8">
          <Link to="/events" className="inline-flex items-center text-teal-600 hover:text-teal-800 transition duration-200 font-medium">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>

        {/* Event Card with improved design */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl mx-auto max-w-6xl">
          {/* Hero Image with overlay gradient */}
          {event.imageUrl && (
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <div className="max-w-3xl">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">{event.title}</h1>
                  <p className="text-white/80 text-lg md:text-xl max-w-2xl">
                    {formattedDate} {event.time && `• ${event.time}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* If no image, display a colored header instead */}
          {!event.imageUrl && (
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 sm:p-12">
              <div className="max-w-3xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
                <p className="text-white/80 text-lg md:text-xl">
                  {formattedDate} {event.time && `• ${event.time}`}
                </p>
              </div>
            </div>
          )}
          
          <div className="p-6 sm:p-8 md:p-10">
            {/* Action buttons with improved design */}
            <div className="flex flex-wrap justify-end gap-3 mb-8">
              <Link 
                to={`/events/${id}/edit`} 
                className="flex items-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button 
                onClick={handleDelete} 
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-200"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
              <Link 
                to={`/events/${id}/registrations`} 
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-200"
              >
                <UserGroupIcon className="w-4 h-4 mr-2" />
                Registrations
              </Link>
            </div>

            {/* Event Info Grid with improved responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Left column - Event details (now spans 1 column on large screens) */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Event Details</h2>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full mr-4">
                    <CalendarIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Date & Time</h3>
                    <p className="text-gray-800 font-medium">{formattedDate}</p>
                    <p className="text-gray-800 font-medium">{event.time || 'Time not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full mr-4">
                    <MapPinIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Location</h3>
                    <p className="text-gray-800 font-medium">{event.location || 'Location not specified'}</p>
                  </div>
                </div>

                {event.price !== undefined && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full mr-4">
                      <CurrencyDollarIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Price</h3>
                      <p className="text-gray-800 font-medium">${event.price.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {event.brochureUrl && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-teal-100 p-3 rounded-full mr-4">
                      <DocumentIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-medium">Event Brochure</h3>
                      <a 
                        href={event.brochureUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 font-medium transition duration-200"
                      >
                        Download Brochure
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Description (now spans 2 columns on large screens) */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">About This Event</h2>
                <div className="prose prose-teal max-w-none">
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>

            {/* Registration Button with enhanced design */}
            <div className="text-center mt-12 mb-4">
              <Link 
                to={`/events/${id}/eventbooking`} 
                className="inline-block bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                Register Now
              </Link>
              <p className="text-gray-500 mt-3">Secure your spot at this exclusive event!</p>
            </div>
          </div>
        </div>

        {/* Chatbot button with enhanced design */}
        <button 
          onClick={() => setChatOpen(true)} 
          className={`fixed bottom-6 right-6 bg-teal-500 text-white p-4 rounded-full shadow-xl hover:bg-teal-600 transition duration-200 z-20 ${chatOpen ? 'hidden' : 'flex'} hover:scale-110`}
          aria-label="Open chat assistant"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>

        {/* Chatbot panel with improved design */}
        {chatOpen && (
          <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden border border-gray-200 transition-all duration-300">
            {/* Chat header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Event Assistant</h3>
              </div>
              <button 
                onClick={() => setChatOpen(false)} 
                className="text-white hover:text-teal-100 transition duration-200 p-1 rounded-full hover:bg-white/10"
                aria-label="Close chat"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Chat messages with improved styling */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto max-h-96 space-y-3 bg-gray-50"
            >
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`${
                    msg.sender === 'user' 
                      ? 'ml-auto bg-teal-500 text-white' 
                      : 'mr-auto bg-white border border-gray-200 text-gray-800'
                  } p-3 rounded-2xl max-w-[80%] shadow-sm`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="mr-auto bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="h-2 w-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat input with improved design */}
            <form onSubmit={handleChatSubmit} className="border-t border-gray-200 p-3 flex bg-white">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about this event..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-teal-500 text-white px-4 py-3 rounded-r-lg hover:bg-teal-600 transition duration-200"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;