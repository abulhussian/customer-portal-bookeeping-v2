"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Receipt,
  Download,
  Eye,
  Edit,
  X,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
} from "lucide-react";

import { BASE_URL } from "@/src/components/BaseUrl"
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as numberToWords from 'number-to-words';
import { useFilterModal } from "@/src/components/DashboardLayout"
import React from "react";
import { toast } from "react-toastify"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiArrowLeftCircle, HiArrowRightCircle, HiMiniArrowLeftCircle, HiMiniArrowRightCircle } from "react-icons/hi2";

// Register fonts if needed (optional)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Format date function - moved outside main component
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottom: '2 solid #e5e7eb',
    paddingBottom: 8
  },
  companyInfo: {
    flex: 1
  },
  invoiceInfo: {
    textAlign: 'right'
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5
  },
  text: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3
  },
  bold: {
    fontWeight: 400
  },
  section: {
    marginBottom: 8
  },
  table: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 350
  },
  tableCell: {
    padding: 8,
    flex: 1,
    fontSize: 9 // Reduced from 10
  },
  tableCellRight: {
    padding: 8,
    flex: 1,
    textAlign: 'right',
    fontSize: 9 // Reduced from 10
  },
  totalRow: {
    backgroundColor: '#e3f2fd',
    fontWeight: 200
  },
  bankDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 8
  },
  notes: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderLeft: '4 solid #3b82f6'
  },
  circleContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  redText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold'
  },
  greyText: {
    color: 'grey',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

// Create Invoice Document component
const InvoiceDocument = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Image
            src="/invertio-logo-full.jpg"
            style={{ width: 80, height: 80, marginBottom: 10 }}
          />
          <Text style={styles.title}>Invertio Solutions</Text>
          <Text style={styles.text}>5 Penn Plaza, 14th Floor, New York, NY 10001, US</Text>
          <Text style={styles.text}>GSTIN: 36AAHCJ2304M1ZK</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={styles.text}><Text style={styles.bold}>Invoice #:</Text> {invoice.id}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Invoice Date:</Text> {formatDate(invoice.createdAt)}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Due Date:</Text> {formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Bill to:</Text>
        <Text style={[styles.text, styles.bold]}>{invoice.customerName}</Text>
        <Text style={styles.text}>Customer ID: {invoice.customerId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Service Details:</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Return Type</Text>
            <Text style={styles.tableCellRight}>Amount (USD)</Text>
          </View>

          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
            <Text style={styles.tableCellRight}>${invoice.invoiceAmount.toFixed(2)}</Text>
          </View>
          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{invoice.returnName}</Text>
            <Text style={styles.tableCell}>{invoice.returnType}</Text>
            <Text style={styles.tableCellRight}>${invoice.invoiceAmount.toFixed(2)}</Text>
          </View>

          {/* Subtotal Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, { textAlign: 'right', fontSize: 9 }]}>Subtotal</Text>
            <Text style={[styles.tableCellRight, { fontSize: 9 }]}>${invoice.invoiceAmount.toFixed(2)}</Text>
          </View>

          {/* Payment Platform Fee Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell]}></Text>
            <Text style={[styles.tableCell, { textAlign: 'right', fontSize: 9 }]}>Payment Platform Fee</Text>
            <Text style={[styles.tableCellRight, { fontSize: 9 }]}>$19.00</Text>
          </View>

          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.bold]}></Text>
            <Text style={[styles.tableCell, styles.bold, { textAlign: 'right', fontSize: 9 }]}>Total</Text>
            <Text style={[styles.tableCellRight, styles.bold, { fontSize: 9 }]}>${(invoice.invoiceAmount + 19).toFixed(2)}</Text>
          </View>

          {/* Total in Words Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.bold, { textAlign: 'center', fontSize: 9 }]} colSpan={3}>
              Total in words: {numberToWords.toWords(invoice.invoiceAmount + 19).replace(/\b\w/g, l => l.toUpperCase())} Dollars Only
            </Text>
          </View>
        </View>


      </View>

      <View style={styles.bankDetails}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
          <View style={styles.circleContainer}>
            <Text>
              <Text style={styles.redText}>CF</Text>
              <Text style={styles.greyText}>SB</Text>
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.subtitle, styles.bold]}>Bank Details:</Text>
            <Text style={styles.text}><Text style={styles.bold}>Bank Name:</Text> Community Federal Savings Bank</Text>
            <Text style={styles.text}><Text style={styles.bold}>Account Holder:</Text> INVERTIO SOLUTIONS PRIVATE LIMITED</Text>
            <Text style={styles.text}><Text style={styles.bold}>Account Number:</Text> 8331054346</Text>
            <Text style={styles.text}><Text style={styles.bold}>ACH Routing Number:</Text> 026073150</Text>
            <Text style={styles.text}><Text style={styles.bold}>Fedwire Routing Number:</Text> 026073008</Text>
            <Text style={styles.text}><Text style={styles.bold}>Address:</Text> 5 Penn Plaza, 14th Floor, New York, NY 10001, US</Text>
          </View>
        </View>
      </View>

      <View style={styles.notes}>
        <Text style={[styles.text, styles.bold]}>Notes:</Text>
        <Text style={styles.text}>Thank you for your continued trust in our services.</Text>
      </View>
    </Page>
  </Document>
);

export default function Invoices() {
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();

  const [invoices, setInvoices] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isPaying, setIsPaying] = useState(false)
  const [payingInvoiceId, setPayingInvoiceId] = useState(null)
  const [viewInvoice, setViewInvoice] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  // const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // ✅ default 10 rows
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [dateFilter, setDateFilter] = useState(null);
  // At the top of your component, ensure:

  const [isSearchActive, setIsSearchActive] = useState(false)

  // NEW: State for temporary filter values in modal
  const [tempFilterStatus, setTempFilterStatus] = useState("all");
  const [tempDateFilter, setTempDateFilter] = useState(null);

  // Calculate pagination values
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredInvoices.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);

  const userToken = localStorage.getItem('token')

  // Add this helper function near your other functions
  // Add this helper function near your other functions
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
  useEffect(() => {
    try {
      const userString = localStorage.getItem('userProfile')

      const user = userString ? JSON.parse(userString) : null
      if (user) {
        const loggedInUser = {
          id: user?.uid,
          name: user?.displayName,
          email: user?.email,
          role: user?.role
        }
        console.log(loggedInUser)
        setCurrentUser(loggedInUser)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      toast.error('Error parsing user data')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      loadInvoices()
    }
  }, [currentUser])

  useEffect(() => {
    filterInvoices()
    setCurrentPage(1); // Reset to first page when filters change
  }, [invoices, filterStatus, searchTerm, dateFilter])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/api/getInvoices/${currentUser?.id}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      })

      if (!response.ok && response.status !== 401) {
        toast.error('Something error occured, try again later.')
      }
      const apiInvoices = await response?.json()

      const transformedInvoices = apiInvoices.map(invoice => ({
        id: invoice.id,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        returnName: invoice.tax_name,
        returnType: "Tax Return",
        invoiceAmount: parseFloat(invoice.invoice_amount),
        status: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
        createdAt: invoice.created_at,
        dueDate: invoice.due_date,
        createdByType: invoice.createdby_type
      }))

      setInvoices(transformedInvoices)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices;

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((invoice) =>
        invoice.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Date filter - now using Date object
    if (dateFilter && dateFilter !== "all") {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        // Compare dates (ignoring time)
        return invoiceDate.toDateString() === dateFilter.toDateString();
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.returnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.returnType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id.toString().includes(searchTerm)
      );
    }

    setFilteredInvoices(filtered);
  };

  // NEW: Function to apply filters from modal
  const applyFilters = () => {
    setFilterStatus(tempFilterStatus);
    setDateFilter(tempDateFilter)
    setIsFilterModalOpen(false);
  };

  // NEW: Function to handle opening filter modal
  const handleOpenFilterModal = () => {
    setTempFilterStatus(filterStatus);
    setTempDateFilter(dateFilter);
    setIsFilterModalOpen(true);
  };

  // NEW: Function to clear all filters
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
      case 'paid': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
      case 'pending': return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewInvoice = (invoice) => {
    setViewInvoice(invoice)
  }

  const handleDownloadInvoice = async (invoice) => {
    setIsDownloading(true);

    try {
      // Create PDF blob
      const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob();

      // Download the file
      saveAs(blob, `invoice-${invoice.id}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const payNow = async (invoice) => {
    setIsPaying(true);
    setPayingInvoiceId(invoice.id);

    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Payment gateway configuration error.');
      }

      const totalAmount = invoice.invoiceAmount;

      const requestBody = {
        amount: totalAmount,
        currency: 'USD',
        receipt: `rcpt_${invoice.id}_${Date.now()}`,
        notes: {
          invoice_id: invoice.id,
          customer_name: invoice.customerName,
          customer_id: invoice.customerId
        },
        invoice_id: invoice.id,
        createdby_type: currentUser.role,
        createdby_id: currentUser.id
      };

      console.log('Creating order for amount:', totalAmount);

      const response = await fetch(`${BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      console.log('Order created successfully:', order.id);

      // Initialize Razorpay checkout
      await initializeRazorpayCheckout(order, invoice, razorpayKey);

    } catch (error) {
      toast.error('Error initiating payment. Please try again.');
      setIsPaying(false);
      setPayingInvoiceId(null);
    }
  };

  const initializeRazorpayCheckout = (order, invoice, razorpayKey) => {
    return new Promise((resolve, reject) => {
      const loadRazorpay = () => {
        if (window.Razorpay) {
          createCheckoutInstance(order, invoice, razorpayKey, resolve, reject);
        } else {
          // Load Razorpay script
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => createCheckoutInstance(order, invoice, razorpayKey, resolve, reject);
          script.onerror = () => {
            reject(new Error('Failed to load Razorpay SDK'));
            setIsPaying(false);
            setPayingInvoiceId(null);
          };
          document.body.appendChild(script);
        }
      };

      loadRazorpay();
    });
  };

  const createCheckoutInstance = (order, invoice, razorpayKey, resolve, reject) => {
    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Invertio Solutions',
      description: `Payment for Invoice #${invoice.id}`,
      order_id: order.id,
      prefill: {
        name: currentUser.name?.trim() || 'Customer',
        email: currentUser.email?.trim() || '',
        contact: '' // Add if you have contact info
      },
      theme: {
        color: '#3F058F'
      },
      handler: async function (response) {
        try {
          console.log('Payment successful, verifying...', response);

          const verifyResponse = await fetch(`${BASE_URL}/api/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verificationData = await verifyResponse.json();
          console.log('Verification result:', verificationData);

          if (verificationData.status === 'ok') {
            await loadInvoices();
            alert('Payment successful! Invoice status updated.');
            resolve();
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          toast.error('Payment completed but verification failed. Please contact support.');
          reject(error);
        } finally {
          setIsPaying(false);
          setPayingInvoiceId(null);
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed by user');
          setIsPaying(false);
          setPayingInvoiceId(null);
          reject(new Error('Payment cancelled'));
        }
      },
      // Additional options to prevent standard_checkout
      method: {
        netbanking: false,
        card: true,
        wallet: false,
        upi: false,
      },
      retry: {
        enabled: false,
      },
      timeout: 900, // 15 minutes
      remember_customer: false
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      reject(error);
      setIsPaying(false);
      setPayingInvoiceId(null);
    }
  };

  // Separate function for Razorpay checkout
  const openRazorpayCheckout = (order, invoice, razorpayKey, resolve, reject) => {
    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'TaxPortal',
      description: `Payment for Invoice ${invoice.id}`,
      order_id: order.id,
      prefill: {
        name: currentUser.name || '',
        email: currentUser.email || '',
      },
      theme: {
        color: '#2563EB'
      },
      handler: async function (response) {
        try {
          // console.log('Payment response:', response);

          const verifyResponse = await fetch(`${BASE_URL}/api/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const data = await verifyResponse.json();
          console.log('Verification response:', data);

          if (data.status === 'ok') {
            await loadInvoices(); // Refresh the invoices list
            alert('Payment successful! Invoice status updated to Paid.');
            resolve();
          } else {
            alert('Payment verification failed. Please contact support.');
            reject(new Error('Verification failed'));
          }
        } catch (error) {
          toast.error('Error verifying payment. Please contact support.');
          reject(error);
        }
      },
      modal: {
        ondismiss: function () {
          toast.error('Payment modal dismissed');
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div className=" flex flex-col min-h-screen ">
<div className="max-h-[calc(100vh)] overflow-y-auto pb-24 sm:pb-8">
        {/* View Invoice Modal */}
        {viewInvoice && (
          <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto relative">
              <button
                onClick={() => setViewInvoice(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <img src="/invertio-logo-full.jpg" alt="full-logo" className="w-20 h-20" />
                  <h3 className="font-bold text-gray-900 mb-2">Invertio Solutions</h3>
                  <p className="text-sm text-gray-700">5 Penn Plaza, 14th Floor, New York, NY 10001, US</p>
                  <p className="text-sm text-gray-700 mt-1">GSTIN: 36AAHCJ2304M1ZK</p>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">TAX INVOICE</h1>
                  <div className="mt-2 text-sm text-black">
                    <p><span className="font-medium">Invoice #:</span> {viewInvoice.id}</p>
                    <p><span className="font-medium">Invoice Date:</span> {formatDate(viewInvoice.createdAt)}</p>
                    <p><span className="font-medium">Due Date:</span> {formatDate(viewInvoice.dueDate)}</p>
                    <p><span className="font-medium">Payment terms:</span> Immediate</p>
                    <p><span className="font-medium">Accepted Methods:</span> ACH & Fedwire</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Company and Bill To Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-bold text-gray-400 mb-2">Bill to:</h3>
                    <p className="text-sm text-black font-bold">{viewInvoice.customerName}</p>
                    <p className="text-sm text-gray-700">Customer ID: {viewInvoice.customerId}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-white  rounded-lg overflow-hidden mb-6 shadow-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-bold text-black border-b border-gray-200">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-bold text-black border-b border-gray-200">Return Type</th>
                        <th className="py-3 px-4 text-right text-sm font-bold text-black border-b border-gray-200">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b border-gray-200">{viewInvoice.returnName}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b border-gray-200">{viewInvoice.returnType}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 text-right border-b border-gray-200">${viewInvoice.invoiceAmount.toFixed(2)}</td>
                      </tr>

                      {/* Total row */}
                      <tr className="bg-blue-100">
                        <td className="py-4 px-4 text-lg font-bold text-gray-900" colSpan={2}>Total (USD)</td>
                        <td className="py-4 px-4 text-lg font-bold text-gray-900 text-right">${viewInvoice.invoiceAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bank Details */}
                <h3 className="font-bold text-gray-400 mb-3">Bank details:</h3>

                <div className="bg-gray-100 border border-gray-200 text-black rounded-lg p-4 mb-6 flex gap-3">
                  <div className="rounded-full w-20 h-16 flex justify-center items-center border border-gray-200 bg-white">
                    <p className="text-gray-700 font-bold"> <span className="text-red-700 font-bold">CF</span>SB</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p><span className="font-medium text-black">Payment method:</span> ACH or Fedwire</p>
                      <p><span className="font-medium text-black">Account number:</span> 8331054346</p>
                      <p><span className="font-medium text-black">ACH routing number:</span> 026073150</p>
                      <p><span className="font-medium text-black">Fedwire routing number:</span> 026073008</p>
                      <p><span className="font-medium text-black">Account type:</span> Business checking account</p>
                      <p><span className="font-medium text-black">Bank name:</span> Community Federal Savings Bank</p>
                      <p><span className="font-medium text-black">Beneficiary address:</span> 5 Penn Plaza, 14th Floor, New York, NY 10001, US</p>
                      <p><span className="font-medium text-black">Account holder name:</span> INVERTIO SOLUTIONS PRIVATE LIMITED</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Notes</p>
                  <p>Thank you for your continued trust in our services.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">

                  <button
                    onClick={() => setViewInvoice(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="mt-4"
>
  <div className="grid grid-cols-2 sm:grid-cols-4 xs:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {statusOptions.map((status) => {
      const normalizedValue = status.value.toLowerCase();

      const count =
        normalizedValue === "all"
          ? invoices.length
          : invoices.filter(
              (invoice) =>
                invoice.status.toLowerCase() === normalizedValue
            ).length;

      const statusIcons = {
        all: <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
        paid: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
        pending: <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />,
      };

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

      const config = statusConfig[normalizedValue] || {
        borderColor: "border-gray-400",
        iconBg: "bg-gray-600 bg-opacity-80",
        checkmarkBg: "bg-gray-600",
        image: "/Rectangle145138.svg",
        label: status.label,
      };

      const IconComponent =
        statusIcons[normalizedValue] ||
        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />;

      return (
        <motion.div
          key={status.value}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() =>
            setFilterStatus(
              status.value === filterStatus ? "all" : status.value
            )
          }
          className={`relative w-full h-[142px] bg-no-repeat bg-cover shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col pt-4 pl-4 text-start rounded-[6px] first:rounded-tl-[30px] sm:first:rounded-tl-[50px] last:rounded-br-[30px] sm:last:rounded-br-[50px]`}
          style={{ backgroundImage: `url(${config.image})` }}
        >
          {filterStatus === status.value && (
            <div className="absolute -top-2 -right-2 z-20">
              <div
                className={`flex items-center justify-center rounded-full p-[6px] ${config.checkmarkBg}`}
              >
                <Check className="h-[18px] w-[18px] text-white" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-white w-full">
            <div
              className={`w-1/6 min-w-[40px] border-b-2 pb-2 ${config.borderColor}`}
            >
              <div
                className={`p-1 flex justify-center items-center rounded-full ${config.iconBg}`}
              >
                {IconComponent}
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-bold pb-2">
              {config.label}
            </h3>
          </div>

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
                placeholder="Search returns by ID, type, status, or name..."
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
      {!isSearchActive && (filterStatus !== "all" || dateFilter !== "all") && (
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
          {dateFilter && dateFilter !== "all" && (
            <div className="mt-2 w-[172px] h-[46px] bg-[#F5F5FA] border border-[#E4E3F1] rounded-[6px] px-3 py-1 flex items-center justify-between relative">
              <div className="flex flex-col justify-center">
                <span className="text-[#9398A5] font-medium text-[10px] uppercase font-inter">
                  Date:
                </span>
                <span className="text-[#3B444D] font-medium text-[12px] capitalize font-inter">
                  {dateOptions.find(opt => opt.value === dateFilter)?.label}
                </span>
              </div>
              <button
                onClick={() => setDateFilter("all")}
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
            <select
              value={tempDateFilter}
              onChange={(e) => setTempDateFilter(e.target.value)}
              className="w-full bg-[#F7F8FC] border border-[#F2F2FA] rounded-md px-3 py-2 pr-8 appearance-none focus:white focus:ring-blue-500 focus:border-blue-500 text-[#A8ACB7]"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 translate-y-1/2 w-[14px] h-[8px] bg-[#A7ACB7] opacity-100 clip-path-triangle"></div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setTempFilterStatus("all");
              setTempDateFilter("all");
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



        {/* Invoices Table */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-white rounded-lg shadow-sm border overflow-hidden my-6"
>
  {/* Scrollable Table */}
  <div
    className="overflow-x-auto"
    style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
  >
    {filteredInvoices.length === 0 ? (
      <div className="p-8 sm:p-12 text-center">
        <div className="text-4xl sm:text-6xl mb-4">📝</div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
          No Invoices Found
        </h3>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
          {searchTerm
            ? "Try adjusting your search criteria."
            : filterStatus !== "all" && dateFilter
            ? `No ${filterStatus.toLowerCase()} invoices found for the selected date.`
            : filterStatus !== "all"
            ? `No ${filterStatus.toLowerCase()} invoices found.`
            : dateFilter
            ? "No invoices found for the selected date."
            : "No invoices available."}
        </p>
      </div>
    ) : (
      <div className="min-w-[800px]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-[#F6F5FA] rounded-[10px] opacity-100 h-[50px] sticky top-0 z-10">
            <tr>
              {[
                "SN.NO",
                "Customer",
                "Return",
                "Amount",
                "Status",
                "Created",
                "Due Date",
                "Actions",
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
            {currentRows.map((invoice, index) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRowId(invoice.id)}
                className={`h-[61px] bg-white rounded-[8px] opacity-100 transition-all cursor-pointer ${
                  selectedRowId === invoice.id
                    ? "bg-indigo-50 shadow-lg"
                    : "hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                {/* SN.NO */}
                <td className="text-[12px] text-left leading-[12px] font-bold text-[#3F058F] px-4 py-3 whitespace-nowrap">
                  {indexOfFirstRow + index + 1}
                </td>

                {/* Customer */}
                <td className="px-2 py-3 text-left whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.customerName}</div>
                  <div className="text-xs text-gray-500">ID: {invoice.customerId}</div>
                </td>

                {/* Return */}
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.returnName}</div>
                  <div className="text-xs text-gray-500">{invoice.returnType}</div>
                </td>

                {/* Amount */}
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="w-auto font-inter font-bold text-[14px] leading-[16px] text-[#191616] opacity-100">
                    ${invoice.invoiceAmount.toFixed(2)} USD
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  <span
                    className={`inline-flex justify-center items-center w-[84px] h-[24px] rounded-[6px] text-white text-xs uppercase font-semibold opacity-100 ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>

                {/* Created */}
                <td className="px-4 py-3 text-left whitespace-nowrap text-[12px] leading-[16px] text-[#191616] font-inter">
                  {formatDate(invoice.createdAt)}
                </td>

                {/* Due Date */}
                <td className="px-4 py-3 text-left whitespace-nowrap text-[12px] leading-[16px] text-[#191616] font-inter">
                  {formatDate(invoice.dueDate)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-left whitespace-nowrap">
                  <div className="flex items-center justify-start space-x-2">
                    {/* View */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInvoice(invoice);
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="View Invoice"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Download */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadInvoice(invoice);
                      }}
                      disabled={isDownloading}
                      className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                      title="Download Invoice"
                    >
                      {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    {/* Pay / Completed */}
                    {invoice.status.toLowerCase() === "pending" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          payNow(invoice);
                        }}
                        disabled={isPaying && payingInvoiceId === invoice.id}
                        className="text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                        title="Pay Invoice"
                      >
                        {isPaying && payingInvoiceId === invoice.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <div className="text-green-600" title="Payment Completed">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {/* ✅ Pagination Moved Below */}
  {filteredInvoices.length > 0 && (
    <div className="w-full bg-[#F5F5FA] rounded-[10px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 mt-4">
      <p className="text-sm text-gray-700 text-center sm:text-left mb-2 sm:mb-0">
        Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{" "}
        <span className="font-medium">{Math.min(indexOfLastRow, filteredInvoices.length)}</span> of{" "}
        <span className="font-medium">{filteredInvoices.length}</span> results
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
          const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
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
            setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredInvoices.length / rowsPerPage)))
          }
          disabled={currentPage === Math.ceil(filteredInvoices.length / rowsPerPage)}
          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-[4px] border transition-colors
            ${currentPage === Math.ceil(filteredInvoices.length / rowsPerPage)
              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          <span className="font-bold text-[#3F058F] text-xs sm:text-sm">Next</span>
          <HiArrowRightCircle
            className={`h-[14px] w-[14px] ${currentPage === Math.ceil(filteredInvoices.length / rowsPerPage)
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
  )
}