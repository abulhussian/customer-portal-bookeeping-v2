
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import FileUpload from "./FileUpload"
import { X, FileText, Loader2, Trash2 } from "lucide-react"
import { validateFileSize } from "../utils/validators"
import { BASE_URL } from "@/src/components/BaseUrl"
import { Input } from "@/components/ui/input"
import { useFilterModal } from "./DashboardLayout"
import { toast } from "react-toastify"

const ReturnForm = ({ isOpen, onClose, onSubmit, editingReturn, customer, error }) => {
  const { setIsFormModalOpen } = useFilterModal()
  const [formData, setFormData] = useState({
    type: "1040",
    documents: [],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const token = customer?.token
  const customerName = customer?.name

  const {uid , role} = JSON.parse(localStorage.getItem("userProfile"));
  console.log("userData in return form", uid , role)
  // ---- EDITING PRE-FILL ----------------------------------------------------
  useEffect(() => {
    if (editingReturn) {
      setFormData({
        type: editingReturn.type || "1040",
        documents: editingReturn.documents || [],
        notes: editingReturn.notes || "",
      })
    } else {
      setFormData({ type: "1040", documents: [], notes: "" })
    }
  }, [editingReturn])

  // ---- FILE UPLOAD ---------------------------------------------------------
  const handleFileUpload = (files) => {
    const validFiles = []

    Array.from(files).forEach((file) => {
      if (!validateFileSize(file, 50)) {
        toast.error(`${file.name}: File too large (max 50MB)`)
        return
      }

      const getFileType = (fileName, fileType) => {
        if (fileType.includes("pdf")) return "pdf"
        if (fileType.includes("word") || fileType.includes("document") || fileName.endsWith(".docx")) return "doc"
        if (fileType.includes("sheet") || fileName.endsWith(".xlsx")) return "spreadsheet"
        if (fileType.includes("image") || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) return "image"
        if (fileName.endsWith(".zip") || fileName.endsWith(".rar")) return "archive"
        return "document"
      }

      validFiles.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        name: file.name,
        type: getFileType(file.name, file.type),
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        comments: "",
        file,
      })
    })

    if (validFiles.length > 0) {
      setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...validFiles] }))
      toast.success(`${validFiles.length} file(s) uploaded successfully!`)
    }
  }

  const handleRemoveDocument = (documentId) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== documentId),
    }))
    toast.info("Document removed.")
  }

  // ---- DRAG & DROP HANDLERS ------------------------------------------------
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add("border-blue-500")
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("border-blue-500")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("border-blue-500")
    handleFileUpload(Array.from(e.dataTransfer.files))
  }

  // ---- FORM SUBMIT ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.documents.length === 0) {
        toast.error("Please upload at least one document")
        setLoading(false)
        return
      }

      if (!token) {
        toast.error("User not authenticated. Please log in again.")
        setLoading(false)
        return
      }

      if (!customer?.id) {
        toast.error("Missing customer information.")
        setLoading(false)
        return
      }

      const submitData = new FormData()
      submitData.append("customerId", customer.id)
      submitData.append("customerName", customerName ?? "")
      submitData.append("category", formData.type)
      submitData.append("createdby_type", "individual")
      submitData.append("createdby_id", String(customer.id))
      submitData.append("notes", formData.notes)
      submitData.append("companyname", formData.companyname || "")
      submitData.append("phone", formData.phone || "")
      formData.documents.forEach((doc) => {
        submitData.append("documents", doc.file)
      })

      const response = await fetch(`${BASE_URL}/api/tax-return`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("🔒 Authentication failed. Please log in again.")
          return
        }

        let message = "❌ Failed to save tax return."
        try {
          const errorData = await response.json()
          message = errorData?.message || errorData?.error || message
        } catch {
          message = response.statusText || message
        }
        toast.error(message)
        throw new Error(message)
      }

      const result = await response.json()
      toast.success(" Tax return submitted successfully!")
      setIsFormModalOpen(false)
      onSubmit?.(result)
      customer.onReturnAdded?.()
    } catch (err) {
      toast.error(err?.message || "❌ Failed to save tax return. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    setShowInput(true)
    if (formData.type === "other") setFormData({ ...formData, type: "" })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal - Responsive width and height */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <Card className="shadow-xl">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl truncate">
                    {editingReturn ? "Edit Tax Return" : "New Tax Return"}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {editingReturn ? "Update your tax return information" : "Create a new tax return filing"}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
              {error && toast.error(error)}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                {/* Return Type Selection - Responsive Grid */}
                <div>
                  <Label className="text-sm sm:text-base font-medium">Return Type</Label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {/* 1040 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1040" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "1040" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 1040</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Individual Income Tax Return</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* 1065 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1065" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "1065" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 1065</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Partnership Income Tax Return</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Form 1120 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1120" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "1120" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 1120</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">C-Corporations</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Form 1120S */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1120S" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "1120S" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 1120-S</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">S-Corporations</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Form 940 */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "940" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "940" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 940</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Employer's Annual Federal Unemployment (FUTA) Tax Return</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Form 1041*/}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "1041" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "1041" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 1041</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">U.S. Income Tax Return for Estates and Trusts</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Form 990*/}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.type === "990" && !showInput
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(false);
                        setFormData({ ...formData, type: "990" });
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Form 990</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Return of Organization Exempt From Income Tax</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Other Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        showInput || (formData.type && !["1040", "1065", "1120", "1120S", "940", "1041", "990"].includes(formData.type))
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setShowInput(true);
                        if (["1040", "1065", "1120", "1120S", "940", "1041", "990"].includes(formData.type)) {
                          setFormData({ ...formData, type: "" });
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">Other</h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Enter custom document name</p>
                        </div>
                      </div>

                      {showInput && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Enter document name"
                            value={formData.type || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                            className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Company/Person Name and Mobile Number - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="companyname" className="text-xs sm:text-sm font-medium">
                      Company/Person Name
                    </Label>
                    <Input
                      id="companyname"
                      type="text"
                      placeholder="Enter company or person name"
                      value={formData.companyname}
                      onChange={(e) => setFormData({ ...formData, companyname: e.target.value })}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
                      Mobile Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                  <Label className="text-sm sm:text-base font-medium">Documents</Label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Upload any type of supporting documents. Maximum file size: 10MB per file
                  </p>

                  <FileUpload
                    onFileUpload={handleFileUpload}
                    accept="*"
                    multiple
                  />

                  {/* Document List - Responsive */}
                  {formData.documents.length > 0 && (
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        Uploaded Documents ({formData.documents.length})
                      </h4>
                      {formData.documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 sm:p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3">
                            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{doc.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB • Uploaded {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">{doc.type.toUpperCase()}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div>
                  <Label htmlFor="notes" className="text-sm sm:text-base font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or special instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-2 min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                </div>

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="w-full sm:flex-1 bg-transparent text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full sm:flex-1 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                        {editingReturn ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingReturn ? "Update Return" : "Create Return"}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReturnForm