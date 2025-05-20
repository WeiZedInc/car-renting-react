import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for booking dates
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd')
  });
  
  // State for review form
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ text: '', type: '' });
  
  // State for checking if user can review
  const [canReview, setCanReview] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch vehicle details
        const vehicleResponse = await axios.get(`/api/vehicles/${id}`);
        setVehicle(vehicleResponse.data);
        
        // Fetch vehicle reviews
        const reviewsResponse = await axios.get(`/api/vehicles/${id}/reviews`);
        setReviews(reviewsResponse.data);
        
        // Check if user can review this vehicle (has completed a booking but hasn't reviewed yet)
        if (isAuthenticated) {
          try {
            const canReviewResponse = await axios.get(`/api/reviews/can-review/${id}`);
            setCanReview(canReviewResponse.data.canReview);
            setShowReviewForm(canReviewResponse.data.canReview);
          } catch (err) {
            console.error('Error checking if user can review:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle details. Please try again.');
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isAuthenticated]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/booking/${id}?start=${dateRange.startDate}&end=${dateRange.endDate}` 
        } 
      });
      return;
    }
    
    navigate(`/booking/${id}?start=${dateRange.startDate}&end=${dateRange.endDate}`);
  };
  
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setReviewSubmitting(true);
      setReviewMessage({ text: '', type: '' });
      
      await axios.post('/api/reviews', {
        vehicleId: parseInt(id, 10),
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      // Refresh reviews
      const reviewsResponse = await axios.get(`/api/vehicles/${id}/reviews`);
      setReviews(reviewsResponse.data);
      
      // Reset form and hide it
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      setCanReview(false);
      
      setReviewMessage({
        text: 'Thank you for your review!',
        type: 'success'
      });
      
      // Refresh vehicle to update average rating
      const vehicleResponse = await axios.get(`/api/vehicles/${id}`);
      setVehicle(vehicleResponse.data);
      
    } catch (err) {
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      setReviewMessage({
        text: errorMessage,
        type: 'error'
      });
      
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
          <p className="mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }
  
  const calculateTotalPrice = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    let price = vehicle.dailyRate * days;
    
    // Apply discount for 3+ days
    if (days >= 3) {
      price = price * 0.9; // 10% discount
    }
    
    return price.toFixed(2);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <button onClick={() => navigate('/vehicles')} className="hover:text-gray-900">
          Vehicles
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">
          {vehicle.make} {vehicle.model}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Details Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Vehicle Image */}
            <div className="h-64 sm:h-80 md:h-96 bg-gray-200">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            {/* Vehicle Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{vehicle.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                  {vehicle.categoryName}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Vehicle Specifications</h2>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Year:</span>
                      <span>{vehicle.year}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Transmission:</span>
                      <span>{vehicle.transmission}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Fuel Type:</span>
                      <span>{vehicle.fuelType}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Seats:</span>
                      <span>{vehicle.seats}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Color:</span>
                      <span>{vehicle.color || 'N/A'}</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="font-medium w-32">License Plate:</span>
                      <span>{vehicle.licensePlate}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3">Pricing & Availability</h2>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Daily Rate:</span>
                      <span className="text-green-600 font-bold">${vehicle.dailyRate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Status:</span>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === 'Available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium w-32">Discounts:</span>
                      <span>10% off for bookings of 3+ days</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {vehicle.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700">{vehicle.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Reviews ({reviews.length})
                </h2>
                {canReview && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Write a Review
                  </button>
                )}
              </div>
              
              {reviewMessage.text && (
                <div
                  className={`mb-6 p-4 rounded ${
                    reviewMessage.type === 'success' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}
              
              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Write Your Review</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-2xl focus:outline-none"
                          >
                            <span 
                              className={star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          </button>
                        ))}
                        <span className="ml-2 text-gray-600">
                          {reviewForm.rating} out of 5
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comment
                      </label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Share your experience with this vehicle..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                          reviewSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No reviews yet. Be the first to review this vehicle!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900">{review.userName}</div>
                            <span className="mx-2 text-gray-400">•</span>
                            <div className="text-sm text-gray-600">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-gray-700">{review.comment}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Book this vehicle</h2>
              
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">${vehicle.dailyRate.toFixed(2)}</span>
                  <span className="text-lg text-gray-600 ml-2">/ day</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{vehicle.averageRating.toFixed(1)}</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="text-gray-600">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  min={dateRange.startDate}
                  required
                />
              </div>
              
              {/* Price Details */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Daily rate</span>
                  <span>${vehicle.dailyRate.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    Number of days
                  </span>
                  <span>
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)
                      )
                    )}
                  </span>
                </div>
                
                {Math.ceil(
                  (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)
                ) >= 3 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>3+ day discount</span>
                    <span>-10%</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>
              
              <button
                onClick={handleBookNow}
                disabled={vehicle.status !== 'Available'}
                className={`w-full py-3 rounded-md font-medium ${
                  vehicle.status === 'Available'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                }`}
              >
                {vehicle.status === 'Available' ? 'Book Now' : 'Currently Unavailable'}
              </button>
              
              {vehicle.status !== 'Available' && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  This vehicle is currently not available for booking.
                </p>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p>You won't be charged yet</p>
                <p className="mt-1">Free cancellation up to 24 hours before pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;