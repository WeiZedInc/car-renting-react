import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DocumentUpload = () => {
  const [documentType, setDocumentType] = useState('DriversLicense');
  const [documentNumber, setDocumentNumber] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we were redirected with specific instructions
  const redirectTo = location.state?.redirectTo;
  const missingDocuments = location.state?.missingDocuments;
  
  useEffect(() => {
    fetchDocuments();
    
    // If we know which documents are missing, automatically select the first one
    if (missingDocuments) {
      if (missingDocuments.driversLicense) {
        setDocumentType('DriversLicense');
      } else if (missingDocuments.id) {
        setDocumentType('ID');
      }
    }
  }, [missingDocuments]);
  
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await axios.get('/api/users/documents');
      setExistingDocuments(response.data);
      setDocumentsLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ text: 'Please select a file to upload.', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      // In a real implementation, you would upload the file to a server
      // Here we simulate a file upload and get a file URL
      const fileUrl = await simulateFileUpload(file);
      
      // Now save the document metadata
      await axios.post('/api/users/documents', {
        documentType,
        documentNumber,
        fileUrl
      });
      
      setMessage({
        text: 'Document uploaded successfully!',
        type: 'success'
      });
      
      // Refresh the documents list
      fetchDocuments();
      
      // Reset form
      setDocumentNumber('');
      setFile(null);
      document.getElementById('file-upload').value = '';
      
      // Check if all required documents are now uploaded
      const updatedDocuments = [...existingDocuments, { documentType }];
      const hasDriversLicense = updatedDocuments.some(doc => doc.documentType === 'DriversLicense');
      const hasId = updatedDocuments.some(doc => doc.documentType === 'ID');
      
      if (hasDriversLicense && hasId && redirectTo) {
        // If we have all required documents and a redirect URL, show a message and redirect
        setMessage({
          text: 'All required documents uploaded! Redirecting you back to complete your booking...',
          type: 'success'
        });
        
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      }
    } catch (err) {
      setMessage({
        text: 'Failed to upload document. Please try again.',
        type: 'error'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate file upload (in a real app, this would be an actual file upload to a server)
  const simulateFileUpload = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would be the URL returned from your file server
        resolve(`https://example.com/uploads/${file.name}`);
      }, 1000);
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Upload Documents</h1>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Back to Profile
          </button>
        </div>
        
        {missingDocuments && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  To complete your booking, please upload the following required documents:
                </p>
                <ul className="mt-2 list-disc list-inside">
                  {missingDocuments.driversLicense && (
                    <li>Valid Driver's License</li>
                  )}
                  {missingDocuments.id && (
                    <li>Government-issued ID</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {message.text && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload a New Document</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="DriversLicense">Driver's License</option>
                  <option value="ID">ID Card/Passport</option>
                  <option value="Insurance">Insurance Certificate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Number (optional)
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., License number, ID number"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Document File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H4m32-12h-4m4 0H16"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    {file && (
                      <p className="text-sm text-gray-800 mt-2">
                        Selected file: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Existing Documents List */}
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
            
            {documentsLoading ? (
              <div className="text-center py-8">
                <div className="spinner"></div>
                <p className="mt-2 text-gray-600">Loading documents...</p>
              </div>
            ) : existingDocuments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">You haven't uploaded any documents yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Document Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Document Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Upload Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingDocuments.map((document) => (
                      <tr key={document.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {document.documentType === 'DriversLicense'
                              ? 'Driver\'s License'
                              : document.documentType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {document.documentNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(document.uploadDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              document.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {document.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {document.fileUrl && (
                            <a
                              href={document.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Back to Profile
          </button>
          
          {redirectTo && (
            <button
              onClick={() => navigate(redirectTo)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Continue Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;