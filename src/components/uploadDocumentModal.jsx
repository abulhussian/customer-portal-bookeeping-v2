"use client";
import { useState, useEffect } from "react";
import { Upload, X, FileText, File, Image, Download } from "lucide-react";
import { toast } from "react-toastify";
import {BASE_URL} from './BaseUrl'
const DocumentUploadModal = ({ isOpen, onClose, onSave, getDocuments }) => {
  const [accounts, setAccounts] = useState([]);
  const { uid, role } = JSON.parse(localStorage.getItem("userProfile"));
  const [newDocument, setNewDocument] = useState({
    document_type: "",
    description: "",
    category: "",
    documents: null,
    fileName: "",
    account_id: accounts,
    uploaded_by_type: role,
    uploaded_by_id: uid,
    customer_id: uid,


  });

  const [dragActive, setDragActive] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewDocument({
        document_type: "",
        description: "",
        category: "",
        documents: null,
        fileName: "",
        account_id: accounts,
        uploaded_by_type: role,
        uploaded_by_id: uid,
        customer_id: uid,
       
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      getAccounts();
    };
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);


  const getAccounts = async () => {
    try {
      const response = await fetch(`http://192.168.1.5:3001/api/book-keeping/get-all-accounts/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log(" get accounts response", response.data);

      const data = await response.json();


      setAccounts(data)
      console.log("accounts", data);
      setAccounts(Array.isArray(data) ? data : []);


    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };
  

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid file type (PDF, Excel, Word, Image, Text)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setNewDocument({
      ...newDocument,
      documents: file,
      fileName: file.name,
      name: file.name.split('.').slice(0, -1).join('.'),
      type: getFileType(file.type)
    });
  };

  const getFileType = (mimeType) => {
    const typeMap = {
      'application/pdf': 'PDF Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'image/jpeg': 'Image',
      'image/png': 'Image',
      'image/gif': 'Image',
      'text/plain': 'Text Document'
    };
    return typeMap[mimeType] || 'Document';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="w-5 h-5 text-red-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileText className="w-5 h-5 text-green-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileText className="w-5 h-5 text-blue-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Image className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };


  console.log("newDocument", newDocument.account_id);
  const uploadFile = async () => {
      try {
        const formData = new FormData();
        formData.append('documents', newDocument.documents);
        formData.append('fileName', newDocument.fileName);
        formData.append('document_type', newDocument.document_type);
        formData.append('account_id', newDocument.account_id);
        formData.append('description', newDocument.description);
        formData.append('category', newDocument.category);
        formData.append('uploaded_by_type', newDocument.uploaded_by_type);
        formData.append('uploaded_by_id', newDocument.uploaded_by_id);
        formData.append('customer_id', newDocument.customer_id);

        const response = await fetch(`${BASE_URL}/api/book-keeping/upload-documents`, {
          method: 'POST',
          body: formData
        });

      getDocuments();

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        console.log('File uploaded successfully:', result);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
  const handleSubmit = () => {
    if (!newDocument.documents) {
      toast.error('Please select a file to upload');
      return;
    }

    uploadFile();
    


    const documentData = {
      id: Date.now(), // Generate unique ID
      name: newDocument.name || newDocument.fileName,
      document_type: newDocument.document_type,
      size: `${(newDocument.documents.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      category: newDocument.category || "Uncategorized",
      documentCount: 1,
      file: newDocument.documents
    };

    // onSave(documentData);
    onClose();
  };

  const isFormValid = newDocument.documents && newDocument.fileName;

  if (!isOpen) return null;

  console.log("accounts in modal", accounts);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload New Document</h2>
              <p className="text-gray-600 text-sm mt-1">
                Upload and organize your documents
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select account
              </label>
              <select
                value={newDocument.account_id || ""}
                onChange={(e) => setNewDocument({ ...newDocument, account_id: parseInt(e.target.value),
})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  console.log("account in select", account),
                  <option key={account.account_id} value={account.id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File <span className="text-red-500">*</span>
              </label>

              {!newDocument.file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PDF, Excel, Word, Images, and Text files (Max 10MB)
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(newDocument.fileName)}
                      <div>
                        <p className="font-medium text-gray-900">{newDocument.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {(newDocument.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNewDocument({ ...newDocument, file: null, fileName: '' })}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                placeholder="Enter document name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Document Type and Category in one line */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={newDocument.document_type}
                  onChange={(e) => setNewDocument({ ...newDocument, document_type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Type</option>
                  <option value="Bank Statement">Bank Statement</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Payment Receipt">Payment Receipt</option>
                  <option value="Credit Card Statement">Credit Card Statement</option>
                  <option value="Expense Report">Expense Report</option>
                  <option value="Contract">Contract</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newDocument.category}
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="Statements">Statements</option>
                  <option value="Invoices">Invoices</option>
                  <option value="Receipts">Receipts</option>
                  <option value="Reports">Reports</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Tax Documents">Tax Documents</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                placeholder="Enter document description or notes..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="px-6 py-2.5 bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;