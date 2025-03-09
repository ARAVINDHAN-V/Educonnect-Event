import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [paginationConfig, setPaginationConfig] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Replace with your actual API endpoint
        // In a real implementation, you would include pagination, filters, etc. in the request
        const response = await fetch('/api/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        setPayments(data);
        setPaginationConfig(prev => ({
          ...prev,
          totalItems: data.length
        }));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange({ from: '', to: '' });
  };

  // This function now only calculates and returns data without updating any state
  const getFilteredPayments = () => {
    let filteredPayments = [...payments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPayments = filteredPayments.filter(payment => 
        payment.transactionId.toLowerCase().includes(term) ||
        payment.customerName.toLowerCase().includes(term) ||
        payment.customerEmail.toLowerCase().includes(term) ||
        payment.eventTitle?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filteredPayments = filteredPayments.filter(payment => 
        payment.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filteredPayments = filteredPayments.filter(payment => 
        new Date(payment.date) >= fromDate
      );
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      filteredPayments = filteredPayments.filter(payment => 
        new Date(payment.date) <= toDate
      );
    }
    
    return filteredPayments;
  };
  
  // This function sorts and paginates the already filtered data
  const getSortedAndPaginatedPayments = (filteredPayments) => {
    // Sort
    const sortedPayments = [...filteredPayments].sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
    
    // Apply pagination
    const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage;
    return sortedPayments.slice(startIndex, startIndex + paginationConfig.itemsPerPage);
  };

  // Update total items when filters change
  useEffect(() => {
    const filteredPayments = getFilteredPayments();
    setPaginationConfig(prev => ({
      ...prev,
      totalItems: filteredPayments.length,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [searchTerm, filterStatus, dateRange.from, dateRange.to, payments]);

  const handlePageChange = (newPage) => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setPaginationConfig(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset to first page when changing items per page
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get filtered payments first
  const filteredPayments = getFilteredPayments();
  // Then get sorted and paginated subset of filtered payments
  const displayedPayments = getSortedAndPaginatedPayments(filteredPayments);
  const totalPages = Math.ceil(paginationConfig.totalItems / paginationConfig.itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment Transactions</h1>
        <Link 
          to="/payments/export" 
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Export Data
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Transaction ID, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              id="dateFrom"
              name="from"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={dateRange.from}
              onChange={handleDateRangeChange}
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              id="dateTo"
              name="to"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={dateRange.to}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('transactionId')}
                >
                  <div className="flex items-center">
                    Transaction ID
                    {sortConfig.key === 'transactionId' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === 'customerName' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedPayments.length > 0 ? (
                displayedPayments.map(payment => (
                  <tr key={payment.transactionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/payments/${payment.transactionId}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      {payment.status !== 'refunded' && payment.status !== 'failed' && (
                        <Link to={`/payments/${payment.transactionId}/refund`} className="text-red-600 hover:text-red-900">
                          Refund
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{displayedPayments.length}</span> of{' '}
            <span className="font-medium">{paginationConfig.totalItems}</span> results
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="itemsPerPage" className="text-sm text-gray-700 mr-2">Items per page:</label>
            <select
              id="itemsPerPage"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={paginationConfig.itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex">
            <button
              onClick={() => handlePageChange(paginationConfig.currentPage - 1)}
              disabled={paginationConfig.currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md ${
                paginationConfig.currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  paginationConfig.currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(paginationConfig.currentPage + 1)}
              disabled={paginationConfig.currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md ${
                paginationConfig.currentPage === totalPages || totalPages === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;