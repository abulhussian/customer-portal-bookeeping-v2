  "use client";

  import React, { useState, useEffect } from 'react';
  import { CreditCard, Filter, RotateCcw, Calendar, X, Search, Clock, ChevronLeft, ChevronRight, Check, Eye, Download, CheckCircle } from 'lucide-react';
  import { BASE_URL } from '@/src/components/BaseUrl';
  import { motion } from "framer-motion"
  import { useFilterModal } from '@/src/components/DashboardLayout';
  import { toast } from "react-toastify"
  import DatePicker from "react-datepicker";
  import "react-datepicker/dist/react-datepicker.css";
  import { HiArrowLeftCircle, HiArrowRightCircle } from "react-icons/hi2";

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
      <motion.div className=" flex flex-col">
        <div className="max-h-[calc(100vh)] overflow-y-auto pb-24 sm:pb-8 mb-4 ">

          <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mt-4"
  >
    <div className="grid grid-cols-2 sm:grid-cols-4 xs:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {statusOptions.map((status, index, arr) => {
        // Count of items per status
        const count =
          status.value === "all"
            ? payments.length
            : payments.filter((p) => p.status === status.value).length;

        // Icon mapping
        const statusIcons = {
          all: <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
          paid: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
          pending: <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
        };

        // Style and background mapping
        const statusConfig = {
          all: {
            borderColor: "border-[#604881]",
            iconBg: "bg-[#604881]",
            checkmarkBg: "bg-[#604881]",
            image: "/Rectangle145138.svg",
            label: "Total Transactions",
          },
          paid: {
            borderColor: "border-emerald-400",
            iconBg: "bg-teal-600 bg-opacity-80",
            checkmarkBg: "bg-teal-500",
            image: "/Rectangle45212.svg",
            label: "Paid",
          },
          pending: {
            borderColor: "border-[#df530a]",
            iconBg: "bg-[#df530a]",
            checkmarkBg: "bg-[#df530a]",
            image: "/Rectangle145211orange.svg",
            label: "Pending",
          },
        };

        const IconComponent = statusIcons[status.value] || <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />;
        const config = statusConfig[status.value] || {
          borderColor: "border-gray-400",
          iconBg: "bg-gray-600 bg-opacity-80",
          checkmarkBg: "bg-gray-600",
          image: "/Rectangle145138.svg",
          label: status.label,
        };

        // Border radius logic
        let extraRadius = "";
        if (index === 0)
          extraRadius = "rounded-tl-[30px] sm:rounded-tl-[50px] rounded-tr-[6px] rounded-br-[6px] rounded-bl-[6px]";
        else if (index === arr.length - 1)
          extraRadius = "rounded-tr-[6px] rounded-br-[30px] sm:rounded-br-[50px] rounded-tl-[6px] rounded-bl-[6px]";
        else extraRadius = "rounded-[6px]";

        return (
          <motion.div
            key={status.value}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() =>
              setFilterStatus(status.value === filterStatus ? "all" : status.value)
            }
            className={`relative w-full h-[142px] bg-no-repeat bg-cover shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col pt-4 pl-4 text-start ${extraRadius}`}
            style={{ backgroundImage: `url(${config.image})` }}
          >
            {/* Checkmark overlay when selected */}
            {filterStatus === status.value && (
              <div className="absolute -top-2 -right-2 z-20">
                <div
                  className={`flex items-center justify-center rounded-full p-[6px] ${config.checkmarkBg}`}
                >
                  <Check className="h-[18px] w-[18px] text-white" />
                </div>
              </div>
            )}

            {/* Icon + label */}
            <div className="flex items-center gap-2 text-white w-full">
              <div className={`w-1/6 min-w-[40px] border-b-2 pb-2 ${config.borderColor}`}>
                <div className={`p-1 flex justify-center items-center rounded-full ${config.iconBg}`}>
                  {IconComponent}
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold pb-2">{config.label}</h3>
            </div>

            {/* Count */}
            <div className="text-xl sm:text-2xl font-bold text-white mt-4 pl-2">
              {count}
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
    className="bg-white p-2 mt-2 overflow-hidden rounded-lg shadow-sm border"
  >
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Search Input */}
      <div className="w-full">
        <div className="relative flex flex-row border border-gray-300 p-2 items-center gap-3 w-full rounded-md">
          {/* Search Wrapper */}
          <div className="relative flex-1 min-h-[48px] flex items-center">
            {/* Big Search Icon */}
            {!isSearchActive && (
              <img
                src="/searchsvg-1.svg"
                alt="search-icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-[36px] h-[36px] cursor-pointer z-10"
                onClick={() => setIsSearchActive(true)}
              />
            )}

            {/* Active Search */}
            {isSearchActive && (
              <>
                <img
                  src="/search-icon-2.svg"
                  alt="search-icon"
                  className="w-[17px] h-[17px] absolute left-3 top-1/2 -translate-y-1/2 z-10"
                />
                <input
                  type="text"
                  placeholder="Search payments by ID, customer, amount, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={() => setIsSearchActive(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Filter Button */}
          {!isSearchActive && (
            <button
              onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
              className="flex items-center justify-center gap-2 w-[120px] h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-lg transition-colors hover:bg-gray-200 relative px-3 py-2 "
            >
              <img src="/filter-icon.png" alt="filter icon" className="w-[20px] h-[20px]" />
              <span className="hidden sm:inline text-gray-700 text-sm font-medium">Filters</span>
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {!isSearchActive && (filterStatus !== "all" || dateFilter) && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="pr-2 border-r-2 pl-2 flex items-center gap-2">
              <h1 className="text-[#9398A5] text-left font-medium text-[12px] leading-[14px] font-inter">
                Applied Filters
              </h1>
              <button
                onClick={clearAllFilters}
                className="text-[#FC6719] font-medium text-[13px] leading-[14px] font-inter transition-colors hover:text-[#E65C00]"
              >
                Clear all
              </button>
            </div>

            {/* Status Filter Tag */}
            {filterStatus && filterStatus !== "all" && (
              <div className="mt-2 w-[172px] h-[46px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[6px] px-3 py-1 flex items-center justify-between relative">
                <div className="flex flex-col justify-center">
                  <span className="text-[#9398A5] font-medium text-[10px] uppercase font-inter">
                    Status:
                  </span>
                  <span className="text-[#3B444D] font-medium text-[12px] capitalize font-inter">
                    {statusOptions.find(opt => opt.value === filterStatus)?.label}
                  </span>
                </div>
                <button
                  onClick={() => setFilterStatus("all")}
                  className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center hover:bg-[#dcdbe1]"
                >
                  <img src="/cancel-btn.svg" alt="cancel-btn" className="w-[19px] h-[19px]" />
                </button>
              </div>
            )}

            {/* Date Filter Tag */}
            {dateFilter && (
              <div className="mt-2 w-[172px] h-[46px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[6px] px-3 py-1 flex items-center justify-between relative">
                <div className="flex flex-col justify-center">
                  <span className="text-[#9398A5] font-medium text-[10px] uppercase font-inter">
                    Date:
                  </span>
                  <span className="text-[#3B444D] font-medium text-[12px] capitalize font-inter">
                    {formatDateForDisplay(dateFilter)}
                  </span>
                </div>
                <button
                  onClick={() => setDateFilter(null)}
                  className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center hover:bg-[#dcdbe1]"
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
            {/* Status Filter */}
  <div className="relative">
    <label className="text-sm font-medium text-gray-700 mb-2 block">
      Filter by Status
    </label>
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
    <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
  </div>

  {/* Date Filter */}
  <div className="relative">
    <label className="block text-sm text-[#3B444D] font-medium mb-1">Date</label>
    <DatePicker
      selected={tempDateFilter}
      onChange={(date) => setTempDateFilter(date)}
      dateFormat="dd/MM/yyyy"
      placeholderText="Select date"
      className="w-full bg-[#F7F8FC] rounded-md px-3 py-2 pr-8 focus:outline-none focus:bg-[#FFE5D8] focus:ring-blue-500"
      calendarClassName="shadow-lg border border-gray-200 rounded-lg"
    />
    {/* Adjust top position for DatePicker arrow */}
    <div className="pointer-events-none absolute right-3 top-[60%] translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
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
    className="bg-white rounded-lg shadow-sm border overflow-hidden my-6 "
  >
    {/* Scrollable Table */}
    <div
      className="overflow-x-auto "
      style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
    >
      {filteredPayments.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-6xl mb-4">💳</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            No Payments Found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search criteria."
              : filterStatus !== "all" && dateFilter
              ? `No ${filterStatus.toLowerCase()} payments found for the selected date.`
              : filterStatus !== "all"
              ? `No ${filterStatus.toLowerCase()} payments found.`
              : dateFilter
              ? "No payments found for the selected date."
              : "No payments available."}
          </p>
        </div>
      ) : (
        <div className="min-w-[800px]">
          <table className="w-full divide-y divide-gray-200">
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
                    className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3 uppercase tracking-wider align-middle whitespace-nowrap"
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
                  <td className="text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-4 py-3 whitespace-nowrap">
                    {indexOfFirstRow + index + 1}
                  </td>

                  {/* Transaction ID */}
                  <td className="px-2 py-3 text-left whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.transactionId}</div>
                    <div className="text-xs text-gray-500">ID: {payment.id}</div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                    <div className="text-xs text-gray-500">ID: {payment.customerId}</div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="w-auto font-inter font-bold text-[14px] leading-[16px] text-[#191616] opacity-100">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>

                  {/* Method */}
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm text-gray-900">{payment.method}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <span
                      className={`inline-flex justify-center items-center w-[84px] h-[24px] rounded-[6px] text-white text-xs uppercase font-semibold opacity-100 ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-left whitespace-nowrap text-[12px] leading-[16px] text-[#191616] font-inter">
                    {formatDate(payment.createdAt)}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <span className="text-sm text-gray-900">{payment.description}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* ✅ Pagination Moved Below */}
    {filteredPayments.length > 0 && (
      <div className="w-full bg-[#F5F5FA] rounded-[10px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 mt-4 ">
        <p className="text-sm text-gray-700 text-center sm:text-left mb-2 sm:mb-0">
          Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{" "}
          <span className="font-medium">{Math.min(indexOfLastRow, filteredPayments.length)}</span> of{" "}
          <span className="font-medium">{filteredPayments.length}</span> results
        </p>

        <nav
          className="flex items-center justify-center sm:justify-end flex-wrap gap-2 w-full sm:w-auto"
          aria-label="Pagination"
        >
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-[4px] border transition-colors
              ${currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            <HiArrowLeftCircle
              className={`h-[14px] w-[14px] ${currentPage === 1 ? "text-gray-400" : "text-[#3F058F]"}`}
            />
            <span className="font-bold text-[#3F058F] text-xs sm:text-sm">Prev</span>
          </button>

          {/* Page Numbers */}
          {(() => {
            const totalPages = Math.ceil(filteredPayments.length / 10);
            const visiblePages = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + visiblePages - 1);
            if (endPage - startPage < visiblePages - 1) {
              startPage = Math.max(1, endPage - visiblePages + 1);
            }
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[32px] h-[32px] text-sm rounded-[4px] flex items-center justify-center border
                    ${currentPage === page
                      ? "bg-[#3F058F] text-white font-semibold"
                      : "bg-white text-[#191616] hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              )
            );
          })()}

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredPayments.length / 10)))
            }
            disabled={currentPage === Math.ceil(filteredPayments.length / 10)}
            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-[4px] border transition-colors
              ${currentPage === Math.ceil(filteredPayments.length / 10)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span className="font-bold text-[#3F058F] text-xs sm:text-sm">Next</span>
            <HiArrowRightCircle
              className={`h-[14px] w-[14px] ${currentPage === Math.ceil(filteredPayments.length / 10)
                ? "text-gray-400"
                : "text-[#3F058F]"
              }`}
            />
          </button>
        </nav>
      </div>
    )}
  </motion.div>


        </div>
      </motion.div>
    );
  }