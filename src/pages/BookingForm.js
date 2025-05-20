import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

const BookingForm = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    pickupDate: queryParams.get('start') || format(new Date(), 'yyyy-MM-dd'),
    returnDate: queryParams.get('end') || format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
    pickupLocation: '',
    returnLocation: '',
    paymentMethod: 'PayNow'
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/vehicles/${vehicleId}`);
        setVehicle(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vehicle details. Please try again.');
        setLoading(false);
      }
    };
    
    const fetchUserDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await axios.get('/api/users/documents', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserDocuments(response.data);
        }
        
        setDocumentsLoading(false);
      } catch (err) {
        console.error('Error fetching user documents:', err);
        setDocumentsLoading(false);
      }
    };
    
    fetchVehicle();
    fetchUserDocuments();
  }, [vehicleId]);
  
  useEffect(() => {
    // Calculate total price whenever vehicle data or dates change
    if (vehicle) {
      const days = differenceInDays(
        new Date(bookingData.returnDate),
        new Date(bookingData.pickupDate)
      );
      
      // Ensure at least 1 day
      const rentalDays = days > 0 ? days : 1;
      
      // Apply discount for 3+ days
      let price = vehicle.dailyRate * rentalDays;
      if (rentalDays >= 3) {
        price = price * 0.9; // 10% discount
      }
      
      setTotalPrice(price);
    }
  }, [vehicle, bookingData.pickupDate, bookingData.returnDate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    
    // Check if user has required documents
    const hasDriversLicense = userDocuments.some(doc => 
      doc.documentType === 'DriversLicense' && doc.isVerified
    );
    
    const hasId = userDocuments.some(doc => 
      doc.documentType === 'ID' && doc.isVerified
    );
    
    // If documents are missing, show upload form
    if (!hasDriversLicense || !hasId) {
      navigate('/documents/upload', { 
        state: { 
          redirectTo: location.pathname + location.search,
          missingDocuments: {
            driversLicense: !hasDriversLicense,
            id: !hasId
          }
        } 
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const bookingPayload = {
        vehicleId: parseInt(vehicleId),
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation,
        paymentMethod: bookingData.paymentMethod
      };
      
      await axios.post('/api/bookings', bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to booking confirmation or my bookings page
      navigate('/bookings/my', { state: { success: true } });
      
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to create booking. Please try again.');
      }
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <div className="container mx-auto p-4">
        <p>Vehicle not found.</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate('/vehicles')}
        >
          Browse Vehicles
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book Your Vehicle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Vehicle Details Card */}
        <div className="md:col-span-1">
          <div className="border rounded-lg overflow-hidden shadow-lg">
            {/* Vehicle Image */}
            <div className="h-48 bg-gray-200">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            {/* Vehicle Details */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">
                  {vehicle.make} {vehicle.model}
                </h2>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {vehicle.categoryName}
                </div>
              </div>
              
              <p className="text-gray-600 mt-1">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
              
              <div className="mt-2 flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{vehicle.averageRating.toFixed(1)}</span>
              </div>
              
              <div className="mt-4">
                <p className="font-bold text-lg">${vehicle.dailyRate.toFixed(2)}<span className="text-sm font-normal text-gray-600">/day</span></p>
              </div>
              
              {/* Features List */}
              <div className="mt-4">
                <h3 className="font-bold text-gray-700">Features:</h3>
                <ul className="mt-2 text-gray-600">
                  <li>• {vehicle.seats} Seats</li>
                  <li>• {vehicle.transmission} Transmission</li>
                  <li>• {vehicle.fuelType} Engine</li>
                  {vehicle.color && <li>• {vehicle.color} Color</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={bookingData.pickupDate}
                    onChange={handleInputChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={bookingData.returnDate}
                    onChange={handleInputChange}
                    min={bookingData.pickupDate}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={bookingData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Return Location
                </label>
                <input
                  type="text"
                  name="returnLocation"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={bookingData.returnLocation}
                  onChange={handleInputChange}
                  placeholder="Enter return location"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      bookingData.paymentMethod === 'PayNow'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setBookingData({...bookingData, paymentMethod: 'PayNow'})}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PayNow"
                        checked={bookingData.paymentMethod === 'PayNow'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <div>
                        <p className="font-medium">Pay Now</p>
                        <p className="text-sm text-gray-600">
                          Pay the full amount online now
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${
                      bookingData.paymentMethod === 'PayAtPickup'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setBookingData({...bookingData, paymentMethod: 'PayAtPickup'})}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PayAtPickup"
                        checked={bookingData.paymentMethod === 'PayAtPickup'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <div>
                        <p className="font-medium">Pay at Pickup</p>
                        <p className="text-sm text-gray-600">
                          Pay when you pick up the vehicle
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Price Summary</h3>
                <div className="flex justify-between mb-2">
                  <span>Base Rate:</span>
                  <span>${vehicle.dailyRate.toFixed(2)} x {differenceInDays(
                    new Date(bookingData.returnDate),
                    new Date(bookingData.pickupDate)
                  ) || 1} days</span>
                </div>
                
                {(differenceInDays(
                  new Date(bookingData.returnDate),
                  new Date(bookingData.pickupDate)
                ) || 1) >= 3 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>3+ Day Discount:</span>
                    <span>-10%</span>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Required Documents Warning */}
              {documentsLoading ? (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <p>Checking document requirements...</p>
                </div>
              ) : userDocuments.length === 0 || 
                !userDocuments.some(doc => doc.documentType === 'DriversLicense' && doc.isVerified) || 
                !userDocuments.some(doc => doc.documentType === 'ID' && doc.isVerified) ? (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
                  <h3 className="font-bold">Required Documents</h3>
                  <p className="mt-1">
                    You'll need to upload the following documents before booking:
                  </p>
                  <ul className="mt-2 list-disc list-inside">
                    {!userDocuments.some(doc => doc.documentType === 'DriversLicense' && doc.isVerified) && (
                      <li>Valid Driver's License</li>
                    )}
                    {!userDocuments.some(doc => doc.documentType === 'ID' && doc.isVerified) && (
                      <li>ID Card or Passport</li>
                    )}
                  </ul>
                  <p className="mt-2">
                    You will be prompted to upload these after clicking "Book Now"
                  </p>
                </div>
              ) : null}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded hover:bg-gray-400"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className={`bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 ${
                    submitting ? 'opacity-50 cursor-wait' : ''
                  }`}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Book Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;