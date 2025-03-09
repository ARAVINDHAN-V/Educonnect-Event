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
    if (cardNumber.length < 16) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={processing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between">
            <span>Event:</span>
            <span className="font-semibold">{event.title}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Amount:</span>
            <span className="font-semibold">${registration.amount || event.price || 0}</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              disabled={processing}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              disabled={processing}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded px-3 py-2"
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                placeholder="123"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                disabled={processing}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white font-medium py-2 px-4 rounded ${
              processing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
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

  if (loading) return <div className="flex justify-center p-8">Loading confirmation details...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!event || !registration) return <div className="p-4">Registration information not found</div>;

  // Generate a simple "ticket" ID based on registration ID
  const ticketId = registration._id.substring(0, 8).toUpperCase();

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
        <div className="bg-green-500 p-6 text-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Registration Confirmed!</h1>
          <p>Thank you for registering for our event</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">{event.title}</h2>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Time:</span>
                <span>{event.time || 'Not specified'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Location:</span>
                <span>{event.location || 'Not specified'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Ticket Type:</span>
                <span>{registration.ticketType}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Ticket ID:</span>
                <span className="font-mono">{ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Status:</span>
                <span className={registration.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                  {registration.paymentStatus}
                </span>
              </div>
              {paymentComplete && paymentData && (
                <div className="flex justify-between mt-2">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="font-mono text-blue-600 cursor-pointer hover:underline" onClick={viewPaymentDetails}>
                    {paymentData.transactionId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">We've sent a confirmation email to your registered email address.</p>
              <p className="text-gray-600">Please bring your ticket ID to the event for check-in.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              {!paymentComplete && (
                <button 
                  onClick={() => setShowPaymentPopup(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center"
                >
                  Complete Payment
                </button>
              )}
              
              <Link 
                to={`/events/${id}`} 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center"
              >
                Return to Event Details
              </Link>
              <Link 
                to="/events" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
              >
                Browse More Events
              </Link>
              {paymentComplete && (
                <Link 
                  to="/payments" 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
                >
                  View All Payments
                </Link>
              )}
            </div>
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