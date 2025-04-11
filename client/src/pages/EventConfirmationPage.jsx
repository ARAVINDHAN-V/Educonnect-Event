import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const PaymentPopup = ({ isOpen, onClose, registration, event, onPaymentSuccess }) => {

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/\D/g, '');
    const matches = v.match(/\d{1,4}/g);
    return matches ? matches.join(' ').substr(0, 19) : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    // Validate the form
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError('All fields are required');
      setProcessing(false);
      return;
    }

    // Simple validation for demo purposes
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Invalid card number');
      setProcessing(false);
      return;
    }

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Generate transaction ID
        const transactionId = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Create payment record
        const paymentData = {
          transactionId,
          date: new Date().toISOString(),
          customerName: cardName,
          customerEmail: registration.email || 'user@example.com', // Fallback
          amount: registration.amount || event.price || 0,
          status: 'completed',
          eventTitle: event.title,
          eventId: event._id,
          registrationId: registration._id
        };

        // Store payment data via API
        const token = localStorage.getItem('userToken');
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
          throw new Error('Failed to save payment information');
        }

        // Update registration payment status
        const updateRegResponse = await fetch(`/api/users/registrations/${registration._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentStatus: 'Paid' })
        });

        if (!updateRegResponse.ok) {
          throw new Error('Failed to update registration status');
        }

        setProcessing(false);
        onPaymentSuccess(paymentData);
      } catch (err) {
        setError(err.message);
        setProcessing(false);
      }
    }, 1500); // Simulate processing time
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            disabled={processing}
            aria-label="Close payment form"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between">
            <span className="text-gray-600">Event:</span>
            <span className="font-semibold text-gray-800">{event.title}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-blue-600">${registration.amount || event.price || 0}</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardNumber">Card Number</label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                disabled={processing}
                maxLength="19"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardName">Cardholder Name</label>
            <input
              id="cardName"
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              disabled={processing}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiryDate">Expiry Date</label>
              <input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    const month = value.slice(0, 2);
                    const year = value.slice(2);
                    setExpiryDate(value.length > 2 ? `${month}/${year}` : month);
                  }
                }}
                disabled={processing}
                maxLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvv">CVV</label>
              <div className="relative">
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  disabled={processing}
                  maxLength="3"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1 .257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow transition ${
              processing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            } mt-4`}
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-center text-gray-500">
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

const EventConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Fetch event details
        const eventResponse = await fetch(`/api/events/${id}`);
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event details');
        }
        
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Fetch user's registration for this event
        const regResponse = await fetch(`/api/users/registrations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!regResponse.ok) {
          throw new Error('Failed to fetch your registration details');
        }

        const regData = await regResponse.json();
        setRegistration(regData);
        setPaymentComplete(regData.paymentStatus === 'Paid');
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePaymentSuccess = (paymentData) => {
    setPaymentData(paymentData);
    setPaymentComplete(true);
    setShowPaymentPopup(false);
    
    // Update local registration data to reflect payment
    setRegistration(prev => ({
      ...prev,
      paymentStatus: 'Paid'
    }));
  };

  const viewPaymentDetails = () => {
    if (paymentData) {
      navigate(`/payments/${paymentData.transactionId}`);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8 h-64">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading confirmation details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/events" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition">
          Return to Events
        </Link>
      </div>
    </div>
  );
  
  if (!event || !registration) return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold text-yellow-800 mb-2">Registration Not Found</h2>
        <p className="text-yellow-700 mb-4">We couldn't find your registration information.</p>
        <Link to="/events" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition">
          Browse Events
        </Link>
      </div>
    </div>
  );

  // Generate a simple "ticket" ID based on registration ID
  const ticketId = registration._id.substring(0, 8).toUpperCase();

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-green-600">✅ Registration Successful!</h1>
          <p className="mt-4 text-gray-700">Thank you for registering. You’ll receive confirmation soon.</p>
        </div>
      </div>
        
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{event.title}</h2>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{event.time || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Ticket Type</p>
                  <p className="font-medium">{registration.ticketType}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-500 mb-1">Ticket ID</p>
                  <div className="font-mono bg-blue-50 text-blue-700 py-2 px-4 rounded-lg border border-blue-100 tracking-wider">
                    {ticketId}
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    registration.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {registration.paymentStatus === 'Paid' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {registration.paymentStatus}
                  </div>
                </div>
              </div>
              
              {paymentComplete && paymentData && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                  <button 
                    onClick={viewPaymentDetails}
                    className="inline-flex items-center font-mono text-blue-600 hover:text-blue-800 transition hover:underline"
                  >
                    {paymentData.transactionId}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-700">We've sent a confirmation email to your registered email address.</p>
                <p className="text-blue-600 mt-1">Please bring your ticket ID to the event for check-in.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {!paymentComplete && (
              <button 
                onClick={() => setShowPaymentPopup(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Complete Payment
              </button>
            )}
            
            <Link 
              to={`/events/${id}`} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Event Details
            </Link>
            
            <Link 
              to="/events" 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
                Browse All Events
            </Link>
            
            {paymentComplete && (
              <button 
                onClick={viewPaymentDetails}
                className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                View Payment Details
              </button>
            )}
          </div>
        </div>
      </div>
      {showPaymentPopup && (
        <PaymentPopup 
          isOpen={showPaymentPopup}
          onClose={() => setShowPaymentPopup(false)}
          registration={registration}
          event={event}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EventConfirmationPage;