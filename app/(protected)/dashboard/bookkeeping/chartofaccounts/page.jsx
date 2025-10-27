"use client";
import { useState } from "react";
import { Plus, Edit, Trash2, X, FileText, Eye, MoreVertical } from "lucide-react";
import { HiArrowLeftCircle, HiArrowRightCircle } from "react-icons/hi2";
import { useFilterModal } from "@/src/components/DashboardLayout";

export default function ChartOfAccounts() {
    const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tempTypeFilter, setTempTypeFilter] = useState('all');
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const accounts = [
    { id: "1000", name: "Cash", type: "Asset", category: "Current Assets", balance: "$25,000", documentCount: 3, lastUpdated: "2024-01-15" },
    { id: "1100", name: "Accounts Receivable", type: "Asset", category: "Current Assets", balance: "$12,500", documentCount: 5, lastUpdated: "2024-01-14" },
    { id: "1200", name: "Inventory", type: "Asset", category: "Current Assets", balance: "$8,750", documentCount: 2, lastUpdated: "2024-01-13" },
    { id: "1500", name: "Equipment", type: "Asset", category: "Fixed Assets", balance: "$45,000", documentCount: 1, lastUpdated: "2024-01-12" },
    { id: "2000", name: "Accounts Payable", type: "Liability", category: "Current Liabilities", balance: "$7,200", documentCount: 4, lastUpdated: "2024-01-11" },
    { id: "2100", name: "Credit Card", type: "Liability", category: "Current Liabilities", balance: "$3,400", documentCount: 2, lastUpdated: "2024-01-10" },
    { id: "3000", name: "Owner's Equity", type: "Equity", category: "Equity", balance: "$80,650", documentCount: 1, lastUpdated: "2024-01-09" },
    { id: "4000", name: "Sales Revenue", type: "Revenue", category: "Income", balance: "$125,000", documentCount: 8, lastUpdated: "2024-01-08" },
    { id: "5000", name: "Cost of Goods Sold", type: "Expense", category: "Cost of Sales", balance: "$45,000", documentCount: 6, lastUpdated: "2024-01-07" },
    { id: "6000", name: "Rent Expense", type: "Expense", category: "Operating Expenses", balance: "$12,000", documentCount: 1, lastUpdated: "2024-01-06" },
    { id: "6100", name: "Utilities Expense", type: "Expense", category: "Operating Expenses", balance: "$2,500", documentCount: 3, lastUpdated: "2024-01-05" },
    { id: "6200", name: "Salary Expense", type: "Expense", category: "Operating Expenses", balance: "$25,000", documentCount: 7, lastUpdated: "2024-01-04" },
  ];

  // Handler functions
  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchTerm('');
  };

  const applyFilters = () => {
    setTypeFilter(tempTypeFilter);
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
    setTempTypeFilter('all');
    setTempCategoryFilter('all');
  };

  const handleRowClick = (id) => {
    setSelectedRowId(id === selectedRowId ? null : id);
  };

  // Filter accounts based on search and filters
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || account.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Helper function for badge colors
  const getTypeBadgeColor = (type) => {
    const colors = {
      Asset: 'bg-green-100 text-green-800 border-green-200',
      Liability: 'bg-red-100 text-red-800 border-red-200',
      Equity: 'bg-blue-100 text-blue-800 border-blue-200',
      Revenue: 'bg-purple-100 text-purple-800 border-purple-200',
      Expense: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (type) => {
    const colors = {
      Asset: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      Liability: 'bg-gradient-to-tr from-[#C15555] to-[#F47356]',
      Equity: 'bg-blue-500',
      Revenue: 'bg-purple-500',
      Expense: 'bg-gradient-to-r from-amber-400 to-amber-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const currentItems = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto overflow-y-auto max-h-[calc(100vh)] pb-24 sm:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Chart of Accounts</h2>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your company's account structure
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-1 sm:p-1 sm:pl-2">
        <div className="flex items-center justify-center flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex flex-col border border-gray-100 p-1 md:flex-row items-center gap-3 w-full">
            {/* 🔍 Search Section */}
            <div className="relative flex-1 w-full bg-left-top opacity-100">
              {/* 👇 Mobile Search Toggle */}
              {!isSearchActive && (
                <div className="flex items-center gap-2">
                  <img
                    src="/searchsvg-1.svg"
                    alt="search"
                    onClick={() => setIsSearchActive(true)}
                    className="w-8 h-8 sm:w-[42px] sm:h-[42px] cursor-pointer hover:opacity-80 transition md:hidden"
                  />
                  <img
                    src="/searchsvg-1.svg"
                    alt="search"
                    onClick={() => setIsSearchActive(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-[42px] h-[42px] cursor-pointer hover:opacity-80 transition hidden md:block"
                  />
                </div>
              )}

              {/* 👇 When active: show search input + small search icon */}
              {isSearchActive && (
                <>
                  <img
                    src="/search-icon-2.svg"
                    alt="search-icon"
                    className="w-4 h-4 sm:w-[17px] sm:h-[17px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    placeholder="Search accounts by ID, name, type, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <button
                    onClick={handleCloseSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* 🧩 Filter + Add Account Buttons (Hidden when search active) */}
            {!isSearchActive && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                  className="flex items-center justify-center gap-2 w-full sm:w-[123px] h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[8px] transition-colors hover:bg-gray-200 px-4 py-2"
                >
                  <img src="/filter-icon.png" alt="filter-icon" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                  <span className="text-[14px] leading-[11px] font-medium text-[#625377]">
                    Filters
                  </span>
                </button>

                <button className="w-full sm:w-[166px] h-[42px] bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] rounded-[10px_10px_10px_0px] opacity-100 flex items-center justify-center text-white gap-2 text-sm sm:text-base">
                  <Plus className="w-4 h-4" /> Add Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Applied Filters */}
        {(typeFilter !== "all" || categoryFilter !== "all") && (
          <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            <div className="pr-2 sm:pr-4 border-r-2 border-gray-200 pl-0 sm:pl-2">
              <h1 className="w-auto sm:w-[80px] text-[12px] leading-[14px] font-medium text-[#9398A5] opacity-100">
                Applied Filters
              </h1>
              {(searchTerm || typeFilter !== "all" || categoryFilter !== "all") && (
                <button onClick={clearAllFilters} className="text-[14px] leading-[14px] font-medium text-[#FC6719] opacity-100 hover:opacity-80 transition-opacity">
                  Clear all
                </button>
              )}
            </div>

            {/* TYPE Filter */}
            {typeFilter !== "all" && (
              <div className="relative w-full sm:w-[193px] h-[45px]">
                <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2">
                  <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                    TYPE
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize">
                      {typeFilter}
                    </p>
                    <button onClick={() => setTypeFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]">
                      <X className="h-3 w-3 text-[#3B444D]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY Filter */}
            {categoryFilter !== "all" && (
              <div className="relative w-full sm:w-[193px] h-[45px]">
                <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2">
                  <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                    CATEGORY
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize">
                      {categoryFilter}
                    </p>
                    <button onClick={() => setCategoryFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]">
                      <X className="h-3 w-3 text-[#3B444D]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Popup Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 flex justify-center p-4 box-shadow-lg">
          <div className={`fixed inset-0 flex items-center justify-center z-50 ${isFilterModalOpen ? "visible" : "invisible"}`}>
            {/* Background overlay */}
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setIsFilterModalOpen(false)}
            ></div>

            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-2 overflow-y-auto">
              <div className="flex justify-center items-center p-6 pb-0">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="absolute top-4 right-4 flex justify-center items-center bg-[#F5F5FA] rounded-full w-[30px] h-[30px] hover:text-gray-600 transition-colors"
                >
                  <img src="/cancel-filter.svg" alt="cancel-img" className="h-[12px] w-[12px]" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                {/* Type Filter */}
                <div className="relative">
                  <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={tempTypeFilter}
                    onChange={(e) => setTempTypeFilter(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7]"
                  >
                    <option className="text-[#A8ACB7]" value="all">All Types</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={tempCategoryFilter}
                    onChange={(e) => setTempCategoryFilter(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-white focus:border-white text-[#A8ACB7]"
                  >
                    <option className="text-[#A8ACB7]" value="all">All Categories</option>
                    <option value="Current Assets">Current Assets</option>
                    <option value="Fixed Assets">Fixed Assets</option>
                    <option value="Current Liabilities">Current Liabilities</option>
                    <option value="Equity">Equity</option>
                    <option value="Income">Income</option>
                    <option value="Cost of Sales">Cost of Sales</option>
                    <option value="Operating Expenses">Operating Expenses</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center items-center w-full space-x-3 p-6 pt-0">
                <button
                  onClick={applyFilters}
                  className="w-full max-w-[370px] h-[50px] text-white font-medium text-[14px] rounded-[10px] opacity-100 
                    bg-gradient-to-l from-[#66A4E4] to-[#575DD5] 
                    hover:opacity-90 transition-all duration-300"
                >
                  <span className="font-medium text-white">Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Table */}
     <div className="bg-white shadow rounded-lg overflow-hidden">
  <div className="min-h-[400px] overflow-x-auto">
    {currentItems.length === 0 ? (
      <div className="p-8 sm:p-12 text-center">
        <div className="text-4xl sm:text-6xl mb-4">📝</div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Accounts Found</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
            ? "Try adjusting your search or filter criteria."
            : "No accounts available."}
        </p>
      </div>
    ) : (
      <>
       {/* <div className="min-w-0 max-w-full overflow-x-auto"> */}
  <div className="w-full overflow-x-auto">
    <table className="min-w-[800px] w-full divide-y divide-gray-200 text-center">
      <thead className="w-full h-[50px] bg-[#F6F5FA] rounded-[10px] opacity-100 sticky top-0">
        <tr>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
            ACCOUNT #
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[120px]">
            ACCOUNT NAME
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
            DOCUMENTS
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[80px]">
            TYPE
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
            CATEGORY
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
            BALANCE
          </th>
          <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
            ACTIONS
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {currentItems.map((account, index) => (
          <tr
            key={account.id}
            onClick={() => handleRowClick(account.id)}
            className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer 
              ${selectedRowId === account.id
                ? "bg-purple-100 shadow-lg"
                : "hover:shadow-md hover:bg-gray-100"
              }`}
          >
            <td className="text-[10px] sm:text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-3 sm:px-4 py-3 min-w-[100px]">
              {account.id}
            </td>

            <td className="px-3 sm:px-4 py-3 text-left text-[12px] sm:text-[14px] leading-[16px] font-bold text-[#191616] opacity-100 min-w-[120px]">
              {account.name}
            </td>

            <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap min-w-[100px]">
              <div className="flex justify-start items-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm text-gray-900">{account.documentCount} files</span>
              </div>
            </td>

            <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap min-w-[80px]">
              <span
                className={`inline-flex justify-center items-center w-[70px] sm:w-[80px] h-[20px] sm:h-[24px] rounded-[6px] ${getStatusColor(account.type)} text-white text-[8px] sm:text-xs uppercase font-bold opacity-100`}
              >
                <span className="text-white text-[8px] sm:text-[10px] leading-[12px] font-semibold font-inter tracking-[1px] sm:tracking-[2px] uppercase text-center">{account.type}</span>
              </span>
            </td>

            <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[100px]">
              {account.category}
            </td>

            <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-[10px] sm:text-[12px] leading-[16px] font-normal text-[#191616] opacity-100 min-w-[100px]">
              {account.balance}
            </td>

            <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap min-w-[100px]">
              <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                <button className="text-blue-600 hover:text-blue-700 transition-colors" title="View Details">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-700 transition-colors">
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button className="text-gray-600 hover:text-red-700 transition-colors">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button className="md:hidden text-gray-600 hover:text-gray-700 transition-colors">
                  <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
{/* </div> */}

{/* Pagination Controls */}
<div className="h-auto sm:h-[55px] w-full bg-[#F5F5FA] sticky-bottom-0 rounded-[10px] opacity-100 px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sticky bottom-0 z-10">
  <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between gap-3 sm:gap-0 w-full">
    <div className="text-center sm:text-left">
      <p className="text-xs sm:text-sm text-gray-700">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAccounts.length)}</span> of{' '}
        <span className="font-medium">{filteredAccounts.length}</span> results
      </p>
    </div>
    <div className="w-full sm:w-auto">
      <nav
        className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-[258px] h-[40px] bg-[#FAFAFC] border border-[#EEEFF2] rounded-[6px] opacity-100 px-1 sm:px-2"
        aria-label="Pagination"
      >
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[4px] transition-colors border-r-2 sm:border-r-4 border-gray-200 pr-1 sm:pr-2 
            ${currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          <span className={`flex items-center justify-center h-3 w-3 sm:h-[14px] sm:w-[14px] rounded 
            ${currentPage === 1 ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
            <HiArrowLeftCircle className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === 1 ? "text-gray-500" : "text-white"}`} />
          </span>
          <span className={`text-[10px] sm:text-[12px] leading-[16px] font-bold ${currentPage === 1 ? "text-gray-400" : "text-[#3F058F]"} w-6 sm:w-[28px] h-3 sm:h-[15px] text-center opacity-100`}>
            Prev
          </span>
        </button>

        {/* Page Numbers */}
        {(() => {
          const visiblePages = window.innerWidth < 640 ? 3 : 5;
          let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
          let endPage = Math.min(totalPages, startPage + visiblePages - 1);

          if (endPage - startPage < visiblePages - 1) {
            startPage = Math.max(1, endPage - visiblePages + 1);
          }

          return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 sm:w-[32px] sm:h-[33px] text-xs sm:text-sm rounded-[4px] opacity-100 flex items-center justify-center 
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
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[4px] transition-colors border-l-2 sm:border-l-4 border-gray-200 pl-1 sm:pl-2
            ${currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          <span className={`text-[10px] sm:text-[12px] leading-[16px] font-bold w-6 sm:w-[28px] h-3 sm:h-[15px] text-center 
            ${currentPage === totalPages ? "text-gray-400" : "text-[#3F058F]"} opacity-100`}>
            Next
          </span>
          <span className={`flex items-center justify-center h-3 w-3 sm:h-[14px] sm:w-[14px] rounded 
                ${currentPage === Math.ceil(filteredAccounts.length / 10) ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
            <HiArrowRightCircle className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === Math.ceil(filteredAccounts.length / 10) ? "text-gray-500" : "text-white"}`} />
          </span>
        </button>
      </nav>
    </div>
  </div>
</div>
      </>
    )}
  </div>
</div>
    </div>
  );
}