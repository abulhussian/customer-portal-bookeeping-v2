"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, X, Eye, FileText, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useFilterModal } from "@/src/components/DashboardLayout";

export default function JournalEntries() {
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  // Search and Filter States
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tempTypeFilter, setTempTypeFilter] = useState("all");
  const [tempCategoryFilter, setTempCategoryFilter] = useState("all");

  // Table States
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Journal Entries States
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2024-01-15",
      reference: "JE-001",
      description: "Monthly rent payment",
      debitAccount: "Rent Expense",
      creditAccount: "Cash",
      amount: "$2,000.00",
      type: "Expense",
      category: "Operating Expenses",
      documentCount: 2
    },
    {
      id: 2,
      date: "2024-01-14",
      reference: "JE-002",
      description: "Customer payment received",
      debitAccount: "Cash",
      creditAccount: "Accounts Receivable",
      amount: "$5,000.00",
      type: "Asset",
      category: "Current Assets",
      documentCount: 1
    },
    {
      id: 3,
      date: "2024-01-13",
      reference: "JE-003",
      description: "Office supplies purchase",
      debitAccount: "Office Supplies",
      creditAccount: "Accounts Payable",
      amount: "$350.00",
      type: "Expense",
      category: "Operating Expenses",
      documentCount: 3
    },
    {
      id: 4,
      date: "2024-01-12",
      reference: "JE-004",
      description: "Equipment purchase",
      debitAccount: "Equipment",
      creditAccount: "Cash",
      amount: "$12,500.00",
      type: "Asset",
      category: "Fixed Assets",
      documentCount: 4
    },
    {
      id: 5,
      date: "2024-01-11",
      reference: "JE-005",
      description: "Loan payment",
      debitAccount: "Loan Payable",
      creditAccount: "Cash",
      amount: "$1,200.00",
      type: "Liability",
      category: "Current Liabilities",
      documentCount: 2
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    date: "",
    reference: "",
    description: "",
    debitAccount: "",
    creditAccount: "",
    amount: "",
  });

  // Search and Filter Functions
  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchTerm("");
  };

  const applyFilters = () => {
    setTypeFilter(tempTypeFilter);
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
  };

  // Table Functions
  const handleRowClick = (id) => {
    setSelectedRowId(id === selectedRowId ? null : id);
  };

  const getStatusColor = (type) => {
    const colors = {
      'Asset': 'bg-green-500',
      'Liability': 'bg-red-500',
      'Equity': 'bg-blue-500',
      'Revenue': 'bg-purple-500',
      'Expense': 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  // Filter entries based on search and filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.debitAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.creditAccount.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const currentItems = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Journal Entries Functions
  const handleAddEntry = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newEntry.date || !newEntry.description || !newEntry.debitAccount || !newEntry.creditAccount || !newEntry.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Add new entry
    const entry = {
      id: entries.length + 1,
      date: newEntry.date,
      reference: newEntry.reference || `JE-00${entries.length + 1}`,
      description: newEntry.description,
      debitAccount: newEntry.debitAccount,
      creditAccount: newEntry.creditAccount,
      amount: `$${parseFloat(newEntry.amount).toFixed(2)}`,
      type: "Expense", // You might want to calculate this based on accounts
      category: "Operating Expenses", // You might want to calculate this based on accounts
      documentCount: 0
    };

    setEntries([entry, ...entries]);
    toast.success("Journal entry added successfully!");

    // Reset form
    setNewEntry({
      date: "",
      reference: "",
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: "",
    });
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast.success("Journal entry deleted successfully!");
  };

  const handleClearForm = () => {
    setNewEntry({
      date: "",
      reference: "",
      description: "",
      debitAccount: "",
      creditAccount: "",
      amount: "",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-h-[calc(100vh)] overflow-y-auto pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Journal Entries</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Record and manage your accounting transactions
          </p>
        </div>
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

      {/* Add New Entry Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl">Add New Entry</CardTitle>
          <CardDescription className="text-gray-600">
            Create a new journal entry for your transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-sm font-medium text-gray-700">
                  Reference Number
                </Label>
                <Input
                  id="reference"
                  placeholder="JE-004"
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Enter transaction description..."
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                rows={2}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debitAccount" className="text-sm font-medium text-gray-700">
                  Debit Account *
                </Label>
                <select
                  value={newEntry.debitAccount}
                  onChange={(e) => setNewEntry({ ...newEntry, debitAccount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                  required
                >
                  <option value="">Select account</option>
                  <option value="Cash">Cash</option>
                  <option value="Accounts Receivable">Accounts Receivable</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Rent Expense">Rent Expense</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAccount" className="text-sm font-medium text-gray-700">
                  Credit Account *
                </Label>
                <select
                  value={newEntry.creditAccount}
                  onChange={(e) => setNewEntry({ ...newEntry, creditAccount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                  required
                >
                  <option value="">Select account</option>
                  <option value="Cash">Cash</option>
                  <option value="Accounts Payable">Accounts Payable</option>
                  <option value="Accounts Receivable">Accounts Receivable</option>
                  <option value="Sales Revenue">Sales Revenue</option>
                  <option value="Owner's Equity">Owner's Equity</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Entries Card with Your Table Design */}
      <Card className="shadow-sm">
        {/* Search and Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-lg ">
          <div className="flex items-center justify-center flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex flex-col border border-gray-100 p-2 md:flex-row items-center gap-3 w-full">
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
                  <div className="relative w-4/5">
                    <img
                      src="/search-icon-2.svg"
                      alt="search-icon"
                      className="w-4 h-4 sm:w-[17px] sm:h-[17px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      placeholder="Search entries by reference, description, or accounts..."
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
                  </div>
                )}
              </div>

              {/* 🧩 Filter + Add Entry Buttons (Hidden when search active) */}
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
                    {/* ✅ Show badge only when filters are actually applied */}
      {(
        (typeFilter && typeFilter !== "" && typeFilter !== "all" && typeFilter !== "All Types") ||
        (categoryFilter && categoryFilter !== "" && categoryFilter !== "all" && categoryFilter !== "All Categories")
      ) && (
        <span className="w-[19px] h-[19px] bg-[#E4E3F1] border border-[#E4E3F1] rounded-full flex items-center justify-center text-[#615376] text-[12px]">
          {[
            typeFilter && typeFilter !== "" && typeFilter !== "all" && typeFilter !== "All Types" ? 1 : 0,
            categoryFilter && categoryFilter !== "" && categoryFilter !== "all" && categoryFilter !== "All Categories" ? 1 : 0,
          ]
            .filter(Boolean)
            .length}
        </span>
      )}
                  </button>


                </div>
              )}
            </div>
          </div>

          {/* Applied Filters */}
          {(searchTerm || typeFilter !== "all" || categoryFilter !== "all") && (
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

              {/* Search Term Filter */}
              {searchTerm && (
                <div className="relative w-full sm:w-[193px] h-[45px]">
                  <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2">
                    <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                      SEARCH
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium truncate">
                        {searchTerm}
                      </p>
                      <button onClick={() => setSearchTerm('')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]">
                        <X className="h-3 w-3 text-[#3B444D]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl">Recent Entries</CardTitle>
          <CardDescription className="text-gray-600">
            View and edit your journal entries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="min-h-[400px] overflow-x-auto">
              {currentItems.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">📝</div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Journal Entries Found</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No journal entries available."}
                  </p>
                </div>
              ) : (
                <>
    <div className="w-full overflow-x-auto">
  <table className="min-w-[800px] w-full divide-y divide-gray-200 text-center">
    <thead className="w-full h-[50px] bg-[#F6F5FA] rounded-[10px] opacity-100 sticky top-0">
      <tr>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[80px]">
          DATE
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
          REFERENCE
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[120px]">
          DESCRIPTION
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[120px]">
          DEBIT ACCOUNT
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[120px]">
          CREDIT ACCOUNT
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[80px]">
          AMOUNT
        </th>
        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 min-w-[100px]">
          ACTIONS
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200 text-center">
      {currentItems.map((entry, index) => (
        <tr
          key={entry.id}
          onClick={() => handleRowClick(entry.id)}
          className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer 
            ${selectedRowId === entry.id
              ? "bg-purple-100 shadow-lg"
              : "hover:shadow-md hover:bg-gray-100"
            }`}
        >
          <td className="text-[10px] sm:text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-3 sm:px-4 py-3 min-w-[80px]">
            {entry.date}
          </td>

          <td className="px-2 sm:px-2 py-3 text-left text-[12px] sm:text-[14px] leading-[16px] font-bold text-[#191616] opacity-100 min-w-[100px]">
            {entry.reference}
          </td>

          <td className="px-2 sm:px-2 py-3 text-left text-[12px] sm:text-[14px] leading-[16px] text-[#191616] opacity-100 min-w-[120px]">
            {entry.description}
          </td> 
          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[120px]">
            {entry.debitAccount}
          </td>

          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-xs sm:text-sm text-gray-900 min-w-[120px]">
            {entry.creditAccount}
          </td>

          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-[10px] sm:text-[12px] leading-[16px] font-normal text-[#191616] opacity-100 min-w-[80px]">
            {entry.amount}
          </td>

          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap min-w-[100px]">
            <div className="flex justify-center items-center space-x-1 sm:space-x-2">
              <button className="text-blue-600 hover:text-blue-700 transition-colors" title="View Details">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button className="text-gray-600 hover:text-gray-700 transition-colors">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                className="text-gray-600 hover:text-red-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEntry(entry.id);
                }}
              >
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

{/* Pagination Controls */}
<div className="h-auto sm:h-[55px] w-full bg-[#F5F5FA] rounded-[10px] opacity-100 px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sticky bottom-0 z-10">
  <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between gap-3 sm:gap-0 w-full">
    <div className="text-center sm:text-left">
      <p className="text-xs sm:text-sm text-gray-700">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredEntries.length)}</span> of{' '}
        <span className="font-medium">{filteredEntries.length}</span> results
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
            <svg className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === 1 ? "text-gray-500" : "text-white"}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <span className={`text-[10px] sm:text-[12px] leading-[16px] font-bold ${currentPage === 1 ? "text-gray-400" : "text-[#3F058F]"} w-6 sm:w-[28px] h-3 sm:h-[15px] text-center opacity-100`}>
            Prev
          </span>
        </button>

        {/* Page Numbers */}
        {(() => {
          const visiblePages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
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
                ${currentPage === totalPages ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
            <svg className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === totalPages ? "text-gray-500" : "text-white"}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
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
        </CardContent>
      </Card>
    </div>
  );
}