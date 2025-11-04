import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {BASE_URL} from './BaseUrl'
export default function DocumentPreviewModal({ isOpen, onClose, docId, fileName = "" }) {
  const [docUrl, setDocUrl] = useState(null);
  const [contentType, setContentType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !docId) return;
    fetchDocumentBlob(docId);
  }, [isOpen, docId]);

  const fetchDocumentBlob = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/download-doc/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      // Get the blob first
      const blob = await response.blob();

      // Detect the actual file type from the blob content
      const detectedType = await detectMimeType(blob);
      console.log("Detected MIME type:", detectedType);
      
      // Create a new blob with the correct MIME type
      const correctBlob = new Blob([blob], { type: detectedType });
      
      // Create object URL
      const url = URL.createObjectURL(correctBlob);
      setDocUrl(url);
      setContentType(detectedType);

    } catch (err) {
      console.error("Document preview error:", err);
      toast.error("Failed to preview document");
    } finally {
      setIsLoading(false);
    }
  };

  // Improved MIME type detection
  const detectMimeType = async (blob) => {
    try {
      const arrayBuffer = await blob.slice(0, 8).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check for PDF - starts with "%PDF"
      if (uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46) {
        return "application/pdf";
      }
      
      // Check for PNG
      if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
        return "image/png";
      }
      
      // Check for JPEG
      if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
        return "image/jpeg";
      }
      
      // Check for GIF
      if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
        return "image/gif";
      }
      
      // Check for WebP
      if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
          uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
        return "image/webp";
      }
      
      // Default to octet-stream if unknown
      return "application/octet-stream";
    } catch (error) {
      console.warn("MIME type detection failed:", error);
      return "application/octet-stream";
    }
  };

  const closeModal = () => {
    if (docUrl) {
      URL.revokeObjectURL(docUrl);
    }
    setDocUrl(null);
    setContentType("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <div className="text-slate-500 text-sm">Loading preview...</div>
        </div>
      );
    }

    if (!docUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-600 text-sm text-center">
            <p>No preview available</p>
          </div>
        </div>
      );
    }

    const isPdf = contentType.includes("pdf");
    const isImage = contentType.startsWith("image/");

    // PDF Preview
    if (isPdf) {
      return (
        <div className="w-full h-full">
          <iframe
            src={docUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
            type="application/pdf"
          />
        </div>
      );
    }

    // Image Preview
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full p-4">
          <img
            src={docUrl}
            alt="Document Preview"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.error("Image failed to load");
              toast.error("Failed to load image");
            }}
          />
        </div>
      );
    }

    // Unsupported type
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-slate-600 text-sm mb-4 text-center">
          <p className="font-medium">Preview not available</p>
          <p className="text-xs text-slate-400 mt-1">
            Only PDF and image files can be previewed
          </p>
        </div>
        <a
          href={docUrl}
          download={fileName || "document"}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-slate-800">
              Document Preview
            </div>
            {contentType && (
              <div className="text-xs text-slate-500">
                Type: {contentType}
              </div>
            )}
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}