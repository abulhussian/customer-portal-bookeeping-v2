
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Plus,
  FileText,
  Clock,
  Check,
  Eye,
  Edit,
  Users,
  Search,
  ArrowLeft,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  DollarSign,
  MessageSquare,
  Paperclip,
  X,
  Loader2,
  Download,
  FileCheck2,
  FilePenLine,
  FileUp,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeftIcon,
  ArrowRight,
  Menu,
} from "lucide-react"
import ReturnForm from "@/src/components/ReturnForm"
import { BASE_URL } from "@/src/components/BaseUrl"
import { useFilterModal } from "@/src/components/DashboardLayout"
import { toast } from "react-toastify"
import { HiArrowLeftCircle, HiArrowRightCircle, HiMiniArrowLeftCircle, HiMiniArrowRightCircle } from "react-icons/hi2";
import { formatDate } from "@/src/utils/validators"

function formatDateTime(iso) {
  return new Date(iso).toLocaleString()
}

function StatusPill({ status }) {
  const base = "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold"
  const tone =
    status === "Filed" || status === "Document verified"
      ? "bg-[#3DA79C] text-white"
      : status === "In Progress" || status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800"

  return <span className={`${base} ${tone}`}>{status}</span>
}

function DocIcon({ type, className }) {
  const c = `h-5 w-5 ${className || ""}`
  if (type === "pdf") return <FileText className={c} />
  if (type === "csv") return <FileSpreadsheet className={c} />
  if (type === "zip") return <FileArchive className={c} />
  if (["image", "jpg", "jpeg", "png"].includes(type)) return <FileImage className={c} />
  return <FileText className={c} />
}

const Returns = () => {
  const { isFilterModalOpen, setIsFilterModalOpen, setIsFormModalOpen } = useFilterModal();

  const getUserId = () => {
    try {
      const userString = localStorage.getItem("userProfile")
      const user = userString ? JSON.parse(userString) : null
      return user?.uid || localStorage.getItem("loginId")
    } catch (error) {
      return localStorage.getItem("loginId")
    }
  }
  
  const [selectedDate, setSelectedDate] = useState(null);
  const loginId = getUserId()
  const role = localStorage.getItem("role")
  const userId = loginId

  const [returns, setReturns] = useState([])
  const [allReturnsData, setAllReturnsData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const [tempStatusFilter, setTempStatusFilter] = useState("all")
  const [tempTypeFilter, setTempTypeFilter] = useState("all")
  const [tempDateFilter, setTempDateFilter] = useState("all")

  const [isSearchActive, setIsSearchActive] = useState(false)
  const [selectedReturnId, setSelectedReturnId] = useState(null)
  const [returnDetails, setReturnDetails] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [composerAttachments, setComposerAttachments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [returnId, setReturnId] = useState(null)
  const [customerName, setCustomerName] = useState("Unknown")
  const [userProfile, setUserProfile] = useState(null)
  const [updated, setUpdated] = useState(false)
  const fileInputRef = useRef(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const [selectedRowId, setSelectedRowId] = useState(null);

  useEffect(() => {
    if (isFilterModalOpen) {
      setTempStatusFilter(statusFilter)
      setTempTypeFilter(typeFilter)
      setTempDateFilter(dateFilter)
    }
  }, [isFilterModalOpen, statusFilter, typeFilter, dateFilter])

  const handleRowClick = (id) => {
    setSelectedRowId(id);
  };

  const fetchReturns = useCallback(async () => {
    if (!userId) {
      toast.error("User ID not found in localStorage")
      setLoading(false)
      return
    }

    setLoading(true)
    toast.error(null)

    try {
      const response = await fetch(`${BASE_URL}/api/tax-returns/${userId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()
      setAllReturnsData(data)

      const transformedReturns = data.map((returnItem) => ({
        id: returnItem.id.toString(),
        name: returnItem.tax_name || `Return #${returnItem.id}`,
        type: returnItem.return_type,
        price: returnItem.price,
        pricing_type: returnItem.pricing_type,
        status: returnItem.status,
        documentCount: returnItem.document_ids ? returnItem.document_ids.length : 0,
        createdDate: new Date(returnItem.modified_at).toISOString().split("T")[0],
        lastUpdated: new Date(returnItem.modified_at).toISOString().split("T")[0],
        taxYear: "2023",
        originalData: returnItem,
      }))

      setReturns(transformedReturns)
    } catch (error) {
      toast.error("Failed to fetch returns from server")
      setReturns([])
    } finally {
      setLoading(false)
    }
  }, [userId, refreshTrigger])

  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setTypeFilter(tempTypeFilter);

    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setDateFilter(formattedDate);
    } else {
      setDateFilter("all");
    }

    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
    setSelectedDate(null);
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false)
    setSearchTerm("")
  }

  const handleAddReturn = (newReturn) => {
    const returnWithId = {
      ...newReturn,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Pending",
      documentCount: newReturn.documents?.length || 0,
    }

    const updatedReturns = [returnWithId, ...returns]
    setReturns(updatedReturns)
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleUpdateReturn = (updatedReturn) => {
    const updatedReturns = returns.map((r) =>
      r.id === updatedReturn.id
        ? {
          ...updatedReturn,
          lastUpdated: new Date().toISOString().split("T")[0],
          documentCount: updatedReturn.documents?.length || 0,
        }
        : r,
    )
    setReturns(updatedReturns)
    setEditingReturn(null)
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const fetchReturnDetails = useCallback(async (id) => {
    if (!id) return

    setIsLoadingDetail(true)
    toast.error(null)

    try {
      const existingReturnData = allReturnsData.find((returnItem) => returnItem.id.toString() === id.toString())

      if (existingReturnData) {
        setReturnDetails(existingReturnData)
      } else {
        const detailsResponse = await fetch(`${BASE_URL}/api/tax-returns/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          setReturnDetails(details)
        }
      }

      const [documentsResponse, timelineResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/documents/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ ok: false })),
        fetch(`${BASE_URL}/api/comments/${id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ ok: false })),
      ])

      if (documentsResponse.ok) {
        const docs = await documentsResponse.json()
        setDocuments(docs)

        if (docs.length > 0) {
          const documentLink = docs[0].document_link || ""
          const customerNameFromLink = documentLink.split(/[\\/]/).pop()?.split("_")[0] || "Unknown"
          setCustomerName(customerNameFromLink)
          setReturnId(docs[0].return_id)
          setCustomerId(docs[0].customer_id)
        }
      }

      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json()
        setTimeline(timelineData)
      }
    } catch (error) {
      toast.error("Failed to load return details")
    } finally {
      setIsLoadingDetail(false)
    }
  }, [allReturnsData])

  const downloadDocument = useCallback(async (doc) => {
    try {
      const downloadUrl = `${BASE_URL}/api/download-doc/${doc.id}`
      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'document'

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1]
        }
      } else {
        fileName = doc.doc_name || `document_${doc.id}`
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = fileName
      link.style.display = "none"

      window.document.body.appendChild(link)
      link.click()

      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Failed to download document. Please try again.")
    }
  }, [])

  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const storedProfile = localStorage.getItem("userProfile")
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile)
          setUserProfile(parsedProfile)
          return parsedProfile
        }
      } catch (error) {
        toast.error("Failed to load user profile")
      }
      return null
    }

    const profile = loadUserProfile()
  }, [])

  useEffect(() => {
    if (selectedReturnId) {
      fetchReturnDetails(selectedReturnId)
    }
  }, [selectedReturnId, fetchReturnDetails])

  const uploadDocuments = async (files) => {
    if (!files || files.length === 0) return []

    const formData = new FormData()
    formData.append("customerId", customerId)
    formData.append("taxReturnId", returnId)
    formData.append("createdby_id", loginId)
    formData.append("createdby_type", role || "customer")
    formData.append("customerName", customerName)
    formData.append("comment", newComment)
    formData.append("category", returnDetails?.return_type || "Tax Return")
    files.forEach((file) => {
      formData.append("documents", file)
    })

    try {
      const response = await fetch(`${BASE_URL}/api/upload-documents`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const postCommentOnly = async (comment) => {
    const formData = new FormData()
    formData.append("customerId", customerId)
    formData.append("taxReturnId", returnId)
    formData.append("createdby_id", loginId)
    formData.append("createdby_type", role || "customer")
    formData.append("customerName", customerName)
    formData.append("comment", comment)
    formData.append("category", returnDetails?.return_type || "Tax Return")

    try {
      const response = await fetch(`${BASE_URL}/api/upload-documents`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(`Comment post failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const addComment = async () => {
    if (!newComment.trim() && composerAttachments.length === 0) {
      alert("Please add a comment or attach files")
      return
    }

    try {
      setIsUploading(true)
      let uploadedDocuments = []

      if (composerAttachments.length > 0) {
        const filesToUpload = composerAttachments.map((attachment) => attachment.file).filter(Boolean)
        if (filesToUpload.length > 0) {
          uploadedDocuments = await uploadDocuments(filesToUpload)
        }
      } else if (newComment.trim()) {
        await postCommentOnly(newComment.trim())
      }

      setNewComment("")
      setComposerAttachments([])

      if (selectedReturnId) {
        await fetchReturnDetails(selectedReturnId)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const created = files.map((f, i) => ({
      id: `att_${Date.now()}_${i}`,
      name: f.name,
      type: f.type.includes("image") ? "image" : f.name.split(".").pop() || "other",
      uploadedAt: new Date().toISOString(),
      file: f,
    }))

    setComposerAttachments((prev) => [...prev, ...created])
    e.currentTarget.value = ""
  }

  const stats = {
    total: returns.length,
    inReview: returns.filter((r) => r.status.toLowerCase() === "in review").length,
    initialRequest: returns.filter((r) => r.status.toLowerCase() === "initial request").length,
    documentVerified: returns.filter((r) => r.status.toLowerCase() === "document verified").length,
    inPreparation: returns.filter((r) => r.status.toLowerCase() === "in preparation").length,
    readyToFile: returns.filter((r) => r.status.toLowerCase() === "ready to file").length,
    filed: returns.filter((r) => r.status.toLowerCase() === "filed return").length,
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "initial request":
        return "bg-gradient-to-br from-[#5B8DEF] to-[#0063F7] text-white";
      case "document verified":
        return "bg-gradient-to-br from-[#FFB547] to-[#FF8800] text-white";
      case "in preparation":
        return "bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] text-white";
      case "in review":
        return "bg-gradient-to-br from-[#35714b] to-[#61af7e] text-white";
      case "ready to file":
        return "bg-gradient-to-br from-[#06B6D4] to-[#0891B2] text-white";
      case "filed return":
        return "bg-gradient-to-br from-[#10B981] to-[#059669] text-white";
      case "pending":
        return "text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  }

  const statusOptions = ["all", ...new Set(returns.map(item => item.status))];
  const typeOptions = ["all", ...new Set(returns.map(item => item.type))];

  const filteredReturns = returns.filter((returnItem) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      returnItem.id.toString().toLowerCase().includes(searchTermLower) ||
      returnItem.type?.toLowerCase().includes(searchTermLower) ||
      returnItem.status?.toLowerCase().includes(searchTermLower) ||
      returnItem.name?.toLowerCase().includes(searchTermLower);

    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    const matchesType = typeFilter === "all" || returnItem.type === typeFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const returnDate = new Date(returnItem.createdDate);
      const selected = new Date(dateFilter);

      const returnDateLocal = new Date(
        returnDate.getFullYear(),
        returnDate.getMonth(),
        returnDate.getDate()
      );

      const selectedLocal = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );

      matchesDate = returnItem.createdDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  
  const currentItems = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);

  const detailedReturns = returnDetails
    ? [
      {
        id: returnDetails.id?.toString() || selectedReturnId,
        name: returnDetails.return_type || `Return #${selectedReturnId}`,
        type: returnDetails.createdby_type || "Tax Return",
        status: returnDetails.status || "In Progress",
        updatedAt: returnDetails.modified_at || new Date().toISOString(),
        details: `Return type: ${returnDetails.return_type || "N/A"}. Status: ${returnDetails.status || "In Progress"}`,
        price: returnDetails.price,
        pricing_type: returnDetails.pricing_type,
      },
    ]
    : []

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden  ">
      <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-2 pb-8 overflow-x-hidden pb-24 sm:pb-8 ">
        {selectedReturnId ? (
          // Customer Detail View - Fully Responsive
          <div className="mx-auto max-w-7xl space-y-2 sm:space-y-3 overflow-x-hidden">
            <header className="flex items-center justify-between sticky top-0 bg-white z-20 py-2 sm:py-3 border-b border-gray-200 px-2 sm:px-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="rounded-md p-1.5 sm:p-2 hover:bg-gray-100"
                  onClick={() => setSelectedReturnId(null)}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Return Details</h1>
              </div>
            </header>

            {isLoadingDetail ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <section className="space-y-3 max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-150px)] overflow-y-auto pr-1 px-2 sm:px-0 overflow-x-hidden">
                {detailedReturns.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No tax return details found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Could not load details for this return.
                    </p>
                  </div>
                ) : (
                  detailedReturns.map((r) => (
                    <div key={r.id} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2">
                          <div className="text-base sm:text-lg text-gray-900">{r.name}</div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm text-gray-600">status:</span>
                          <StatusPill status={r.status} />
                        </div>
                      </div>

                      <div>
                        <div className="grid items-start gap-3 sm:gap-4 p-2 sm:p-3 lg:grid-cols-4">
                          {/* Return details - Full width on mobile, 3 cols on desktop */}
                          <div className="lg:col-span-3 rounded-md border border-gray-200 bg-white overflow-hidden">
                            <div className="p-3 sm:p-4">
                              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                Return details
                              </h2>
                              <p className="text-pretty text-xs sm:text-sm leading-relaxed text-gray-700 mb-3 sm:mb-4">
                                {r.details}
                              </p>
                              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <div>
                                  <div className="text-gray-500 mb-1">Return</div>
                                  <div className="font-medium text-gray-900">
                                    {r.name}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1">Type</div>
                                  <div className="font-medium text-gray-900">
                                    {r.type}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1">Last updated</div>
                                  <div className="font-medium text-gray-900">
                                    {formatDate(r.updatedAt)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1">Status</div>
                                  <StatusPill status={r.status} />
                                </div>
                              </div>
                            </div>

                            {/* Documents */}
                            <div className="border-t border-gray-200 p-3 sm:p-4 overflow-hidden">
                              <div className="text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                                Documents ({documents.length})
                              </div>
                              <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
                                {documents.map((d) => (
                                  <div
                                    key={d.id}
                                    className="group relative flex h-16 sm:h-20 w-20 sm:w-24 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
                                    title={d.doc_name}
                                  >
                                    <DocIcon
                                      type={d.doc_type}
                                      className="text-gray-600 h-5 w-5 sm:h-6 sm:w-6"
                                    />
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[9px] sm:text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 max-w-[90%] truncate">
                                      {d.doc_name && d.doc_name.length > 14
                                        ? d.doc_name.slice(0, 14) + "…"
                                        : d.doc_name || "Document"}
                                    </div>
                                    <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                      <button
                                        className="rounded bg-white/90 p-1 hover:bg-white"
                                        aria-label="View"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          alert(`Viewing ${d.doc_name || "document"}`)
                                        }}
                                      >
                                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-700" />
                                      </button>
                                      <button
                                        className="rounded bg-white/90 p-1 hover:bg-white"
                                        aria-label="Download"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          downloadDocument(d)
                                        }}
                                      >
                                        <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-700" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {documents.length === 0 && (
                                  <div className="text-xs sm:text-sm text-gray-500 py-4">
                                    No documents found for this return
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Pricing Information - Full width on mobile, 1 col on desktop */}
                          <aside className="self-start rounded-md border border-gray-200 bg-white p-3 sm:p-4 overflow-hidden">
                            <div className="mb-3 sm:mb-4 flex items-center justify-between">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                Pricing Information
                              </h3>
                              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                  Pricing Type
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs sm:text-sm text-gray-900">
                                  {r.pricing_type
                                    ? r.pricing_type === "hourly"
                                      ? "Hourly"
                                      : "Lump Sum"
                                    : "Not set"}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                  Price
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs sm:text-sm text-gray-900">
                                  {r.price ? `${r.price}` : "Not set"}
                                </div>
                              </div>
                            </div>
                          </aside>

                          {/* Comments + Timeline - Full width */}
                          <div className="lg:col-span-4 rounded-md border-gray-200 bg-white p-2 sm:p-3 overflow-hidden">
                            <div className="grid gap-3">
                              {/* Comment box */}
                              <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3 overflow-hidden">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                                    Add Comment & Upload Documents
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment or attach documents..."
                                    rows={3}
                                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.csv,.zip"
                                        className="sr-only"
                                        onChange={onFilesSelected}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto justify-center"
                                        disabled={isUploading}
                                      >
                                        <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        Attach Files
                                      </button>
                                      {composerAttachments.map((a) => (
                                        <span
                                          key={a.id}
                                          className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] sm:text-xs text-gray-700"
                                        >
                                          <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                          <span className="max-w-[100px] sm:max-w-none truncate">{a.name}</span>
                                          <button
                                            type="button"
                                            aria-label="Remove attachment"
                                            className="rounded p-0.5 hover:bg-gray-200"
                                            onClick={() =>
                                              setComposerAttachments((prev) =>
                                                prev.filter((d) => d.id !== a.id)
                                              )
                                            }
                                          >
                                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={addComment}
                                      disabled={
                                        isUploading ||
                                        (!newComment.trim() &&
                                          composerAttachments.length === 0)
                                      }
                                      className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                    >
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                          Uploading...
                                        </>
                                      ) : (
                                        "Post Comment"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3 md:p-4 overflow-hidden">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                                    Documents Timeline
                                  </span>
                                </div>

                                <ol className="relative mt-2 max-h-80 sm:max-h-96 overflow-y-auto">
                                  {timeline.map((t, index) => (
                                    <li key={t.id} className="flex mb-4 last:mb-0">
                                      <div className="flex flex-col items-center flex-shrink-0 mr-3 sm:mr-4">
                                        {index !== 0 && (
                                          <div className="w-0.5 h-3 sm:h-4 bg-blue-100 mb-1"></div>
                                        )}

                                        <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 z-10"></div>

                                        {index !== timeline.length - 1 && (
                                          <div className="w-0.5 h-3 sm:h-4 bg-blue-100 mt-1 flex-grow"></div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="p-2 sm:p-3 rounded-md border border-gray-100 bg-gray-50">
                                          <div className="mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                                {t.created_by_name} ({t.createdby_type})
                                              </span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs text-gray-500">
                                              {formatDateTime(t.created_at)}
                                            </span>
                                          </div>

                                          {t.comment && (
                                            <p className="text-xs sm:text-sm text-gray-700 break-words">
                                              {t.comment}
                                            </p>
                                          )}

                                          <div className="mt-2 text-[10px] sm:text-xs text-gray-500">
                                            Return ID: {t.return_id} | Document IDs: {t.document_ids}
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                  {timeline.length === 0 && (
                                    <li className="text-xs sm:text-sm text-gray-500 py-4 text-center">
                                      No activity yet
                                    </li>
                                  )}
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        ) : (
          // Main Returns List View - ALWAYS SHOW TABLE WITH HORIZONTAL SCROLLING
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 sm:space-y-3 overflow-y-auto max-h-[calc(100vh-0px)] sm:max-h-[calc(100vh-0px)] p-1 pb-8 sm:p-2 overflow-x-hidden"
          >
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-3 sm:mt-5">
              {/* Initial Request Card - Blue gradient */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "initial request" ? "all" : "initial request")
                }
                className="transition-shadow h-[120px] sm:h-[142px] bg-gradient-to-br from-[#5B8DEF] to-[#0063F7] text-white relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-tl-[30px] sm:rounded-tl-[50px] flex flex-col pt-3 sm:pt-4 pl-3 sm:pl-4 text-start rounded-sm"
              >
                {statusFilter === "initial request" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#5B8DEF] to-[#0063F7] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2 w-full">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#5B8DEF]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#5B8DEF] to-[#0063F7] flex items-center justify-center">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">Initial Request</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.initialRequest}</div>
                </div>
              </motion.div>

              {/* Document Verified Card - Orange gradient */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "document verified" ? "all" : "document verified")
                }
                className="rounded-sm p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-auto bg-gradient-to-br from-[#FFB547] to-[#FF8800] text-white relative cursor-pointer"
              >
                {statusFilter === "document verified" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#FFB547] to-[#FF8800] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#FFB547]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#FFB547] to-[#FF8800] flex items-center justify-center">
                      <FileCheck2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">Document Verified</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.documentVerified}</div>
                </div>
              </motion.div>

              {/* In Preparation Card - Medium Purple */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "in preparation" ? "all" : "in preparation")
                }
                className="rounded-sm p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-auto bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] text-white relative cursor-pointer"
              >
                {statusFilter === "in preparation" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#7B68EE]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#7B68EE] to-[#6A5ACD] flex items-center justify-center">
                      <FilePenLine className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">In Preparation</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.inPreparation}</div>
                </div>
              </motion.div>

              {/* In Review Card - Green gradient */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setStatusFilter(statusFilter === "in review" ? "all" : "in review")}
                className="rounded-sm p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-auto bg-gradient-to-br from-[#35714b] to-[#61af7e] text-white relative cursor-pointer"
              >
                {statusFilter === "in review" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#22C55E] to-[#35714b] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2 w-full">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#35714b]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#35714b] to-[#35714b] flex items-center justify-center">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">In Review</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.inReview}</div>
                </div>
              </motion.div>

              {/* Ready to File Card - Cyan gradient */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "ready to file" ? "all" : "ready to file")
                }
                className="rounded-sm p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-auto bg-gradient-to-br from-[#06B6D4] to-[#0891B2] text-white relative cursor-pointer"
              >
                {statusFilter === "ready to file" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#06B6D4]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center">
                      <FileUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">Ready to File</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.readyToFile}</div>
                </div>
              </motion.div>

              {/* Filed Return Card - Emerald gradient */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "filed return" ? "all" : "filed return")
                }
                className="rounded-br-[30px] sm:rounded-br-[50px] rounded-sm p-2 sm:p-3 shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-auto bg-gradient-to-br from-[#10B981] to-[#059669] text-white relative cursor-pointer"
              >
                {statusFilter === "filed return" && (
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2">
                    <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full p-0.5 sm:p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-1 sm:pb-2 border-[#10B981]">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-[10px] sm:text-sm font-medium uppercase leading-tight font-normal font-inter">Filed Return</h3>
                </div>
                <div>
                  <div className="text-base sm:text-[18px] leading-tight sm:leading-[38px] font-bold font-inter pl-1 sm:pl-2">{stats.filed}</div>
                </div>
              </motion.div>
            </div>

            {/* Search and Filter Bar - Responsive */}
            <div className="bg-white p-2 sm:p-3 overflow-hidden">
              <div className="flex items-center justify-center flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row border border-gray-100 p-2 sm:p-3 items-center gap-3 w-full">
                  {/* Search Section */}
                  <div className="relative flex-1 w-full pb-4 mt-2">
                    {!isSearchActive && (
                      <img
                        src="/searchsvg-1.svg"
                        alt="search"
                        onClick={() => setIsSearchActive(true)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] cursor-pointer hover:opacity-80 transition"
                      />
                    )}

                    {isSearchActive && (
                      <div className="relative w-4/5">
  <img
    src="/search-icon-2.svg"
    alt="search-icon"
    className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] absolute left-3 sm:left-4 top-2.5 sm:top-3"
  />
  <input
    type="text"
    placeholder="Search returns..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-8 sm:pl-10 pr-10 sm:pr-12 w-full py-1.5 sm:py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
  />
  <button
    onClick={handleCloseSearch}
    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
  >
    <X className="w-4 h-4 sm:w-5 sm:h-5" />
  </button>
</div>
                    )}
                  </div>

                  {/* Filter + New Tax Return Buttons */}
                  {!isSearchActive && (
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2">
                      <button
                        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                        className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-[123px] h-[38px] sm:h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[8px] transition-colors hover:bg-gray-200 relative px-3 sm:px-4 py-2"
                      >
                        <img src="/filter-icon.png" alt="filter-icon" className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
                        <span className="text-[12px] sm:text-[14px] leading-tight font-medium text-[#625377]">
                          Filters
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingReturn(null);
                          setShowForm(true);
                          setIsFormModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none sm:w-[166px] h-[38px] sm:h-[42px] bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] rounded-[10px_10px_10px_0px] opacity-100 flex items-center justify-center text-white gap-2 text-sm"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                        <span className="hidden xs:inline">New Tax Return</span>
                        <span className="xs:hidden">New Return</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Applied Filters - Responsive */}
              {(statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-4 items-center ">
                  <div className="pr-2 sm:pr-3 border-r-2 pl-1 sm:pl-2">
                    <h1 className="text-[10px] sm:text-[12px] leading-tight font-medium text-[#9398A5]">
                      Applied Filters
                    </h1>
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                      <button 
                        onClick={clearAllFilters} 
                        className="text-[12px] sm:text-[14px] leading-tight font-medium text-[#FC6719] hover:opacity-80 transition-opacity"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {statusFilter !== "all" && (
                    <div className="relative w-full xs:w-[180px] sm:w-[193px] h-[40px] sm:h-[45px]">
                      <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md w-full h-full px-3 sm:px-4 py-1.5 sm:py-2">
                        <p className="text-[9px] sm:text-[10px] leading-tight tracking-wider text-[#9398A5] font-medium uppercase">STATUS</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-[12px] leading-tight text-[#3B444D] font-medium uppercase truncate">{statusFilter}</p>
                          <button 
                            onClick={() => setStatusFilter('all')} 
                            className="absolute -right-1 sm:-right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center hover:bg-[#dcdbe1]"
                          >
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#3B444D]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {typeFilter !== "all" && (
                    <div className="relative w-full xs:w-[180px] sm:w-[193px] h-[40px] sm:h-[45px]">
                      <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md w-full h-full px-3 sm:px-4 py-1.5 sm:py-2">
                        <p className="text-[9px] sm:text-[10px] leading-tight tracking-wider text-[#9398A5] font-medium uppercase">TYPE</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-[12px] leading-tight text-[#3B444D] font-medium capitalize truncate">{typeFilter || "All Types"}</p>
                          <button 
                            onClick={() => setTypeFilter('all')} 
                            className="absolute -right-1 sm:-right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center hover:bg-[#dcdbe1]"
                          >
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#3B444D]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {dateFilter !== "all" && (
                    <div className="relative w-full xs:w-[180px] sm:w-[193px] h-[40px] sm:h-[45px]">
                      <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md w-full h-full px-3 sm:px-4 py-1.5 sm:py-2">
                        <p className="text-[9px] sm:text-[10px] leading-tight tracking-wider text-[#9398A5] font-medium uppercase">DATE</p>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] sm:text-[12px] leading-tight text-[#3B444D] font-medium capitalize truncate">
                            {new Date(dateFilter).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <button 
                            onClick={() => setDateFilter("all")} 
                            className="absolute -right-1 sm:-right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center hover:bg-[#dcdbe1]"
                          >
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#3B444D]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filters Popup Modal - Responsive */}
            {isFilterModalOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-2 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-center items-center p-4 sm:p-6 pb-2 sm:pb-3">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setIsFilterModalOpen(false)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 flex justify-center items-center bg-[#F5F5FA] rounded-full w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] hover:bg-gray-200 transition-colors"
                    >
                      <img src="/cancel-filter.svg" alt="cancel" className="h-[10px] w-[10px] sm:h-[12px] sm:w-[12px]" />
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-2">
                    {/* Status Filter */}
                    <div className="relative">
                      <label className="block text-xs sm:text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={tempStatusFilter}
                        onChange={(e) => setTempStatusFilter(e.target.value)}
                        className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#A8ACB7] text-sm"
                      >
                        <option className="text-[#A8ACB7]" value="all">All Statuses</option>
                        {statusOptions.filter((opt) => opt !== "all").map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/4 w-[12px] h-[7px] sm:w-[14px] sm:h-[8px] bg-[#A7ACB7] clip-path-triangle"></div>
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                      <label className="block text-xs sm:text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={tempTypeFilter}
                        onChange={(e) => setTempTypeFilter(e.target.value)}
                        className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#A8ACB7] text-sm"
                      >
                        <option className="text-[#A8ACB7]" value="all">All Types</option>
                        {typeOptions.filter((opt) => opt !== "all").map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/4 w-[12px] h-[7px] sm:w-[14px] sm:h-[8px] bg-[#A7ACB7] clip-path-triangle"></div>
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                      <label className="block text-xs sm:text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 text-[#A8ACB7] focus:outline-none focus:bg-[#FFE5D8] focus:ring-2 focus:ring-[#575DD5] text-sm"
                        placeholderText="Select date"
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/4 w-[12px] h-[7px] sm:w-[14px] sm:h-[8px] bg-[#A7ACB7] clip-path-triangle"></div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex justify-center items-center w-full space-x-3 p-4 sm:p-6 pt-2">
                    <button
                      onClick={applyFilters}
                      className="w-full h-[44px] sm:h-[50px] text-white font-medium text-[13px] sm:text-[14px] rounded-[10px] bg-gradient-to-l from-[#66A4E4] to-[#575DD5] hover:opacity-90 transition-all duration-300"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Returns Table - ALWAYS SHOW TABLE WITH HORIZONTAL SCROLLING */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-h-[300px] sm:min-h-[400px] w-full">
                  {filteredReturns.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Returns Found</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "No invoices available."}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-[1024px] w-full divide-y divide-gray-200">
                          <thead className="bg-[#F6F5FA] sticky top-0 z-10">
                            <tr>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                SN.NO
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Name
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Documents
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Type
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Last Updated
                              </th>
                              <th className="text-left text-[11px] xl:text-[12px] leading-[20px] font-medium text-[#3B444D] px-3 xl:px-4 py-3 whitespace-nowrap">
                                Actions
                              </th>
                            </tr>
                          </thead>

                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.map((returnItem, index) => (
                              <tr
                                key={returnItem.id}
                                onClick={() => handleRowClick(returnItem.id)}
                                className={`h-[55px] xl:h-[61px] transition-all cursor-pointer ${
                                  selectedRowId === returnItem.id
                                    ? "bg-gray-100 shadow-lg"
                                    : "hover:shadow-md hover:bg-gray-100"
                                }`}
                              >
                                <td className="text-[11px] xl:text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-3 xl:px-4 py-3 whitespace-nowrap">
                                  {index + 1}
                                </td>
                                <td className="px-2 xl:px-3 py-3 text-left text-[12px] xl:text-[14px] leading-[16px] font-bold text-[#191616] whitespace-nowrap">
                                  {returnItem.name}
                                </td>
                                <td className="px-3 xl:px-4 py-3 text-left whitespace-nowrap">
                                  <div className="flex justify-start items-center">
                                    <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-gray-400 mr-2" />
                                    <span className="text-[11px] xl:text-sm text-gray-900">{returnItem.documentCount} files</span>
                                  </div>
                                </td>
                                <td className="px-3 xl:px-4 py-3 text-left whitespace-nowrap text-[11px] xl:text-sm text-gray-900">
                                  {returnItem.type}
                                </td>
                                <td className="px-3 xl:px-4 py-3 text-left whitespace-nowrap">
                                  <span
                                    className={`inline-flex justify-center items-center w-[110px] xl:w-[130px] h-[22px] xl:h-[24px] rounded-[6px] ${getStatusColor(
                                      returnItem.status
                                    )} text-white text-[10px] xl:text-xs uppercase font-semibold whitespace-nowrap`}
                                  >
                                    {returnItem.status}
                                  </span>
                                </td>
                                <td className="px-3 xl:px-4 py-3 text-left whitespace-nowrap text-[10px] xl:text-[12px] leading-[16px] font-normal text-[#191616]">
                                  {formatDate(returnItem.lastUpdated)}
                                </td>
                                <td className="px-3 xl:px-4 py-3 text-left whitespace-nowrap">
                                  <div className="flex justify-center items-center">
                                    <button
                                      className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                                      title="View Details"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedReturnId(returnItem.id);
                                      }}
                                    >
                                      <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination Controls - Responsive */}
              <div className="h-auto sm:h-[55px] w-full bg-[#F5F5FA] rounded-[10px] p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3 sm:gap-0 sticky bottom-0 z-10" style={{marginBottom:'100px'}}>
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, filteredReturns.length)}</span> of{' '}
                  <span className="font-medium">{filteredReturns.length}</span> results
                </div>

                <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#FAFAFC] border border-[#EEEFF2] rounded-[6px] p-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[4px] transition-colors border-r-2 sm:border-r-4 border-gray-200 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded ${
                        currentPage === 1 ? "bg-gray-300" : "bg-[#3F058F]"
                      }`}
                    >
                      <HiArrowLeftCircle
                        className={`h-[9px] w-[9px] sm:h-[10px] sm:w-[10px] ${
                          currentPage === 1 ? "text-gray-500" : "text-white"
                        }`}
                      />
                    </span>
                    <span
                      className={`text-[11px] sm:text-[12px] leading-tight font-bold ${
                        currentPage === 1 ? "text-gray-400" : "text-[#3F058F]"
                      } hidden xs:inline`}
                    >
                      Prev
                    </span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 ">
                    {(() => {
                      const totalPages = Math.ceil(filteredReturns.length / 10);
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
                            className={`w-[28px] h-[28px] sm:w-[32px] sm:h-[33px] text-xs sm:text-sm rounded-[4px] flex items-center justify-center ${
                              currentPage === page
                                ? "bg-[#3F058F] text-white font-semibold"
                                : "bg-white text-[#191616] hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      );
                    })()}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, Math.ceil(filteredReturns.length / 10))
                      )
                    }
                    disabled={currentPage === Math.ceil(filteredReturns.length / 10)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[4px] transition-colors border-l-2 sm:border-l-4 border-gray-200 ${
                      currentPage === Math.ceil(filteredReturns.length / 10)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-[11px] sm:text-[12px] leading-tight font-bold ${
                        currentPage === Math.ceil(filteredReturns.length / 10)
                          ? "text-gray-400"
                          : "text-[#3F058F]"
                      } hidden xs:inline`}
                    >
                      Next
                    </span>
                    <span
                      className={`flex items-center justify-center h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded ${
                        currentPage === Math.ceil(filteredReturns.length / 10)
                          ? "bg-gray-300"
                          : "bg-[#3F058F]"
                      }`}
                    >
                      <HiArrowRightCircle
                        className={`h-[9px] w-[9px] sm:h-[10px] sm:w-[10px] ${
                          currentPage === Math.ceil(filteredReturns.length / 10)
                            ? "text-gray-500"
                            : "text-white"
                        }`}
                      />
                    </span>
                  </button>
                </nav>
              </div>
            </div>
          </motion.div>
        )}

        {showForm && (
          <ReturnForm
            isOpen={showForm}
            onClose={() => {
              setShowForm(false)
              setEditingReturn(null)
              setIsFormModalOpen(false)
            }}
            onSubmit={editingReturn ? handleUpdateReturn : handleAddReturn}
            editingReturn={editingReturn}
            customer={
              userProfile
                ? {
                  id: userProfile.uid,
                  name: userProfile.displayName,
                  token: userProfile.token,
                  onReturnAdded: () => setRefreshTrigger((prev) => prev + 1),
                }
                : null
            }
          />
        )}
      </main>
    </div>
  )
}

export default Returns