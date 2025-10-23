"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, RotateCcw, Calendar, X, Search, Clock, ChevronLeft, ChevronRight, Check, Eye, Download, CheckCircle } from 'lucide-react';
import { BASE_URL } from '@/src/components/BaseUrl';
import { motion } from "framer-motion"
import { useFilterModal } from '@/src/components/DashboardLayout';
import { toast } from "react-toastify"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Payments() {
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  
  // Temp filter states for modal
  const [tempFilterStatus, setTempFilterStatus] = useState("all");
  const [tempDateFilter, setTempDateFilter] = useState(null);
  
  // Search active state
  const [isSearchActive, setIsSearchActive] = useState(false);

  const rowsPerPage = 10;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredPayments.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  // Status options for cards
  const statusOptions = [
    { value: "all", label: "Total Transactions" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
  ];

  useEffect(() => {
    try {
      const userString = localStorage.getItem('userProfile');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const loggedInUser = {
          id: user?.uid,
          name: user?.displayName,
          email: user?.email,
          role: user?.role
        };
        setCurrentUser(loggedInUser);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Error parsing user data. Please log in again.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      loadPayments();
    }
  }, [currentUser]);

  useEffect(() => {
    filterPayments();
    setCurrentPage(1);
  }, [payments, filterStatus, searchTerm, dateFilter]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/getPayments/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status}`);
      }

      const paymentData = await response.json();

      const transformedPayments = paymentData.map(payment => ({
        id: payment.id,
        transactionId: payment.transaction_id,
        customerId: payment.createdby_id,
        customerName: payment.payment_payload?.notes?.customer_name || 'Unknown Customer',
        amount: parseFloat(payment.paid_amount) || 0,
        method: payment.transaction_type === 'card' ? 'Credit Card' : payment.transaction_type,
        status: mapPaymentStatus(payment.payment_status),
        description: `Invoice #${payment.invoice_id}`,
        createdAt: payment.created_at,
        updatedAt: payment.modified_at,
        rawData: payment
      }));

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments. Please try again.');
      
      // Demo data as fallback
      const demoPayments = [
        {
          id: '1',
          transactionId: 'txn_123456',
          customerId: 'cust_123',
          customerName: 'John Doe',
          amount: 99.99,
          method: 'Credit Card',
          status: 'paid',
          description: 'Invoice #INV-001',
          createdAt: '2023-10-15T10:30:00Z',
          updatedAt: '2023-10-15T10:30:00Z'
        },
        {
          id: '2',
          transactionId: 'txn_789012',
          customerId: 'cust_456',
          customerName: 'Jane Smith',
          amount: 149.99,
          method: 'PayPal',
          status: 'pending',
          description: 'Invoice #INV-002',
          createdAt: '2023-10-14T14:45:00Z',
          updatedAt: '2023-10-14T14:45:00Z'
        }
      ];
      setPayments(demoPayments);
    } finally {
      setIsLoading(false);
    }
  };

  const mapPaymentStatus = (status) => {
    switch (status) {
      case 'created': return 'pending';
      case 'authorized': return 'pending';
      case 'captured': return 'paid';
      case 'failed': return 'failed';
      default: return status;
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((payment) =>
        payment.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.toDateString() === dateFilter.toDateString();
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.amount.toString().includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
  };

  // Filter modal functions
  const applyFilters = () => {
    setFilterStatus(tempFilterStatus);
    setDateFilter(tempDateFilter);
    setIsFilterModalOpen(false);
  };

  const handleOpenFilterModal = () => {
    setTempFilterStatus(filterStatus);
    setTempDateFilter(dateFilter);
    setIsFilterModalOpen(true);
  };

  const clearAllFilters = () => {
    setTempFilterStatus("all");
    setTempDateFilter(null);
    setFilterStatus("all");
    setDateFilter(null);
    setSearchTerm("");
    setIsFilterModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      case 'failed': return 'bg-gradient-to-r from-rose-400 to-rose-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div className="pl-3 flex flex-col">
      <div className="max-h-[calc(100vh-50px)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="grid grid-cols-3 md:grid-cols-5 gap-5">
            {statusOptions.map((status, index, arr) => {
              const count = status.value === "all"
                ? payments.length
                : payments.filter((p) => p.status === status.value).length;

              const total = status.value === "all"
                ? payments.reduce((sum, payment) => sum + payment.amount, 0)
                : payments
                    .filter((p) => p.status === status.value)
                    .reduce((sum, payment) => sum + payment.amount, 0);

              const statusIcons = {
                all: <CreditCard className="h-5 w-5 text-white" />,
                paid: <CheckCircle className="h-5 w-5 text-white" />,
                pending: <Clock className="h-5 w-5 text-white" />,
              };

              const statusConfig = {
                all: {
                  borderColor: "border-purple-400",
                  iconBg: "bg-purple-600 bg-opacity-80",
                  checkmarkBg: "bg-purple-600",
                  image: "/Rectangle145138.svg",
                  label: "Total Transactions"
                },
                paid: {
                  borderColor: "border-emerald-400",
                  iconBg: "bg-teal-600 bg-opacity-80",
                  checkmarkBg: "bg-teal-500",
                  image: "/Rectangle45212.svg",
                  label: "Paid"
                },
                pending: {
                  borderColor: "border-amber-400",
                  iconBg: "bg-amber-600 bg-opacity-80",
                  checkmarkBg: "bg-amber-600",
                  image: "/Rectangle145211orange.svg",
                  label: "Pending"
                },
              };

              const IconComponent = statusIcons[status.value] || <CreditCard className="h-5 w-5 text-white" />;
              const config = statusConfig[status.value] || {
                borderColor: "border-gray-400",
                iconBg: "bg-gray-600 bg-opacity-80",
                checkmarkBg: "bg-gray-600",
                image: "/Rectangle145138.svg",
                label: status.label
              };

              let extraRadius = "";
              if (index === 0) extraRadius = "rounded-tl-2xl";
              if (index === arr.length - 1) extraRadius = "rounded-br-2xl";

              return (
                <motion.div
                  key={status.value}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() =>
                    setFilterStatus(status.value === filterStatus ? "all" : status.value)
                  }
                  className={`relative w-[234px] h-[142px] border-opacity-20 transition-all cursor-pointer mt-2 ${extraRadius}`}
                >
                  <div className="absolute inset-0 z-0 flex justify-center items-center">
                    <img
                      src={config.image}
                      alt={`${status.label} background`}
                      className="w-[234px] h-[142px] object-cover"
                    />
                    {filterStatus === status.value && (
                      <div className="absolute inset-0 bg-opacity-40"></div>
                    )}
                  </div>

                  <div className="relative z-10 w-[234px] h-[142px] p-3 flex flex-col justify-between">
                    {filterStatus === status.value && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <div
                          className={`flex items-center justify-center rounded-full p-[6px] ${config.checkmarkBg}`}
                        >
                          <Check className="h-[18px] w-[18px] text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-5 mb-1">
                      <div
                        className={`flex items-center justify-center w-1/6 border-b-2 pb-2 ${config.borderColor}`}
                      >
                        <div
                          className={`p-2 rounded-full ${config.iconBg} flex items-center justify-center`}
                        >
                          {IconComponent}
                        </div>
                      </div>

                      <h3 className="text-sm font-medium uppercase leading-[18px] font-inter mb-1 text-white">
                        {config.label}
                      </h3>
                    </div>

                    <div className="text-[18px] leading-[38px] font-bold font-inter pl-2 text-white">
                      {count}
                    </div>

                    
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-1 mt-2"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full">
              <div className="relative flex flex-col border border-gray-100 p-1 md:flex-row items-center gap-3 w-full">
                <div className="relative flex-1 bg-left-top opacity-100">
                  {!isSearchActive && (
                    <img
                      src="/searchsvg-1.svg"
                      alt="search-icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-[42px] h-[42px] cursor-pointer"
                      onClick={() => setIsSearchActive(true)}
                    />
                  )}

                  {isSearchActive && (
                    <>
                      <img
                        src="/search-icon-2.svg"
                        alt="search-icon"
                        className="w-[17px] h-[17px] absolute left-4 top-3"
                      />
                      <input
                        type="text"
                        placeholder="Search payments by ID, customer, amount, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => setIsSearchActive(false)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {!isSearchActive && (
                  <button
                    onClick={handleOpenFilterModal}
                    className="flex items-center gap-2 w-[123px] h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-tl-0 rounded-tr-[8px] rounded-bl-[8px] rounded-br-[8px] opacity-100 transition-colors hover:bg-gray-200 relative px-4 py-2"
                  >
                    <img src="/filter-icon.png" alt="filter icon" className="w-[22px] h-[22px]" />
                    <span className="hidden sm:inline text-gray-700 text-sm">Filters</span>
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {!isSearchActive && (filterStatus !== "all" || dateFilter) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="pr-1 border-r-2 pl-2">
                    <h1 className="w-[80px] h-[15px] text-[#9398A5] text-left font-medium text-[12px] leading-[14px] tracking-[0px] opacity-100 font-inter">
                      Applied Filters
                    </h1>
                    <button
                      onClick={clearAllFilters}
                      className="w-[56px] h-[17px] text-[#FC6719] text-left font-medium text-[14px] leading-[14px] tracking-[0px] opacity-100 font-inter transition-colors hover:text-[#E65C00]"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  {filterStatus && filterStatus !== "all" && (
                    <div className="mt-2 w-[172px] h-[46px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[6px] opacity-100 px-3 py-1 flex items-center justify-between relative">
                      <div className="flex flex-col justify-center">
                        <span className="w-[46px] h-[12px] text-[#9398A5] text-left font-medium text-[10px] leading-[14px] tracking-[1.5px] uppercase opacity-100 font-inter">
                          Status:
                        </span>
                        <span className="w-[25px] h-[15px] text-[#3B444D] text-left font-medium text-[12px] leading-[14px] tracking-[0px] capitalize opacity-100 font-inter">
                          {statusOptions.find(opt => opt.value === filterStatus)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => setFilterStatus('all')}
                        className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]"
                      >
                        <img src="/cancel-btn.svg" alt="cancel-btn" className="w-[19px] h-[19px]" />
                      </button>
                    </div>
                  )}
                  
                  {dateFilter && (
                    <div className="mt-2 w-[172px] h-[46px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[6px] opacity-100 px-3 py-1 flex items-center justify-between relative">
                      <div className="flex flex-col justify-center">
                        <span className="w-[46px] h-[12px] text-[#9398A5] text-left font-medium text-[10px] leading-[14px] tracking-[1.5px] uppercase opacity-100 font-inter">
                          Date:
                        </span>
                        <span className="w-auto h-[15px] text-[#3B444D] text-left font-medium text-[12px] leading-[14px] tracking-[0px] capitalize opacity-100 font-inter">
                          {formatDateForDisplay(dateFilter)}
                        </span>
                      </div>
                      <button
                        onClick={() => setDateFilter(null)}
                        className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]"
                      >
                        <img src="/cancel-btn.svg" alt="cancel-btn" className="w-[19px] h-[19px]" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <div className="relative flex items-center justify-center mb-4">
                  <h3 className="text-[#191616] font-medium text-[24px] leading-[29px] capitalize">
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="absolute top-1 right-1 flex justify-center items-center bg-[#F5F5FA] rounded-full w-[30px] h-[30px] hover:text-gray-600 transition-colors"
                  >
                    <img src="/cancel-filter.svg" alt="cancel-img" className="h-[12px] w-[12px]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                    <select
                      value={tempFilterStatus}
                      onChange={(e) => setTempFilterStatus(e.target.value)}
                      className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7]"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-1 top-10 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm text-[#3B444D] font-medium mb-1">
                      Date
                    </label>
                    <DatePicker
                      selected={tempDateFilter}
                      onChange={(date) => setTempDateFilter(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date"
                      className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 text-[#A8ACB7] focus:outline-none focus:bg-[#FFE5D8] focus:ring-[#575DD5] appearance-none"
                      calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                    />
                    <div className="pointer-events-none absolute left-54 top-10 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setTempFilterStatus("all");
                      setTempDateFilter(null);
                      setIsFilterModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border overflow-hidden mt-4"
        >
          <div style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : filterStatus !== "all" && dateFilter
                    ? `No ${filterStatus} payments found for the selected date.`
                    : filterStatus !== "all"
                    ? `No ${filterStatus} payments found.`
                    : dateFilter
                    ? "No payments found for the selected date."
                    : "No payments available."}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F6F5FA] rounded-[10px] opacity-100 h-[50px] sticky top-0 z-10">
                  <tr>
                    {[
                      "SN.NO",
                      "Transaction ID",
                      "Customer",
                      "Amount",
                      "Method",
                      "Status",
                      "Date",
                      "Description",
                    ].map((header) => (
                      <th
                        key={header}
                        className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3 uppercase tracking-wider align-middle"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedRowId(payment.id)}
                      className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer ${
                        selectedRowId === payment.id
                          ? "bg-indigo-50 shadow-lg"
                          : "hover:bg-gray-50 hover:shadow-md"
                      }`}
                    >
                      {/* SN.NO */}
                      <td className="text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-4 py-3">
                        {indexOfFirstRow + index + 1}
                      </td>

                      {/* Transaction ID */}
                      <td className="px-2 py-3 text-left">
                        <div className="text-sm text-gray-900">{payment.transactionId}</div>
                        <div className="text-xs text-gray-500">ID: {payment.id}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 text-left">
                        <div className="text-sm text-gray-900">{payment.customerName}</div>
                        <div className="text-xs text-gray-500">ID: {payment.customerId}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-left">
                        <div className="flex justify-start items-center">
                          <span className="w-auto font-inter font-bold text-[14px] leading-[16px] text-[#191616] opacity-100">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3 text-left">
                        <span className="text-sm text-gray-900">{payment.method}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-left">
                        <span
                          className={`inline-flex justify-center items-center w-[84px] h-[24px] rounded-[6px] text-white text-xs uppercase font-semibold opacity-100 ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 w-[75px] h-[15px] text-left font-inter font-normal text-[12px] leading-[16px] text-[#191616] opacity-100">
                        <span>{formatDate(payment.createdAt)}</span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-left">
                        <span className="text-sm text-gray-900">{payment.description}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {filteredPayments.length > 0 && (
              <div className="h-[55px] w-full bg-[#F5F5FA] rounded-[10px] opacity-100 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sticky bottom-0 z-10">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredPayments.length)} of{" "}
                  {filteredPayments.length} results
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md 
                      bg-white text-gray-700 hover:bg-gray-100 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors 
                        ${currentPage === i + 1
                          ? "bg-[#3F058F] text-white border-[#3F058F]"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md 
                      bg-white text-gray-700 hover:bg-gray-100 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}