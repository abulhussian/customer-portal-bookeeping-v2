
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Eye, Trash2, File } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Documents() {
  const documents = [
    { 
      id: 1, 
      name: "Bank Statement - January 2024.pdf", 
      type: "Bank Statement", 
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      status: "Processed"
    },
    { 
      id: 2, 
      name: "Invoice #1234.pdf", 
      type: "Invoice", 
      size: "156 KB",
      uploadDate: "2024-01-14",
      status: "Pending"
    },
    { 
      id: 3, 
      name: "Receipt_Payment_001.jpg", 
      type: "Payment Receipt", 
      size: "1.2 MB",
      uploadDate: "2024-01-13",
      status: "Processed"
    },
    { 
      id: 4, 
      name: "Credit Card Statement.xlsx", 
      type: "Credit Card Statement", 
      size: "890 KB",
      uploadDate: "2024-01-12",
      status: "Processed"
    },
    { 
      id: 5, 
      name: "Expense Report Q4.pdf", 
      type: "Expense Report", 
      size: "3.1 MB",
      uploadDate: "2024-01-10",
      status: "Pending"
    },
  ];

  const handleUpload = () => {
    toast.success("Document upload initiated");
  };

  const getStatusColor = (status) => {
    return status === "Processed" 
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  };

  const handleView = (docId) => {
    toast.info(`Viewing document ${docId}`);
  };

  const handleDownload = (docId) => {
    toast.success(`Downloading document ${docId}`);
  };

  const handleDelete = (docId) => {
    toast.error(`Document ${docId} deleted`);
  };

  return (
    <div className="space-y-6 p-6 max-h-[calc(100vh-50px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Documents</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and manage your financial documents
          </p>
        </div>
        <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <File className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">32</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Statements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">79</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receipts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Documents</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View and manage your uploaded financial documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="text-gray-900 dark:text-white">File Name</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Type</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Size</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Upload Date</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="border-gray-200 dark:border-gray-700">
                    <TableCell className="font-medium text-gray-900 dark:text-white">{doc.name}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{doc.type}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{doc.size}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{doc.uploadDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          onClick={() => handleView(doc.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Upload Documents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
              Drag and drop your files here, or click to browse. Supports PDF, Excel, Word, and image files.
            </p>
            <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700 text-white">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}