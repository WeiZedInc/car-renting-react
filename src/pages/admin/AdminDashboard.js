import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    reservedVehicles: 0,
    underMaintenanceVehicles: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0
  });
  
  const [bookingsByCategory, setBookingsByCategory] = useState([]);
  const [bookingsByMonth, setBookingsByMonth] = useState([]);
  const [vehiclePerformance, setVehiclePerformance] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, these would be separate API calls
      // For simplicity, we'll simulate the responses with mock data
      
      // Fetch dashboard statistics
      // const statsResponse = await axios.get('/api/admin/dashboard/stats');
      // setStats(statsResponse.data);
      
      // Mock data
      setStats({
        totalBookings: 245,
        pendingBookings: 18,
        activeBookings: 42,
        completedBookings: 185,
        totalVehicles: 87,
        availableVehicles: 53,
        reservedVehicles: 27,
        underMaintenanceVehicles: 7,
        totalRevenue: 128450.75,
        thisMonthRevenue: 18750.25,
        lastMonthRevenue: 17250.50
      });
      
      // Fetch bookings by category
      // const categoryResponse = await axios.get('/api/admin/dashboard/bookings-by-category');
      // setBookingsByCategory(categoryResponse.data);
      
      // Mock data
      setBookingsByCategory([
        { name: 'SUV', value: 87 },
        { name: 'Sedan', value: 63 },
        { name: 'Luxury', value: 42 },
        { name: 'Economy', value: 35 },
        { name: 'Sports', value: 18 }
      ]);
      
      // Fetch bookings by month
      // const monthlyResponse = await axios.get('/api/admin/dashboard/bookings-by-month');
      // setBookingsByMonth(monthlyResponse.data);
      
      // Mock data
      setBookingsByMonth([
        { name: 'Jan', bookings: 18, revenue: 9200 },
        { name: 'Feb', bookings: 24, revenue: 12000 },
        { name: 'Mar', bookings: 22, revenue: 11500 },
        { name: 'Apr', bookings: 28, revenue: 14000 },
        { name: 'May', bookings: 32, revenue: 16000 },
        { name: 'Jun', bookings: 36, revenue: 18000 },
        { name: 'Jul', bookings: 38, revenue: 19000 },
        { name: 'Aug', bookings: 34, revenue: 17000 },
        { name: 'Sep', bookings: 30, revenue: 15000 },
        { name: 'Oct', bookings: 26, revenue: 13000 },
        { name: 'Nov', bookings: 22, revenue: 11000 },
        { name: 'Dec', bookings: 18, revenue: 9000 }
      ]);
      
      // Fetch top performing vehicles
      // const vehiclesResponse = await axios.get('/api/admin/dashboard/top-vehicles');
      // setVehiclePerformance(vehiclesResponse.data);
      
      // Mock data
      setVehiclePerformance([
        { name: 'Toyota Camry', bookings: 24, revenue: 12000, rating: 4.8 },
        { name: 'Honda CR-V', bookings: 22, revenue: 13200, rating: 4.7 },
        { name: 'Ford Mustang', bookings: 18, revenue: 14400, rating: 4.9 },
        { name: 'BMW 5 Series', bookings: 16, revenue: 16000, rating: 4.8 },
        { name: 'Audi Q5', bookings: 14, revenue: 11200, rating: 4.6 }
      ]);
      
      // Fetch recent bookings
      // const recentResponse = await axios.get('/api/admin/dashboard/recent-bookings');
      // setRecentBookings(recentResponse.data);
      
      // Mock data
      setRecentBookings([
        {
          id: 1245,
          customer: 'John Smith',
          vehicle: 'Toyota Camry',
          status: 'Approved',
          date: '2023-05-15 - 2023-05-20',
          amount: 425.00
        },
        {
          id: 1244,
          customer: 'Sarah Johnson',
          vehicle: 'Honda CR-V',
          status: 'Completed',
          date: '2023-05-10 - 2023-05-15',
          amount: 550.00
        },
        {
          id: 1243,
          customer: 'Michael Williams',
          vehicle: 'Ford Mustang',
          status: 'Requested',
          date: '2023-05-18 - 2023-05-22',
          amount: 720.00
        },
        {
          id: 1242,
          customer: 'Emily Brown',
          vehicle: 'BMW 5 Series',
          status: 'Approved',
          date: '2023-05-12 - 2023-05-17',
          amount: 850.00
        },
        {
          id: 1241,
          customer: 'David Miller',
          vehicle: 'Audi Q5',
          status: 'Cancelled',
          date: '2023-05-08 - 2023-05-13',
          amount: 675.00
        }
      ]);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error(err);
      setLoading(false);
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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-gray-500 text-sm uppercase tracking-wide">Total Bookings</h2>
                <p className="text-3xl font-bold mt-1">{stats.totalBookings}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Pending</p>
                <p className="font-semibold">{stats.pendingBookings}</p>
              </div>
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Active</p>
                <p className="font-semibold">{stats.activeBookings}</p>
              </div>
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Completed</p>
                <p className="font-semibold">{stats.completedBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-gray-500 text-sm uppercase tracking-wide">Total Vehicles</h2>
                <p className="text-3xl font-bold mt-1">{stats.totalVehicles}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Available</p>
                <p className="font-semibold">{stats.availableVehicles}</p>
              </div>
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Reserved</p>
                <p className="font-semibold">{stats.reservedVehicles}</p>
              </div>
              <div className="w-1/3 text-center">
                <p className="text-gray-500 text-xs">Maintenance</p>
                <p className="font-semibold">{stats.underMaintenanceVehicles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-gray-500 text-sm uppercase tracking-wide">Total Revenue</h2>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/2 text-center">
                <p className="text-gray-500 text-xs">This Month</p>
                <p className="font-semibold">{formatCurrency(stats.thisMonthRevenue)}</p>
              </div>
              <div className="w-1/2 text-center">
                <p className="text-gray-500 text-xs">Last Month</p>
                <p className="font-semibold">{formatCurrency(stats.lastMonthRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Bookings by Month</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bookingsByMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return formatCurrency(value);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Bookings by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Top Performing Vehicles</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehiclePerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue') return formatCurrency(value);
                    return value;
                  }} />
                  <Legend />
                  <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All
              </button>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {booking.customer}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {booking.vehicle}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(booking.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-gray-900">Manage Bookings</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/vehicles')}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-green-50 hover:border-green-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="text-gray-900">Add Vehicle</span>
            </button>
            
            <button
              onClick={() => navigate('/admin/users')}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-purple-50 hover:border-purple-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-gray-900">Manage Users</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-md hover:bg-yellow-50 hover:border-yellow-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="text-gray-900">Print Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;