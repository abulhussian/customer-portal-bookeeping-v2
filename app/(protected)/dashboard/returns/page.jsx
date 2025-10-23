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
} from "lucide-react"
import ReturnForm from "@/src/components/ReturnForm"
import { BASE_URL } from "@/src/components/BaseUrl"
import { useFilterModal } from "@/src/components/DashboardLayout"
import { toast } from "react-toastify"
import { HiArrowLeftCircle, HiArrowRightCircle, HiMiniArrowLeftCircle, HiMiniArrowRightCircle } from "react-icons/hi2"; // Make sure the package is installed
import { formatDate } from "@/src/utils/validators"


// Helper components
// function formatDate(iso) {
//   return new Date(iso).toLocaleDateString()
// }

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
      return user?.uid || localStorage.getItem("loginId") // Fallback to old method
    } catch (error) {
      return localStorage.getItem("loginId")
    }
  }
  const [selectedDate, setSelectedDate] = useState(null);
  const loginId = getUserId()
  const role = localStorage.getItem("role")
  const userId = loginId

  const [returns, setReturns] = useState([])
  const [allReturnsData, setAllReturnsData] = useState([]) // Store complete returns data
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Temporary filter states for the modal (not applied until user clicks Apply)
  const [tempStatusFilter, setTempStatusFilter] = useState("all")
  const [tempTypeFilter, setTempTypeFilter] = useState("all")
  const [tempDateFilter, setTempDateFilter] = useState("all")

  const [isSearchActive, setIsSearchActive] = useState(false)
  // CustomerDetail state
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



  // Invoice filter states (new)
  const [invoiceDueDateFrom, setInvoiceDueDateFrom] = useState("")
  const [invoiceDueDateTo, setInvoiceDueDateTo] = useState("")
  const [invoiceStatus, setInvoiceStatus] = useState("Paid")
  const [invoiceCreationDateFrom, setInvoiceCreationDateFrom] = useState("")
  const [invoiceCreationDateTo, setInvoiceCreationDateTo] = useState("")
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(false)
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
      const response = await fetch(`${BASE_URL}/api/tax-returns/${userId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true"
            , "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      )


      const data = await response.json()

      setAllReturnsData(data)

      // Transform API data to match our expected format
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

  // const applyFilters = () => {
  //   setStatusFilter(tempStatusFilter)
  //   setTypeFilter(tempTypeFilter)
  //   setDateFilter(tempDateFilter)
  //   setIsFilterModalOpen(false)
  //   setCurrentPage(1) // Reset to first page when filters change
  // }
  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setTypeFilter(tempTypeFilter);

    if (selectedDate) {
      // Manual construction avoids timezone issues
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


  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
    setSelectedDate(null);
    setIsSearching(false)
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
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh after adding a new return
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
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh after updating a return
  }

  const fetchReturnDetails = useCallback(
    async (id) => {
      if (!id) return

      setIsLoadingDetail(true)
      toast.error(null)

      try {
        const existingReturnData = allReturnsData.find((returnItem) => returnItem.id.toString() === id.toString())

        if (existingReturnData) {
          setReturnDetails(existingReturnData)
        } else {
          // Fallback to API call if data not found (shouldn't happen normally)
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

        // Still fetch documents and timeline as these are separate endpoints
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

        // Handle documents
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

        // Handle timeline
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json()
          setTimeline(timelineData)
        }
      } catch (error) {
        toast.error("Failed to load return details")
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [allReturnsData],
  )

  const downloadDocument = useCallback(async (doc) => {
    try {
      const downloadUrl = `${BASE_URL}/api/download-doc/${doc.id}`
      const response = await fetch(downloadUrl, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(`Download failed: ${response.status}`)

      // Get the filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'document'

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1]
        }
      } else {
        // Fallback: use doc name or ID
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

      // Cleanup
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("Failed to download document. Please try again.")
    }
  }, [])

  // Initial data loading
  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  useEffect(() => {
    // Load user profile from localStorage
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

  // Load detailed data when a return is selected
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
        // Has attachments - use document upload API
        const filesToUpload = composerAttachments.map((attachment) => attachment.file).filter(Boolean)
        if (filesToUpload.length > 0) {
          uploadedDocuments = await uploadDocuments(filesToUpload)
        }
      } else if (newComment.trim()) {
        // Comment only - use comment posting API
        await postCommentOnly(newComment.trim())
      }

      setNewComment("")
      setComposerAttachments([])

      if (selectedReturnId) {
        await fetchReturnDetails(selectedReturnId)
      }

      // alert(`Successfully ${uploadedDocuments.length > 0 ? "uploaded documents and " : ""}added comment!`)
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

  // Calculate stats from API data
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
        return "bg-gradient-to-br from-emerald-300 to-green-400 text-white";
      case "document verified":
        return "bg-gradient-to-br from-amber-300 to-orange-400 text-white";
      case "in preparation":
        return "bg-gradient-to-br from-teal-300 to-emerald-400 text-white";
      case "in review":
        return "bg-gradient-to-br from-violet-300 to-purple-400 text-white";
      case "ready to file":
        return " bg-gradient-to-br from-slate-300 to-gray-400 text-white";
      case "filed return":
        return " bg-gradient-to-br from-green-400 to-green-500 text-white";
      case "pending":
        return " text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }

  }

  // Get unique statuses and types for filter options
  const statusOptions = ["all", ...new Set(returns.map(item => item.status))];
  const typeOptions = ["all", ...new Set(returns.map(item => item.type))];

  // Filter returns based on search term and APPLIED filters
  const filteredReturns = returns.filter((returnItem) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      returnItem.id.toString().toLowerCase().includes(searchTermLower) ||
      returnItem.type?.toLowerCase().includes(searchTermLower) ||
      returnItem.status?.toLowerCase().includes(searchTermLower) ||
      returnItem.name?.toLowerCase().includes(searchTermLower);

    // Use the APPLIED filters (not temporary ones)
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    const matchesType = typeFilter === "all" || returnItem.type === typeFilter;

    // Date filter implementation
    let matchesDate = true;
    if (dateFilter !== "all") {
      const returnDate = new Date(returnItem.createdDate);
      const selected = new Date(dateFilter);

      // Normalize both to local date (ignore time zone shifts)
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
    <div className="flex flex-1 overflow-hidden ">
      <main className="flex-1 p-2 md:p-3 ">
        {selectedReturnId ? (
          // Customer Detail View
          <div className="mx-auto max-w-6xl space-y-2">
            <header className="flex items-center justify-between sticky top-0 bg-white z-20 py-2 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md p-2 hover:bg-gray-100"
                  onClick={() => setSelectedReturnId(null)}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Return Details</h1>
              </div>
            </header>

            {/* {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )} */}

            {isLoadingDetail ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              // ✅ Scroll wrapper
              <section className="space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto pr-1">
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
                    <div
                      key={r.id}
                      className="rounded-md border border-gray-200 bg-white"
                    >
                      <div className="flex items-center justify-between px-4 py-1">
                        <div className="flex items-center gap-2">
                          <div className="text-gray-900">{r.name}</div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-sm text-gray-600">status:</span>
                          <StatusPill status={r.status} />
                        </div>
                      </div>

                      <div>
                        <div className="grid items-start gap-4 p-2 md:grid-cols-4 md:p-2">
                          {/* Return details */}
                          <div className="md:col-span-3 rounded-md border border-gray-200 bg-white">
                            <div className="p-2 md:p-2">
                              <h2 className="text-lg font-semibold text-gray-900">
                                Return details
                              </h2>
                              <p className="text-pretty text-sm leading-3 text-gray-700">
                                {r.details}
                              </p>
                              <div className="grid grid-cols-2 text-sm text-gray-600">
                                <div>
                                  <div className="text-gray-500">Return</div>
                                  <div className="font-medium text-gray-900">
                                    {r.name}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Type</div>
                                  <div className="font-medium text-gray-900">
                                    {r.type}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Last updated</div>
                                  <div className="font-medium text-gray-900">
                                    {formatDate(r.updatedAt)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Status</div>
                                  <StatusPill status={r.status} />
                                </div>
                              </div>
                            </div>

                            {/* Documents */}
                            <div className="border-t border-gray-200 p-2 md:p-2">
                              <div className="text-sm font-medium text-gray-900">
                                Documents ({documents.length})
                              </div>
                              <div className="flex items-stretch gap-2 overflow-x-auto">
                                {documents.map((d) => (
                                  <div
                                    key={d.id}
                                    className="group relative flex h-12 w-20 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
                                    title={d.doc_name}
                                  >
                                    <DocIcon
                                      type={d.doc_type}
                                      className="text-gray-600 h-5 w-5"
                                    />
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
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
                                          alert(
                                            `Viewing ${d.doc_name || "document"}`
                                          )
                                        }}
                                      >
                                        <Eye className="h-3.5 w-3.5 text-gray-700" />
                                      </button>
                                      <button
                                        className="rounded bg-white/90 p-1 hover:bg-white"
                                        aria-label="Download"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          downloadDocument(d)
                                        }}
                                      >
                                        <Download className="h-3.5 w-3.5 text-gray-700" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {documents.length === 0 && (
                                  <div className="text-sm text-gray-500 py-4">
                                    No documents found for this return
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Pricing Information */}
                          <aside className="self-start rounded-md border border-gray-200 bg-white p-3 md:p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Pricing Information
                              </h3>
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Pricing Type
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                                  {r.pricing_type
                                    ? r.pricing_type === "hourly"
                                      ? "Hourly"
                                      : "Lump Sum"
                                    : "Not set"}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Price
                                </label>
                                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                                  {r.price ? `$${r.price}` : "Not set"}
                                </div>
                              </div>
                            </div>
                          </aside>
                          {/* Comments + Timeline */}
                          <div className="md:col-span-4 rounded-md border-gray-200 bg-white p-1 md:p-1">
                            <div className="grid gap-3">
                              {/* Comment box */}
                              <div className="rounded-md border border-gray-200 bg-white p-1 md:p-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Add Comment & Upload Documents
                                  </span>
                                </div>
                                <div className="mb-1">
                                  <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment or attach documents..."
                                    rows={4}
                                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="mt-1 flex items-center justify-between">
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
                                        onClick={() =>
                                          fileInputRef.current?.click()
                                        }
                                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                        disabled={isUploading}
                                      >
                                        <Paperclip className="h-4 w-4" />
                                        Attach Files
                                      </button>
                                      {composerAttachments.map((a) => (
                                        <span
                                          key={a.id}
                                          className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                                        >
                                          <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                          {a.name}
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
                                            <X className="h-3 w-3 text-gray-500" />
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
                                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
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
                              <div className="rounded-md border border-gray-200 bg-white p-1 md:p-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-900">
                                    Documents Timeline
                                  </span>
                                </div>

                                <ol className="relative mt-1 max-h-96 overflow-y-auto">
                                  {timeline.map((t, index) => (
                                    <li key={t.id} className="flex">
                                      <div className="flex flex-col items-center flex-shrink-0 mr-4">
                                        {index !== 0 && (
                                          <div className="w-0.5 h-4 bg-blue-100 mb-1"></div>
                                        )}

                                        <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 z-10"></div>

                                        {index !== timeline.length - 1 && (
                                          <div className="w-0.5 h-4 bg-blue-100 mt-1 flex-grow"></div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="p-3 rounded-md border border-gray-100 bg-gray-50">
                                          <div className="mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-900">
                                                {t.created_by_name} (
                                                {t.createdby_type})
                                              </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {formatDateTime(t.created_at)}
                                            </span>
                                          </div>

                                          {t.comment && (
                                            <p className="text-sm text-gray-700">
                                              {t.comment}
                                            </p>
                                          )}

                                          <div className="mt-2 text-xs text-gray-500">
                                            Return ID: {t.return_id} | Document
                                            IDs: {t.document_ids}
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                  {timeline.length === 0 && (
                                    <li className="text-sm text-gray-500 py-4 text-center">
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
          // Main Returns List View
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-1 overflow-y-auto max-h-[calc(100vh-50px)] p-2"  // ✅ set max height and enable vertical scrolling
          >

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 ">
              {/* Initial Request Card - lightest green */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "initial request" ? "all" : "initial request")
                }
                className="transition-shadow h-[142px] 
    bg-gradient-to-br from-emerald-300 to-green-400 text-white text-white relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 rounded-tl-[50px] flex flex-col pt-4 pl-4 text-start rounded-sm"
              >
                {statusFilter === "initial request" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-emerald-300 to-green-400 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2 w-full">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-green-400">
                    <div className="p-2 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">Initial Request</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.initialRequest}</div>
                </div>
              </motion.div>

              {/* Document Verified Card */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "document verified" ? "all" : "document verified")
                }
                className="rounded-sm p-3 shadow-md hover:shadow-lg transition-shadow 
      bg-gradient-to-br from-amber-300 to-orange-300 text-white relative cursor-pointer"
              >
                {statusFilter === "document verified" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-amber-300 to-orange-300 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-orange-400">
                    <div className="p-2 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center">
                      <FileCheck2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">Document Verified</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.documentVerified}</div>
                </div>
              </motion.div>

              {/* In Preparation Card */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "in preparation" ? "all" : "in preparation")
                }
                className="rounded-sm p-3 shadow-md hover:shadow-lg transition-shadow 
     bg-gradient-to-br from-teal-300 to-emerald-400 text-white relative cursor-pointer"
              >
                {statusFilter === "in preparation" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-emerald-600">
                    <div className="p-2 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                      <FilePenLine className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">In Preparation</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.inPreparation}</div>
                </div>
              </motion.div>

              {/* In Review Card */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => setStatusFilter(statusFilter === "in review" ? "all" : "in review")}
                className=" rounded-sm p-3 shadow-md hover:shadow-lg transition-shadow 
     bg-gradient-to-br from-violet-300 to-purple-400 text-white relative cursor-pointer"
              >
                {statusFilter === "in review" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-violet-300 to-purple-400 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2 w-full">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-purple-700">
                    <div className="p-2 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">In Review</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.inReview}</div>
                </div>
              </motion.div>

              {/* Ready to File Card */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "ready to file" ? "all" : "ready to file")
                }
                className="rounded-sm p-3 shadow-md hover:shadow-lg transition-shadow 
      bg-gradient-to-br from-slate-300 to-gray-400 text-white relative cursor-pointer"
              >
                {statusFilter === "ready to file" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-slate-300 to-gray-400 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-slate-600">
                    <div className="p-2 rounded-full bg-gradient-to-br from-slate-300 to-gray-400 flex items-center justify-center">
                      <FileUp className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">Ready to File</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.readyToFile}</div>
                </div>
              </motion.div>

              {/* Filed Return Card - darkest green */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  setStatusFilter(statusFilter === "filed return" ? "all" : "filed return")
                }
                className="rounded-br-[50px] rounded-sm p-3 shadow-md hover:shadow-lg transition-shadow 
     bg-gradient-to-br from-green-400 to-green-500 text-white relative cursor-pointer"
              >
                {statusFilter === "filed return" && (
                  <div className="absolute -top-4 -right-2">
                    <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-full p-1 shadow-lg flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2 gap-2">
                  <div className="flex items-center justify-center w-1/6 border-b-2 pb-2 border-green-900">
                    <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-green-900/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium uppercase  leading-[18px] font-normal font-inter">Filed Return</h3>
                </div>
                <div>
                  <div className="text-[18px] leading-[38px] font-bold font-inter pl-2">{stats.filed}</div>
                </div>
              </motion.div>
            </div>


            {/* Search and Filter Bar */}
            <div className="bg-white  p-1 pl-2">
              <div className="flex items-center justify-center flex-col md:flex-row gap-4">
                <div className="flex flex-col border border-gray-100  p-1 md:flex-row items-center gap-3 w-full">

                  {/* 🔍 Search Section */}
                  <div className="relative flex-1 bg-left-top opacity-100">
                    {/* 👇 Default Large Search Icon (Click to open search bar) */}
                    {!isSearchActive && (
                      <img
                        src="/searchsvg-1.svg"
                        alt="search"
                        onClick={() => setIsSearchActive(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-[42px] h-[42px] cursor-pointer hover:opacity-80 transition"
                      />
                    )}

                    {/* 👇 When active: show search input + small search icon */}
                    {isSearchActive && (
                      <>
                        <img
                          src="/search-icon-2.svg"
                          alt="search-icon"
                          className="w-[17px] h-[17px] absolute left-4 top-3"
                        />
                        <input
                          type="text"
                          placeholder="Search returns by ID, type, status, or name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={handleCloseSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* 🧩 Filter + New Tax Return Buttons (Hidden when search active) */}
                  {!isSearchActive && (
                    <>
                      <button
                        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                        className="flex items-center gap-2 w-[123px] h-[42px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[8px] transition-colors hover:bg-gray-200 relative px-4 py-2"
                      >
                        <img src="/filter-icon.png" alt="filter-icon" className="h-[22px] w-[22px]" />
                        <span className="hidden sm:inline text-left text-[14px] leading-[11px] font-medium text-[#625377]">
                          Filters
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingReturn(null);
                          setShowForm(true);
                          setIsFormModalOpen(true); // ✅ only open form modal
                        }}
                        className="w-[166px] h-[42px] bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] rounded-[10px_10px_10px_0px] opacity-100 flex items-center justify-center text-white gap-2"
                      >
                        <Plus className="w-4 h-4" /> New Tax Return
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Applied Filters */}
              {(statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") &&
                (<div className="mt-1 flex flex-wrap gap-4 items-center">
                  <div className="pr-1 border-r-2 pl-2">
                    <h1 className="w-[80px] h-[15px] text-left text-[12px] leading-[14px] font-medium text-[#9398A5] opacity-100">
                      Applied Filters
                    </h1>
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") &&
                      (<button onClick={clearAllFilters} className="text-left text-[14px] leading-[14px] font-medium text-[#FC6719] opacity-100 hover:opacity-80 transition-opacity" >
                        Clear all
                      </button>)}
                  </div>

                  {statusFilter !== "all" && (<div className="flex gap-4">
                    {/* STATUS Filter */}
                    <div className="relative w-[193px] h-[45px] mt-2">
                      <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2 ">
                        <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase"> STATUS </p>
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium uppercase"> {statusFilter} </p>
                          <button onClick={() => setStatusFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]" >
                            <X className="h-3 w-3 text-[#3B444D]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>)}
                  {/* TYPE Filter */}
                  {typeFilter !== "all" && (<div className="relative w-[193px] h-[45px] mt-2">
                    <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2">
                      <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                        TYPE
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize">
                          {typeFilter || "All Types"}
                        </p>
                        <button onClick={() => setTypeFilter('all')} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]" >
                          <X className="h-3 w-3 text-[#3B444D]" />
                        </button>
                      </div>
                    </div>
                  </div>)}
                  {/* DATE Filter */}
                  {dateFilter !== "all" &&
                    (
                      <div className="relative w-[193px] h-[45px] mt-2">
                        <div className="flex flex-col justify-center bg-[#F5F5FA] border border-[#E4E3F1] rounded-md opacity-100 w-full h-full px-4 py-2">
                          <p className="text-[10px] leading-[14px] tracking-[1.5px] text-[#9398A5] font-medium uppercase">
                            DATE
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] leading-[14px] text-[#3B444D] font-medium capitalize">
                              {new Date(dateFilter).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", })}
                            </p>
                            <button onClick={() => setDateFilter("all")} className="absolute -right-2 top-0 -translate-y-1/2 bg-[#E4E3F1] border border-[#E4E3F1] rounded-full h-5 w-5 flex items-center justify-center opacity-100 hover:bg-[#dcdbe1]" >
                              <X className="h-3 w-3 text-[#3B444D]" />
                            </button>
                          </div>
                        </div>
                      </div>)}
                </div>)}
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
                      <h3 className="text-lg  font-medium text-gray-900">Filters</h3>
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className=" absolute top-4 right-4  flex justify-center items-center  bg-[#F5F5FA] rounded-full w-[30px] h-[30px] hover:text-gray-600 transition-colors"
                      >
                        <img src="/cancel-filter.svg" alt="cancel-img" className="h-[12px] w-[12px]" />
                      </button>
                    </div>

                    <div className="space-y-4 p-6">
                      {/* Status Filter */}
                      <div className="relative">
                        <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={tempStatusFilter}
                          onChange={(e) => setTempStatusFilter(e.target.value)}
                          className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7]"
                        >
                          <option className="text-[#A8ACB7]" value="all">All Statuses</option>
                          {statusOptions.filter((opt) => opt !== "all").map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {/* Custom Arrow */}
                        <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100  clip-path-triangle"></div>
                      </div>

                      {/* Type Filter */}
                      <div className="relative">
                        <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={tempTypeFilter}
                          onChange={(e) => setTempTypeFilter(e.target.value)}
                          className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-white focus:border-white text-[#A8ACB7]"
                        >
                          <option className="text-[#A8ACB7]" value="all">All Types</option>
                          {typeOptions
                            .filter((opt) => opt !== "all")
                            .map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                        </select>

                        {/* Custom Arrow */}
                        <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100  clip-path-triangle"></div>
                      </div>


                      {/* Date Filter */}
                      <div className="relative ">
                        <label className="block text-sm text-[#3B444D] font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => setSelectedDate(date)}
                          dateFormat="dd/MM/yyyy"
                          className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 text-[#A8ACB7] focus:outline-none focus:bg-[#FFE5D8] focus:ring-[#575DD5] appearance-none "
                          placeholderText="Select date"
                        />

                        {/* Custom Arrow (same as in Type dropdown) */}
                        <div className="pointer-events-none absolute left-52 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
                      </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center items-center w-full space-x-3 p-6 pt-0">
                      <button
                        onClick={applyFilters}
                        className="w-[370px] h-[50px] text-white font-medium text-[14px] rounded-[10px] opacity-100 
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

            {/* Returns Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="">
                <div className="min-h-[400px] overflow-y-auto">
                  {filteredReturns.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Returns Found</h3>
                      <p className="text-gray-600">
                        {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "No invoices available."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-200 text-center">
                        <thead className="w-[1318px] h-[50px] bg-[#F6F5FA] rounded-[10px] opacity-100 sticky top-0">
                          <tr>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              SN.NO
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Name
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Documents
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Type
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Status
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Last Updated
                            </th>
                            <th className="text-left text-[12px] leading-[20px] font-medium text-[#3B444D] px-4 py-3">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200 text-center">

                          {currentItems.map((returnItem, index) => (
                            //       <tr
                            //         key={returnItem.id}
                            //         onClick={() => handleRowClick(returnItem.id)}
                            //         className={`transition-all cursor-pointer
                            //   ${selectedRowId === returnItem.id ? "bg-purple-100 shadow-lg" : "hover:shadow-md hover:bg-gray-50"}
                            // `}

                            //       >
                            <tr
                              key={returnItem.id}
                              onClick={() => handleRowClick(returnItem.id)}
                              className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer 
    ${selectedRowId === returnItem.id
                                  ? "bg-purple-100 shadow-lg"
                                  : "hover:shadow-md hover:bg-gray-100"}
  `}
                            >

                              <td className="text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-4 py-3">
                                {index + 1}
                              </td>

                              <td className="px-2 py-3 hidden sm:table-cell text-left text-[14px] leading-[16px] font-bold text-[#191616] opacity-100">
                                {returnItem.name}
                              </td>

                              <td className="px-4 py-3 text-left whitespace-nowrap hidden md:table-cell">
                                <div className="flex justify-start">
                                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">{returnItem.documentCount} files</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-900">{returnItem.type}</td>
                              {/* <td className="px-4 py-3 text-left whitespace-nowrap">
                                <span className={`inline-flex justify-center items-center min-w-[130px] px-4 py-2 text-xs font-medium rounded-lg ${getStatusColor(returnItem.status)}`}>
                                  {returnItem.status}
                                </span>
                              </td> */}
                              <td className="px-4 py-3 text-left whitespace-nowrap">
                                <span
                                  className={`inline-flex justify-center items-center w-[130px] h-[24px] rounded-[6px] ${getStatusColor(returnItem.status)} text-white text-xs  uppercase font-semibold opacity-100`}
                                >
                                  {returnItem.status}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-left whitespace-nowrap text-[12px] leading-[16px] font-normal text-[#191616] opacity-100 hidden lg:table-cell">
                                {formatDate(returnItem.lastUpdated)}
                              </td>


                              <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-500">
                                <div className="flex justify-center items-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-700 transition-colors" title="View Details" onClick={() => setSelectedReturnId(returnItem.id)}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="md:hidden text-gray-600 hover:text-gray-700 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>


                      {/* Pagination Controls */}
                      <div className="h-[55px] w-full bg-[#F5F5FA] rounded-[10px] opacity-100 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sticky bottom-0 z-10 pr-3">

                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                              <span className="font-medium">{Math.min(currentPage * 10, filteredReturns.length)}</span> of{' '}
                              <span className="font-medium">{filteredReturns.length}</span> results
                            </p>
                          </div>
                          <div>
                            <nav
                              className="flex items-center space-x-2 w-[258px] h-[40px] bg-[#FAFAFC] border border-[#EEEFF2] rounded-[6px] opacity-100"
                              aria-label="Pagination"
                            >


                              {/* Previous Button */}
                              <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-3 py-1 text-sm rounded-[4px] transition-colors border-r-4 border-gray-200 pr-2 
      ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                  }`}
                              >
                                <span className={`flex items-center justify-center h-[14px] w-[14px] rounded 
      ${currentPage === 1 ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
                                  <HiArrowLeftCircle className={`h-[10px] w-[10px] text-white ${currentPage === 1 ? "text-gray-500" : "text-white"}`} />
                                </span>
                                <span className={`text-[12px] leading-[16px] font-bold ${currentPage === 1 ? "text-gray-400" : "text-[#3F058F]"} w-[28px] h-[15px] text-center opacity-100`}>
                                  Prev
                                </span>
                              </button>

                              {/* Page Numbers */}
                              {(() => {
                                const totalPages = Math.ceil(filteredReturns.length / 10)
                                const visiblePages = 5
                                let startPage = Math.max(1, currentPage - 2)
                                let endPage = Math.min(totalPages, startPage + visiblePages - 1)

                                if (endPage - startPage < visiblePages - 1) {
                                  startPage = Math.max(1, endPage - visiblePages + 1)
                                }

                                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                                  (page) => (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`w-[32px] h-[33px] text-sm rounded-[4px] opacity-100 flex items-center justify-center 
    ${currentPage === page
                                          ? "bg-[#3F058F] text-white font-semibold"
                                          : "bg-white text-[#191616] hover:bg-gray-100"
                                        }`}
                                    >

                                      {page}
                                    </button>
                                  )
                                )
                              })()}

                              {/* Next Button */}
                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, Math.ceil(filteredReturns.length / 10))
                                  )
                                }
                                disabled={currentPage === Math.ceil(filteredReturns.length / 10)}
                                className={`flex items-center gap-1 px-3 py-1 text-sm rounded-[4px] transition-colors border-l-4 border-gray-200 pl-2
      ${currentPage === Math.ceil(filteredReturns.length / 10)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                  }`}
                              >
                                <span className={`text-[12px] leading-[16px] font-bold w-[28px] h-[15px] text-center 
      ${currentPage === Math.ceil(filteredReturns.length / 10) ? "text-gray-400" : "text-[#3F058F]"} opacity-100`}>
                                  Next
                                </span>

                                <span className={`flex items-center justify-center h-[14px] w-[14px] rounded 
      ${currentPage === Math.ceil(filteredReturns.length / 10) ? "bg-gray-300" : "bg-[#3F058F]"} opacity-100`}>
                                  <HiArrowRightCircle className={`h-[10px] w-[10px] ${currentPage === Math.ceil(filteredReturns.length / 10) ? "text-gray-500" : "text-white"}`} />
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
          </motion.div>
        )}

        {showForm && (
          <ReturnForm
            isOpen={showForm}
            onClose={() => {
              setShowForm(false)
              setEditingReturn(null)
              setIsFormModalOpen(false) // close form modal when closing form
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
    </div >
  )
}

export default Returns