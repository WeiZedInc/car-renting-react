import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loyaltyInfo, setLoyaltyInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || ''
      });
      
      fetchLoyaltyInfo();
      fetchDocuments();
    }
  }, [currentUser]);
  
  const fetchLoyaltyInfo = async () => {
    try {
      const response = await axios.get('/api/users/loyalty');
      setLoyaltyInfo(response.data);
    } catch (err) {
      console.error('Error fetching loyalty information:', err);
    }
  };
  
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await axios.get('/api/users/documents');
      setDocuments(response.data);
      setDocumentsLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentsLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      const { success, message } = await updateProfile(profileData);
      
      if (success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMessage({ text: message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleUploadDocuments = () => {
    navigate('/documents/upload');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        {message.text && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Logout
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Documents Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Documents</h2>
                <button
                  onClick={handleUploadDocuments}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Upload New Document
                </button>
              </div>
              
              {documentsLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="mt-2 text-gray-600">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">You haven't uploaded any documents yet.</p>
                  <p className="mt-2 text-gray-600">
                    To rent a vehicle, you'll need to upload your driver's license and ID.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((document) => (
                    <div key={document.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {document.documentType === 'DriversLicense'
                              ? 'Driver\'s License'
                              : document.documentType}
                          </h3>
                          {document.documentNumber && (
                            <p className="text-sm text-gray-600 mt-1">
                              Number: {document.documentNumber}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              document.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {document.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                      
                      {document.fileUrl && (
                        <div className="mt-2">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Loyalty Program */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Loyalty Program</h2>
              
              {loyaltyInfo ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="inline-block rounded-full bg-blue-100 p-3 mb-2">
                      <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                        {loyaltyInfo.tier.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{loyaltyInfo.tier} Tier</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-bold text-blue-600">{loyaltyInfo.points}</span>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            Progress to Next Tier
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: getProgressToNextTier(loyaltyInfo.tier, loyaltyInfo.points) }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {getNextTierMessage(loyaltyInfo.tier, loyaltyInfo.points)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">Your Benefits:</h3>
                    <ul className="space-y-1">
                      {getLoyaltyBenefits(loyaltyInfo.tier).map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg
                            className="h-4 w-4 text-green-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {loyaltyInfo.transactions && loyaltyInfo.transactions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recent Transactions:</h3>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Points
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {loyaltyInfo.transactions.slice(0, 5).map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(transaction.transactionDate).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span
                                    className={
                                      transaction.transactionType === 'Earned'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }
                                  >
                                    {transaction.transactionType === 'Earned' ? '+' : '-'}
                                    {transaction.points}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {transaction.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading loyalty information...</p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/vehicles')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                >
                  Browse Vehicles
                </button>
                <button
                  onClick={() => navigate('/bookings/my')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
                >
                  My Bookings
                </button>
                <button
                  onClick={handleUploadDocuments}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
                >
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for loyalty program
const getProgressToNextTier = (currentTier, points) => {
  switch (currentTier) {
    case 'Bronze':
      return `${Math.min((points / 1000) * 100, 100)}%`;
    case 'Silver':
      return `${Math.min(((points - 1000) / 1000) * 100, 100)}%`;
    case 'Gold':
      return `${Math.min(((points - 2000) / 3000) * 100, 100)}%`;
    case 'Platinum':
      return '100%';
    default:
      return '0%';
  }
};

const getNextTierMessage = (currentTier, points) => {
  switch (currentTier) {
    case 'Bronze':
      return `${points}/1000 points to Silver tier`;
    case 'Silver':
      return `${points}/2000 points to Gold tier`;
    case 'Gold':
      return `${points}/5000 points to Platinum tier`;
    case 'Platinum':
      return 'You have reached the highest tier!';
    default:
      return '';
  }
};

const getLoyaltyBenefits = (tier) => {
  const benefits = {
    Bronze: [
      'Earn 10 points per rental day',
      'Exclusive newsletter and promotions'
    ],
    Silver: [
      'Earn 10 points per rental day',
      'Exclusive newsletter and promotions',
      '5% discount on all rentals'
    ],
    Gold: [
      'Earn 10 points per rental day',
      'Exclusive newsletter and promotions',
      '10% discount on all rentals',
      'Free vehicle upgrade when available'
    ],
    Platinum: [
      'Earn 10 points per rental day',
      'Exclusive newsletter and promotions',
      '15% discount on all rentals',
      'Free vehicle upgrade when available',
      'Priority customer service',
      'Extended rental hours'
    ]
  };
  
  return benefits[tier] || benefits.Bronze;
};

export default UserProfile;