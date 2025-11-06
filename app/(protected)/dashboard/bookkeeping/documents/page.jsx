"use client";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Eye, Trash2, File, X, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { HiArrowLeftCircle, HiArrowRightCircle } from "react-icons/hi2";
import { useFilterModal } from "@/src/components/DashboardLayout";
import DocumentUploadModal from "../../../../../src/components/uploadDocumentModal.jsx";
import DocumentPreviewModal from "../../../../../src/components/DocumentPreviewModal.jsx";
import { BASE_URL } from "@/src/components/BaseUrl.jsx";
import { motion } from "framer-motion";
export default function Documents() {
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tempTypeFilter, setTempTypeFilter] = useState("all");
  const [tempCategoryFilter, setTempCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const itemsPerPage = 10;
  const [documents, setDocuments] = useState([]);
  const { uid } = JSON.parse(localStorage.getItem("userProfile"));
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [docId, setDocId] = useState(null);
  
  // Get unique document types and categories from API response for dynamic filters
  const documentTypes = [...new Set(documents.map(doc => doc.document_type).filter(Boolean))];
  const categories = [...new Set(documents.map(doc => doc.category).filter(Boolean))];

  const handleUpload = () => {
    setIsUploadModalOpen(true);
    toast.success("Document upload initiated");
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const getDocuments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/getAllDocuments/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setDocuments(data);

    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const getStatusGradient = (status) => {
    if (status === "Processed") {
      return "bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)]";
    } else if (status === "Pending") {
      return "bg-[linear-gradient(135deg,#F59E0B_0%,#D97706_100%)]";
    }
    return "bg-[linear-gradient(135deg,#6B7280_0%,#4B5563_100%)]";
  };

  const handleSaveDocument = (documentData) => {
    const newDocument = {
      ...documentData,
      file: undefined
    };

    setDocuments(prev => [newDocument, ...prev]);
    toast.success(`Document "${documentData.name}" uploaded successfully!`);
  };

  const handleView = (docId) => {
    setIsViewModalOpen(true);
    setDocId(docId);
  };

  const handleDownloadDocument = async (docId, docName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/download-doc/${docId}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to download document");

      const blob = await response.blob();
      const contentType = response.headers.get("Content-Type") || "";
      const contentDisposition = response.headers.get("Content-Disposition");

      let filename = docName || `document_${docId}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (match?.[1]) filename = match[1];
      } else {
        const ext = contentType.split("/")[1] || "bin";
        filename = `${docId}.${ext}`;
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`"${filename}" downloaded successfully`);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(error.message || "Download failed");
    }
  };

  const handleDelete = (docId) => {
    toast.error(`Document ${docId} deleted`);
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchTerm("");
  };

  const applyFilters = () => {
    setTypeFilter(tempTypeFilter);
    setCategoryFilter(tempCategoryFilter);
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleRowClick = (id) => {
    setSelectedRowId(id === selectedRowId ? null : id);
  };

  // Fixed filter logic - aligned with API response fields
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === "" ||
      (doc.doc_name && doc.doc_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === "all" || 
      (doc.document_type && doc.document_type === typeFilter);

    const matchesCategory = categoryFilter === "all" || 
      (doc.category && doc.category === categoryFilter);

    return matchesSearch && matchesType && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const currentItems = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log('Filter debug:', {
    searchTerm,
    typeFilter, 
    categoryFilter,
    totalDocuments: documents.length,
    filteredCount: filteredDocuments.length,
    documentTypes,
    categories
  });

  return (
            <motion.div className=" flex flex-col min-h-screen ">
    
    <div className="space-y-3 p-3 max-h-[calc(100vh)] overflow-y-auto pb-24 sm:pb-8">
      <DocumentUploadModal
        getDocuments={getDocuments}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleSaveDocument}
      />
      <DocumentPreviewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        docId={docId}
      />
      <div className="flex items-center ">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Documents</h2>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 mt-2 sm:mt-4">
        {[
          {
            title: "Total Files",
            count: documents.length,
            icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />,
            bg: "/Rectangle145138.svg",
            rounded: "rounded-[20px_6px_6px_6px] sm:rounded-[30px_6px_6px_6px] lg:rounded-[40px_6px_6px_6px]",
            borderColor: "#7285D5",
            iconBg: "#9A6EEF",
          },
          {
            title: "Invoices",
            count: documents.filter(doc => doc.category === "Invoices").length,
            icon: <File className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />,
            bg: "/Rectangle145211orange.svg",
            rounded: "rounded-[6px]",
            borderColor: "#DD7949",
            iconBg: "#E86118",
          },
          {
            title: "Statements",
            count: documents.filter(doc => doc.category === "Statements").length,
            icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />,
            bg: "/Rectangle145235blue.svg",
            rounded: "rounded-[6px]",
            borderColor: "#7285D5",
            iconBg: "#4C56CC",
          },
          {
            title: "Receipts",
            count: documents.filter(doc => doc.category === "Receipts").length,
            icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />,
            bg: "/Rectangle45212.svg",
            rounded: "rounded-[6px_6px_20px_6px] sm:rounded-[6px_6px_30px_6px] lg:rounded-[6px_6px_40px_6px]",
            borderColor: "#3CB0A5",
            iconBg: "#229187",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`relative w-full h-[110px] sm:h-[120px] lg:h-[130px] ${card.rounded} 
        bg-cover bg-no-repeat hover:shadow-md transition-all cursor-pointer p-2 sm:p-3`}
            style={{ backgroundImage: `url(${card.bg})` }}
          >
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2 sm:gap-3 pb-1">
                <div
                  className="p-1.5 sm:p-2 rounded-full w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] flex items-center justify-center"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {card.icon}
                </div>
                <p className="text-xs sm:text-sm font-medium text-white uppercase tracking-wider">
                  {card.title}
                </p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white mt-1">{card.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="">
        <div className="flex items-center justify-center flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex flex-col border border-gray-100 p-1 md:flex-row items-center gap-3 w-full">
            {/* 🔍 Search Section */}
            <div className="relative flex-1 w-full bg-left-top opacity-100">
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

              {isSearchActive && (
                <div className="relative w-4/5">
                  <img
                    src="/search-icon-2.svg"
                    alt="search-icon"
                    className="w-4 h-4 sm:w-[17px] sm:h-[17px] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    placeholder="Search documents by name, type, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base dark:bg-gray-800 dark:text-white dark:border-gray-600"
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

            {/* 🧩 Filter + Upload Document Buttons (Hidden when search active) */}
            {!isSearchActive && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                  className="flex items-center justify-center gap-2 w-full sm:w-[123px] h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[8px] transition-colors hover:bg-gray-200 px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  <img src="/filter-icon.png" alt="filter-icon" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                  <span className="text-[14px] leading-[11px] font-medium text-[#625377] dark:text-gray-400">
                    Filters
                  </span>
                  {(typeFilter !== "all" || categoryFilter !== "all") && (
                    <span className="w-[19px] h-[19px] bg-[#E4E3F1] border border-[#E4E3F1] rounded-full flex items-center justify-center text-[#615376] text-[12px]">
                      {[
                        typeFilter !== "all" ? 1 : 0,
                        categoryFilter !== "all" ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleUpload}
                  className="w-full sm:w-[166px] h-[42px] bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] rounded-[10px_10px_10px_0px] opacity-100 flex items-center justify-center text-white gap-2 text-sm sm:text-base hover:opacity-90 transition-opacity"
                >
                  <Upload className="w-4 h-4" /> Upload Document
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
                <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                    TYPE
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize dark:text-white">
                      {typeFilter}
                    </p>
                    <button onClick={() => setTypeFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1] dark:bg-gray-600 dark:border-gray-500">
                      <X className="h-3 w-3 text-[#3B444D] dark:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY Filter */}
            {categoryFilter !== "all" && (
              <div className="relative w-full sm:w-[193px] h-[45px]">
                <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                    CATEGORY
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize dark:text-white">
                      {categoryFilter}
                    </p>
                    <button onClick={() => setCategoryFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1] dark:bg-gray-600 dark:border-gray-500">
                      <X className="h-3 w-3 text-[#3B444D] dark:text-white" />
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
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setIsFilterModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-2 overflow-y-auto dark:bg-gray-800">
              <div className="flex justify-center items-center p-6 pb-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="absolute top-4 right-4 flex justify-center items-center bg-[#F5F5FA] rounded-full w-[30px] h-[30px] hover:text-gray-600 transition-colors dark:bg-gray-700"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                {/* Type Filter - Dynamic based on API data */}
                <div className="relative">
                  <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1 dark:text-white">
                    Type
                  </label>
                  <select
                    value={tempTypeFilter}
                    onChange={(e) => setTempTypeFilter(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option className="text-[#A8ACB7]" value="all">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                </div>

                {/* Category Filter - Dynamic based on API data */}
                <div className="relative">
                  <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1 dark:text-white">
                    Category
                  </label>
                  <select
                    value={tempCategoryFilter}
                    onChange={(e) => setTempCategoryFilter(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option className="text-[#A8ACB7]" value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                </div>
              </div>

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

      {/* Documents Table */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="min-h-[400px] overflow-x-auto">
            {currentItems.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">📝</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 dark:text-white">No Documents Found</h3>
                <p className="text-gray-600 text-sm sm:text-base dark:text-gray-400">
                  {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No documents available."}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[800px] w-full divide-y divide-gray-200 text-center">
                    <thead className="w-full h-[50px] bg-[#F6F5FA] rounded-[10px] opacity-100 sticky top-0 dark:bg-gray-800">
                      <tr>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          DOCUMENT #
                        </th>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          FILE NAME
                        </th>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          TYPE
                        </th>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          CATEGORY
                        </th>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          SIZE
                        </th>
                        <th className="text-left text-[10px] sm:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 sm:px-4 py-3 dark:text-white">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200 text-center dark:bg-gray-800">
                      {currentItems.map((doc, index) => (
                        <tr
                          key={doc.id}
                          onClick={() => handleRowClick(doc.id)}
                          className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer 
            ${selectedRowId === doc.id
                              ? "bg-purple-100 shadow-lg dark:bg-purple-900/20"
                              : "hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            } dark:bg-gray-800`}
                        >
                          <td className="text-[10px] sm:text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-3 sm:px-4 py-3 dark:text-purple-400">
                            {index + 1}
                          </td>

                          <td className="px-2 sm:px-2 py-3 text-left text-[12px] sm:text-[14px] leading-[16px] font-bold text-[#191616] opacity-100 dark:text-white">
                            {doc.doc_name}
                          </td>

                          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{doc.document_type}</span>
                          </td>

                          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                            {doc.category}
                          </td>

                          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap text-[10px] sm:text-[12px] leading-[16px] font-normal text-[#191616] opacity-100 dark:text-white">
                            {doc.file_size_mb + " MB"}
                          </td>

                          <td className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">
                            <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(doc.id);
                                }}
                                className="text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400"
                                title="View Details"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadDocument(doc.id, doc.doc_name);
                                }}
                                className="text-gray-600 hover:text-gray-700 transition-colors dark:text-gray-400"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
                                className="text-gray-600 hover:text-red-700 transition-colors dark:text-gray-400"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button className="md:hidden text-gray-600 hover:text-gray-700 transition-colors dark:text-gray-400">
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
                <div className="h-auto sm:h-[55px] w-full bg-[#F5F5FA] rounded-[10px] opacity-100 px-3 sm:px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sticky bottom-0 z-10 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between gap-3 sm:gap-0 w-full">
                    <div className="text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDocuments.length)}</span> of{' '}
                        <span className="font-medium">{filteredDocuments.length}</span> results
                      </p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <nav
                        className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-[258px] h-[40px] bg-[#FAFAFC] border border-[#EEEFF2] rounded-[6px] opacity-100 px-1 sm:px-2 dark:bg-gray-700 dark:border-gray-600"
                        aria-label="Pagination"
                      >
                        {/* Previous Button */}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[4px] transition-colors border-r-2 sm:border-r-4 border-gray-200 pr-1 sm:pr-2 
            ${currentPage === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 dark:bg-gray-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                            }`}
                        >
                          <span className={`flex items-center justify-center h-3 w-3 sm:h-[14px] sm:w-[14px] rounded 
                                ${currentPage === 1 ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
                            <HiArrowLeftCircle className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === 1 ? "text-gray-500" : "text-white"}`} />
                          </span>
                          <span className={`text-[10px] sm:text-[12px] leading-[16px] font-bold ${currentPage === 1 ? "text-gray-400" : "text-[#3F058F] dark:text-purple-400"} w-6 sm:w-[28px] h-3 sm:h-[15px] text-center opacity-100`}>
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
                                    : "bg-white text-[#191616] hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
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
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 dark:bg-gray-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                            }`}
                        >
                          <span className={`text-[10px] sm:text-[12px] leading-[16px] font-bold w-6 sm:w-[28px] h-3 sm:h-[15px] text-center 
            ${currentPage === totalPages ? "text-gray-400" : "text-[#3F058F] dark:text-purple-400"} opacity-100`}>
                            Next
                          </span>
                          <span className={`flex items-center justify-center h-3 w-3 sm:h-[14px] sm:w-[14px] rounded 
                                                    ${currentPage === Math.ceil(filteredDocuments.length / 10) ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
                            <HiArrowRightCircle className={`h-2 w-2 sm:h-[10px] sm:w-[10px] ${currentPage === Math.ceil(filteredDocuments.length / 10) ? "text-gray-500" : "text-white"}`} />
                          </span>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </motion.div> 
  );
}