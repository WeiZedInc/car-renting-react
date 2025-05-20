import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd')
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoryResponse = await axios.get('/api/categories');
        setCategories(categoryResponse.data);
        
        // Fetch available vehicles for the selected date range
        const vehicleResponse = await axios.get(
          `/api/vehicles/available?startDate=${dateRange.start}&endDate=${dateRange.end}`
        );
        
        setVehicles(vehicleResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange]);
  
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    
    try {
      setLoading(true);
      
      if (categoryId) {
        const response = await axios.get(`/api/vehicles/category/${categoryId}`);
        setVehicles(response.data);
      } else {
        const response = await axios.get(
          `/api/vehicles/available?startDate=${dateRange.start}&endDate=${dateRange.end}`
        );
        setVehicles(response.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles by category:', error);
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/vehicles/search?query=${searchQuery}`);
      setVehicles(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setLoading(false);
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBookNow = (vehicleId) => {
    navigate(`/booking/${vehicleId}?start=${dateRange.start}&end=${dateRange.end}`);
  };
  
  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Vehicles</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
            <input
              type="date"
              name="start"
              className="w-full p-2 border border-gray-300 rounded"
              value={dateRange.start}
              onChange={handleDateChange}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
            <input
              type="date"
              name="end"
              className="w-full p-2 border border-gray-300 rounded"
              value={dateRange.end}
              onChange={handleDateChange}
              min={dateRange.start}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-l"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
          <p className="mt-4">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl">No vehicles available for the selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="border rounded-lg overflow-hidden shadow-lg">
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
                
                <p className="text-gray-600">{vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}</p>
                
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{vehicle.averageRating.toFixed(1)}</span>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-lg font-bold">${vehicle.dailyRate.toFixed(2)}<span className="text-sm font-normal text-gray-600">/day</span></div>
                  
                  <div className="flex">
                    <button
                      className="text-blue-500 mr-2 hover:underline"
                      onClick={() => handleViewDetails(vehicle.id)}
                    >
                      Details
                    </button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => handleBookNow(vehicle.id)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;