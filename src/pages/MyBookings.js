import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, isPast, isToday } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for booking extension
  const [extendBookingId, setExtendBookingId] = useState(null);
  const [extendDate, setExtendDate] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState('');
  
  // State for booking cancellation
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    fetchBookings();
    
    // Check if we have a success message from another page
    if (location.state?.success) {
      setSuccessMessage('Your booking has been successfully created!');
      
      // Clear the state after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/bookings/my');
      setBookings(response.data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };
  
  const handleExtendClick = (booking) => {
    setExtendBookingId(booking.id);
    
    // Set default extend date to 3 days after current return date
    const currentReturnDate = new Date(booking.returnDate);
    const defaultExtendDate = new Date(currentReturnDate);
    defaultExtendDate.setDate(currentReturnDate.getDate() + 3);
    
    setExtendDate(format(defaultExtendDate, 'yyyy-MM-dd'));
    setExtendError('');
    setShowExtendModal(true);
  };
  
  const handleCancelClick = (bookingId) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };
  
  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    
    if (!extendDate) {
      setExtendError('Please select a new return date');
      return;
    }
    
    const selectedDate = new Date(extendDate);
    const booking = bookings.find(b => b.id === extendBookingId);
    const currentReturnDate = new Date(booking.returnDate);
    
    if (selectedDate <= currentReturnDate) {
      setExtendError('New return date must be after current return date');
      return;
    }
    
    try {
      setExtending(true);
      setExtendError('');
      
      await axios.put(`/api/bookings/${extendBookingId}/extend`, JSON.stringify(selectedDate), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setShowExtendModal(false);
      setExtendBookingId(null);
      setExtendDate('');
      
      // Refresh bookings
      await fetchBookings();
      
      setSuccessMessage('Your booking has been successfully extended!');
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      let errorMessage = 'Failed to extend booking. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      setExtendError(errorMessage);
      console.error(err);
    } finally {
      setExtending(false);
    }
  };
  
  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      
      await axios.put(`/api/bookings/${cancelBookingId}/cancel`);
      
      setShowCancelModal(false);
      setCancelBookingId(null);
      
      // Refresh bookings
      await fetchBookings();
      
      setSuccessMessage('Your booking has been successfully cancelled!');
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDateRange = (start, end) => {
    return `${format(new Date(start), 'MMM d, yyyy')} - ${format(new Date(end), 'MMM d, yyyy')}`;
  };
  
  const canExtendBooking = (booking) => {
    return (
      booking.status === 'Approved' &&
      !isPast(new Date(booking.returnDate)) &&
      !isToday(new Date(booking.returnDate))
    );
  };
  
  const canCancelBooking = (booking) => {
    return (
      (booking.status === 'Requested' || booking.status === 'Approved') &&
      !isPast(new Date(booking.pickupDate))
    );
  };
  
  const canReviewVehicle = (booking) => {
    return (
      booking.status === 'Completed' &&
      isPast(new Date(booking.returnDate))
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {successMessage && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">No Bookings Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't made any bookings yet. Start exploring our vehicle collection to find your perfect ride.
          </p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold">
                        {booking.vehicle.make} {booking.vehicle.model}
                      </h2>
                      <span
                        className={`ml-3 px-2 py-1 text-xs rounded-full font-semibold ${getStatusBadgeClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Booking #{booking.id} • {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right mt-2 md:mt-0">
                    <div className="text-lg font-bold">${booking.totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusBadgeClass(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                      <span className="ml-2">{booking.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rental Period</h3>
                    <p className="mt-1">{formatDateRange(booking.pickupDate, booking.returnDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pickup Location</h3>
                    <p className="mt-1">{booking.pickupLocation || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Return Location</h3>
                    <p className="mt-1">{booking.returnLocation || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/vehicles/${booking.vehicle.id}`)}
                    className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                  >
                    Vehicle Details
                  </button>
                  
                  {canExtendBooking(booking) && (
                    <button
                      onClick={() => handleExtendClick(booking)}
                      className="px-3 py-1 border border-blue-300 rounded text-blue-700 hover:bg-blue-50"
                    >
                      Extend Booking
                    </button>
                  )}
                  
                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => handleCancelClick(booking.id)}
                      className="px-3 py-1 border border-red-300 rounded text-red-700 hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                  
                  {canReviewVehicle(booking) && (
                    <button
                      onClick={() => navigate(`/vehicles/${booking.vehicle.id}`, { state: { openReview: true } })}
                      className="px-3 py-1 border border-green-300 rounded text-green-700 hover:bg-green-50"
                    >
                      Review Vehicle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Extend Booking Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Extend Booking</h3>
            </div>
            
            <form onSubmit={handleExtendSubmit} className="p-6">
              {extendError && (
                <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
                  {extendError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Return Date
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={format(
                    new Date(bookings.find(b => b.id === extendBookingId)?.returnDate),
                    'MMM d, yyyy'
                  )}
                  disabled
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Return Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                  min={format(
                    new Date(
                      new Date(bookings.find(b => b.id === extendBookingId)?.returnDate).getTime() + 
                      24 * 60 * 60 * 1000
                    ),
                    'yyyy-MM-dd'
                  )}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    extending ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={extending}
                >
                  {extending ? 'Processing...' : 'Extend Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Cancel Booking</h3>
            </div>
            
            <div className="p-6">
              <p className="mb-4">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  No, Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                    cancelling ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={cancelling}
                >
                  {cancelling ? 'Processing...' : 'Yes, Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;