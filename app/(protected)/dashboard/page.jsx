"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { FileText, FolderOpen, CreditCard, TrendingUp, Clock, Plus, ArrowRight, Activity } from "lucide-react"
// import { getStoredData, seedReturns, seedInvoices, seedActivityLogs } from "@/src/data/seed"
import { formatCurrency, formatDate } from "@/src/utils/validators"
import { BASE_URL } from "@/src/components/BaseUrl"
import { toast } from "react-toastify"

const Dashboard = () => {
  const [returns, setReturns] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // Get user data from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem("userProfile") || "{}")
      if (user && user.uid) {
        setUserId(user.uid)
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      // Load returns and invoices from localStorage or seed data
      fetchReturns()
      loadInvoices()

      // Fetch activity logs from API
      fetchActivityLogs()
    }
  }, [userId])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/getInvoices/${userId}`, {

        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) {
        toast.error('Failed to fetch invoices')
      }
      const apiInvoices = await response.json()

      const transformedInvoices = apiInvoices.map(invoice => ({
        id: invoice.id,
        customerId: invoice.customer_id,
        customerName: invoice.customer_name,
        returnName: invoice.tax_name,
        returnType: "Tax Return",
        invoiceAmount: Number(invoice.invoice_amount),
        status: invoice.status,
        createdAt: invoice.created_at,
        dueDate: invoice.due_date,
        createdByType: invoice.createdby_type
      }))


      setInvoices(transformedInvoices)
    } catch (error) {
      toast.error("Error loading invoices. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  const userToken = localStorage.getItem('token')
  const fetchReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/getClientDashboard/${userId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setReturns(data.returns || [])
    } catch (err) {
      toast.error("Failed to fetch returns")
      // Fallback to seed data if API fails
      setReturns(("returns"))
    } finally {
      setLoading(false)
    }
  }



  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/getActivites/${userId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${userToken}`,
        }
      })

      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setActivityLogs(data)
    } catch (err) {
      toast.error("Failed to fetch activity logs")
      setError(err.message)
      // Fallback to seed data if API fails
      setActivityLogs(("activityLogs"))
    } finally {
      setLoading(false)
    }
  }



  const stats = {
    totalReturns: returns.length,
    pendingReturns: returns.filter((r) => r.return_status !== "completed" && r.return_status !== "document verified").length,
    completedReturns: returns.filter((r) => r.return_status === "completed" || r.return_status === "document verified").length,
    totalInvoices: invoices.length,
    unpaidInvoices: invoices.filter((i) => i.status === "pending").length,
    totalAmount: invoices.reduce((sum, invoice) => sum + invoice.invoiceAmount, 0),
    unpaidAmount: invoices.filter((i) => i.status === "pending").reduce((sum, invoice) => sum + invoice.invoiceAmount, 0),
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "document verified":
      case "filed return":
        return "bg-green-100 text-green-800"
      case "in review":
        return "bg-blue-100 text-blue-800"
      case "in preparation":
        return "bg-indigo-100 text-indigo-800"
      case "ready to file":
        return "bg-purple-100 text-purple-800"
      case "initial request":
        return "bg-amber-100 text-amber-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get only the 5 most recent returns, sorted by date (newest first)
  const recentReturns = returns
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  const recentActivity = activityLogs.slice(-4).reverse()

  return (
    loading ? (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
) : (
  <main className="flex flex-col overflow-hidden max-h-[calc(100vh-50px)] overflow-y-auto p-4 lg:pl-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Card 1 - Top Left Rounded */}
        <div className="w-full h-[142px] bg-[url('/Rectangle145138.svg')] bg-no-repeat bg-cover shadow-lg hover:shadow-xl transition-all duration-300 rounded-tl-[30px] sm:rounded-tl-[50px] rounded-tr-[6px] rounded-br-[6px] rounded-bl-[6px] flex flex-col pt-4 pl-4 text-start">
          <div className="flex items-center gap-2 text-white w-full">
            <div className="w-1/6 min-w-[40px] border-b-2 pb-2 border-[#604881]">
              <div className="p-1 flex justify-center items-center rounded-full bg-[#604881]">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-bold pb-2">Total Returns</h3>
          </div>

          <div className="text-xl sm:text-2xl font-bold text-white mt-4 pl-2">
            {stats.totalReturns}
          </div>
        </div>

        {/* Card 2 - Normal */}
        <div className="w-full h-[142px] bg-[url('/Rectangle145211orange.svg')] bg-no-repeat bg-cover shadow-lg hover:shadow-xl transition-all duration-300 rounded-[6px] flex flex-col pt-4 pl-4 text-start">
          <div className="flex items-center gap-2 text-white w-full">
            <div className="w-1/6 min-w-[40px] border-b-2 pb-2 border-[#df530a]">
              <div className="p-1 flex justify-center items-center rounded-full bg-[#df530a]">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-bold pb-2">Pending Returns</h3>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-4 pl-2">{stats.pendingReturns}</div>
        </div>

        {/* Card 3 - Bottom Right Rounded */}
        <div className="w-full h-[142px] bg-[url('/Rectangle145235blue.svg')] bg-no-repeat bg-cover shadow-lg hover:shadow-xl transition-all duration-300 rounded-tr-[6px] rounded-br-[30px] sm:rounded-br-[50px] rounded-tl-[6px] rounded-bl-[6px] flex flex-col pt-4 pl-4 text-start">
          <div className="flex items-center gap-2 text-white">
            <div className="w-1/6 min-w-[40px] border-b-2 pb-2 border-[#1d2587]">
              <div className="p-1 flex justify-center items-center rounded-full bg-[#1d2587]">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-bold pb-2">Outstanding Invoices</h3>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-4 pl-2">{stats.unpaidInvoices}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Returns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Tax Returns</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your 5 most recent tax return filings</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link href="/dashboard/returns">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : returns.length > 0 ? (
                <div className="space-y-3">
                  {recentReturns.map((returnItem) => (
                    <motion.div
                      key={returnItem.return_id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Form {returnItem.return_type}</p>
                          <p className="text-xs text-gray-500 truncate">
                            Created {formatDate(returnItem.created_at)} • {returnItem.tax_name}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(returnItem.return_status) + " text-xs sm:text-sm"}>
                        {returnItem.return_status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No tax returns yet</p>
                  <Button asChild className="mt-2 text-sm">
                    <Link href="/dashboard/returns">Create Your First Return</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-2">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-red-500">Failed to load activities</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchActivityLogs}
                    className="mt-1 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{activity.comment || "Activity update"}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.created_at || activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4">Quick Actions</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-max w-full">
            {/* New Tax Return */}
            <Link
              href="/dashboard/returns"
              className="border rounded-md p-3 flex flex-col items-center gap-2 hover:bg-gray-50 transition min-w-[180px] sm:min-w-[200px]"
            >
              <FileText className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-center">New Tax Return</span>
              <span className="text-xs text-gray-500 text-center">Start a new filing</span>
            </Link>

            {/* View Invoices */}
            <Link
              href="/dashboard/invoices"
              className="border rounded-md p-3 flex flex-col items-center gap-2 hover:bg-gray-50 transition min-w-[180px] sm:min-w-[200px]"
            >
              <Activity className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-center">View Invoices</span>
              <span className="text-xs text-gray-500 text-center">Check invoice status</span>
            </Link>

            {/* Payments */}
            <Link
              href="/dashboard/payments"
              className="border rounded-md p-3 flex flex-col items-center gap-2 hover:bg-gray-50 transition min-w-[180px] sm:min-w-[200px]"
            >
              <CreditCard className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-center">Payments</span>
              <span className="text-xs text-gray-500 text-center">Track all payments</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  </main>

    )
  )
}

export default Dashboard