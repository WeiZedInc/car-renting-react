import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import AdminSidebar from '../../components/AdminSidebar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Selected booking for details
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // For damage reports
  const [damageReportData, setDamageReportData] = useState({
    description: '',
    repairCost: 0,
    isCustomerResponsible: true,
    imageUrl: ''
  });
  const [isDamageFormOpen, setIsDamageFormOpen] = useState(false);
  
  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, statusFilter]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `/api/bookings?pageNumber=${currentPage}&pageSize=${pageSize}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      if (dateFilter.startDate && dateFilter.endDate) {
        url += `&startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`;
      }
      
      const response = await axios.get(url);
      setBookings(response.data.items);
      setTotalPages(response.data.totalPages);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, JSON.stringify(newStatus), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update the booking in the local state
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      setBookings(updatedBookings);
      
      // If we're viewing details, update the selected booking too
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      setError('Failed to update booking status. Please try again.');
      console.error(err);
    }
  };
  
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };
  
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };
  
  const handleAddDamageReport = () => {
    if (!selectedBooking) return;
    
    setDamageReportData({
      description: '',
      repairCost: 0,
      isCustomerResponsible: true,
      imageUrl: ''
    });
    setIsDamageFormOpen(true);
  };
  
  const handleDamageInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDamageReportData({
      ...damageReportData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDamageFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/damages', {
        bookingId: selectedBooking.id,
        description: damageReportData.description,
        repairCost: parseFloat(damageReportData.repairCost),
        isCustomerResponsible: damageReportData.isCustomerResponsible,
        imageUrl: damageReportData.imageUrl
      });
      
      setIsDamageFormOpen(false);
      
      // Refresh booking details
      const response = await axios.get(`/api/bookings/${selectedBooking.id}`);
      setSelectedBooking(response.data);
      
    } catch (err) {
      setError('Failed to add damage report. Please try again.');
      console.error(err);
    }
  };
  
  const formatDateRange = (start, end) => {
    return `${format(new Date(start), 'MMM d, yyyy')} - ${format(new Date(end), 'MMM d, yyyy')}`;
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
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user.firstName} {booking.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicle.make} {booking.vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.vehicle.year} • {booking.vehicle.licensePlate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateRange(booking.pickupDate, booking.returnDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${booking.totalPrice.toFixed(2)}</div>
                        <div className="mt-1">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Details
                        </button>
                        
                        {booking.status === 'Requested' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Approved')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'Completed')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div>
                <span className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Booking Details Modal */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Booking #{selectedBooking.id} Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Booking Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Information</h4>
                    
                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Booking Date:</span>
                        <span className="font-medium">
                          {format(new Date(selectedBooking.bookingDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Pickup Date:</span>
                        <span className="font-medium">
                          {format(new Date(selectedBooking.pickupDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Return Date:</span>
                        <span className="font-medium">
                          {format(new Date(selectedBooking.returnDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Pickup Location:</span>
                        <span className="font-medium">{selectedBooking.pickupLocation || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Return Location:</span>
                        <span className="font-medium">{selectedBooking.returnLocation || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            selectedBooking.status
                          )}`}
                        >
                          {selectedBooking.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="font-medium text-green-600">
                          ${selectedBooking.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium">{selectedBooking.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                            selectedBooking.paymentStatus
                          )}`}
                        >
                          {selectedBooking.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    {/* Damage Report Section */}
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Damage Report</h4>
                    {selectedBooking.damageReport ? (
                      <div className="bg-gray-50 p-4 rounded mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Report Date:</span>
                          <span className="font-medium">
                            {format(new Date(selectedBooking.damageReport.reportDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium">{selectedBooking.damageReport.description}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Repair Cost:</span>
                          <span className="font-medium text-red-600">
                            ${selectedBooking.damageReport.repairCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer Responsible:</span>
                          <span className="font-medium">
                            {selectedBooking.damageReport.isCustomerResponsible ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded mb-4 text-center">
                        <p className="text-gray-500">No damage report yet</p>
                        {selectedBooking.status === 'Completed' && (
                          <button
                            onClick={handleAddDamageReport}
                            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Add Damage Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Vehicle and Customer Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h4>
                    <div className="bg-gray-50 p-4 rounded mb-6">
                      <div className="flex items-center mb-4">
                        {selectedBooking.vehicle.imageUrl ? (
                          <img
                            src={selectedBooking.vehicle.imageUrl}
                            alt={`${selectedBooking.vehicle.make} ${selectedBooking.vehicle.model}`}
                            className="w-20 h-20 object-cover rounded mr-4"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center mr-4">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                        <div>
                          <h5 className="font-medium text-lg">
                            {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}
                          </h5>
                          <p className="text-gray-600">
                            {selectedBooking.vehicle.year} • {selectedBooking.vehicle.categoryName}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">License Plate:</span>
                          <span className="font-medium ml-2">{selectedBooking.vehicle.licensePlate}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Daily Rate:</span>
                          <span className="font-medium ml-2">${selectedBooking.vehicle.dailyRate.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Transmission:</span>
                          <span className="font-medium ml-2">{selectedBooking.vehicle.transmission}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fuel Type:</span>
                          <span className="font-medium ml-2">{selectedBooking.vehicle.fuelType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-2">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium ml-2">
                          {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium ml-2">{selectedBooking.user.email}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium ml-2">{selectedBooking.user.phoneNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium ml-2">{selectedBooking.user.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <div className="flex justify-end space-x-3">
                    {selectedBooking.status === 'Requested' && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Approved');
                            setSelectedBooking({...selectedBooking, status: 'Approved'});
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve Booking
                        </button>
                        <button
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Cancelled');
                            setSelectedBooking({...selectedBooking, status: 'Cancelled'});
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    
                    {selectedBooking.status === 'Approved' && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedBooking.id, 'Completed');
                          setSelectedBooking({...selectedBooking, status: 'Completed'});
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Mark as Completed
                      </button>
                    )}
                    
                    <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Damage Report Form Modal */}
        {isDamageFormOpen && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Add Damage Report
                </h3>
                <button
                  onClick={() => setIsDamageFormOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleDamageFormSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description of Damage
                  </label>
                  <textarea
                    name="description"
                    value={damageReportData.description}
                    onChange={handleDamageInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repair Cost ($)
                  </label>
                  <input
                    type="number"
                    name="repairCost"
                    value={damageReportData.repairCost}
                    onChange={handleDamageInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={damageReportData.imageUrl}
                    onChange={handleDamageInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isCustomerResponsible"
                      checked={damageReportData.isCustomerResponsible}
                      onChange={handleDamageInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Customer is responsible for the damage
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsDamageFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;