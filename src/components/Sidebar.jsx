"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../components/ui/button"
import {
  FileText,
  Activity,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Receipt,
  Book,
  LayoutGrid,
  Building,
  Folder,
  FileSpreadsheet,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import '../../styles/globals.css'

const Sidebar = ({ isOpen, setIsOpen, currentPath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isBookkeepingOpen, setIsBookkeepingOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [setIsOpen])

  // Auto-close bookkeeping submenu when collapsed
  useEffect(() => {
    if (isCollapsed) {
      setIsBookkeepingOpen(false)
    }
  }, [isCollapsed])

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: FileText, description: "Overview" },
    { name: "Returns", href: "/dashboard/returns", icon: Receipt, description: "Manage tax returns" },
    { name: "Invoices", href: "/dashboard/invoices", icon: Activity, description: "View invoice history" },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard, description: "Payments" },
  ]

  const bookkeepingItems = [
    { name: "Company Profile", href: "/dashboard/bookkeeping/companyprofile", icon: Building, description: "Company information" },
    { name: "Chart of Accounts", href: "/dashboard/bookkeeping/chartofaccounts", icon: LayoutGrid, description: "Manage accounts" },
    { name: "Documents", href: "/dashboard/bookkeeping/documents", icon: Folder, description: "Manage documents" },
    { name: "Journal Entries", href: "/dashboard/bookkeeping/journalentries", icon: FileSpreadsheet, description: "Record transactions" },
    { name: "Reports", href: "/dashboard/bookkeeping/reports", icon: BarChart3, description: "View reports" }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logging out...")
      router.push("/login")
    } catch (error) {
      toast.error("Logout error")
    }
  }

  const getUserInitials = () => {
    if (!currentUser) return "U"
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return currentUser.email?.[0]?.toUpperCase() || "U"
  }

  const getUserName = () => {
    if (!currentUser) return "User"
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    return currentUser.email || "User"
  }

  // Check if any bookkeeping sub-item is active
  const isBookkeepingSubItemActive = bookkeepingItems.some(item => currentPath === item.href)
  
  // FIXED: Only show active when actually on a bookkeeping page, not just when dropdown is open
  const isBookkeepingMainActive = currentPath.startsWith('/dashboard/bookkeeping')

  // Handle bookkeeping click for collapsed sidebar
  const handleBookkeepingClick = () => {
    if (isCollapsed) {
      // If sidebar is collapsed, first expand it, then open submenu
      setIsCollapsed(false)
      setTimeout(() => setIsBookkeepingOpen(true), 300) // slight delay for smooth animation
    } else {
      // Toggle submenu normally
      setIsBookkeepingOpen(prev => !prev)
    }
  }

  // Handle navigation click - close sidebar on mobile
  const handleNavigationClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
    setIsBookkeepingOpen(false)
  }

  // Handle sub-item click - close sidebar on mobile
  const handleSubItemClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
    // Don't close the bookkeeping dropdown on desktop
  }

  return (
    <>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-[#541DA0] text-white shadow-lg border border-white/20"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -280) : 0,
          width: isMobile ? 240 : (isCollapsed ? 80 : 240),
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut"
        }}
        className="fixed lg:relative h-full flex flex-col max-h-[calc(100vh)] z-50 shadow-2xl lg:shadow-none"
        style={{ backgroundColor: "#541DA0" }}
      >
        {/* TOP SECTION: Logo */}
        <div
          className="flex items-center justify-center lg:justify-start p-4 cursor-pointer mt-6 flex-shrink-0"
          onClick={() => {
            router.push("/dashboard")
            if (isMobile) setIsOpen(false)
          }}
        >
          <img
            src="/favicon.svg"
            alt="logo"
            className="w-8 h-8"
          />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-xl text-white whitespace-nowrap ml-2"
              >
                Invertio.us
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER SECTION: Navigation with scrollable area */}
        <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
          <nav className="p-2 w-full flex flex-col items-center space-y-2 pb-4">
            {/* Regular navigation items */}
            {navigationItems.map((item, index) => {
              const isActive = currentPath === item.href
              const Icon = item.icon

              return (
                <Link key={item.name} href={item.href} className="w-full">
                  <div
                    onClick={handleNavigationClick}
                    className={`flex items-center gap-3 px-4 ${
                      isCollapsed ? "py-3" : "py-2.5"
                    } rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#FC6719] text-white shadow-md"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ duration: 0.15 }}
                          className="ml-3 flex flex-col min-w-0 flex-1"
                        >
                          <p className="font-semibold text-base whitespace-nowrap">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/80 whitespace-nowrap">
                            {item.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              )
            })}

            {/* Bookkeeping with submenu */}
            <div className="w-full">
              {/* Bookkeeping main item */}
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isBookkeepingMainActive
                    ? "bg-[#FC6719] text-white shadow-md"
                    : "text-white hover:bg-white/10 hover:text-white"
                }`}
                onClick={handleBookkeepingClick}
              >
                <Book className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col flex-1 min-w-0"
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="font-semibold text-base whitespace-nowrap">
                          Bookkeeping
                        </p>
                        {isBookkeepingOpen ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-white/80 whitespace-nowrap">
                        Keep your chart of accounts
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bookkeeping submenu */}
              <AnimatePresence>
                {!isCollapsed && isBookkeepingOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: "auto",
                      transition: {
                        height: { duration: 0.3, ease: "easeInOut" },
                        opacity: { duration: 0.2, ease: "easeInOut" }
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      height: 0,
                      transition: {
                        height: { duration: 0.25, ease: "easeInOut" },
                        opacity: { duration: 0.15, ease: "easeInOut" }
                      }
                    }}
                    className="ml-8 mt-1 space-y-1 border-l-2 border-white/20 pl-2"
                  >
                    {bookkeepingItems.map((item, index) => {
                      const isActive = currentPath === item.href
                      const Icon = item.icon

                      return (
                        <Link key={item.name} href={item.href} className="block">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-[#FC6719] text-white shadow-sm"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                            onClick={handleSubItemClick}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <p className="font-medium text-sm whitespace-nowrap">
                                {item.name}
                              </p>
                              <p className="text-xs text-white/60 whitespace-nowrap">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed submenu - appears as popout */}
              <AnimatePresence>
                {isCollapsed && isBookkeepingOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full top-0 ml-2 bg-[#541DA0] rounded-xl shadow-2xl border border-white/20 p-2 min-w-[200px] z-50"
                  >
                    {bookkeepingItems.map((item, index) => {
                      const isActive = currentPath === item.href
                      const Icon = item.icon

                      return (
                        <Link key={item.name} href={item.href} className="block">
                          <div
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-[#FC6719] text-white shadow-sm"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                            onClick={handleSubItemClick}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <p className="font-medium text-sm whitespace-nowrap">
                                {item.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && !isBookkeepingOpen && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                  Bookkeeping
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* BOTTOM SECTION: Avatar + Sign Out */}
        <div className="px-4 py-3 relative flex-shrink-0">
          {/* Avatar */}
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
          >
            <Avatar className="h-8 w-8 ring-2 ring-white/30 flex-shrink-0">
              <AvatarFallback className="bg-white/30 text-white font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-sm text-white truncate">
                    {getUserName()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign Out Button */}
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`flex items-center justify-center mt-4 text-white hover:bg-[#FC6719] hover:text-white transition-colors duration-200 py-2 ${
                isCollapsed ? "px-2" : "px-3"
              }`}
            >
              <img 
                src="/signout-svg.svg" 
                alt="sign-out" 
                className={`${isCollapsed ? "w-7 h-7" : "w-5 h-5"}`} 
              />
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="ml-2"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}

          {/* Collapse Toggle (desktop only) */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-8 w-8 p-0 absolute -right-3 bottom-3 text-white  hover:text-[#8461B4] transform -translate-y-1/2 z-100"
            >
              {isCollapsed ? (
                <img src="/collapse-button.svg" alt="btn" className="w-[22px] h-[22px]" />
              ) : (
                <img src="/collapse-button.svg" alt="btn" className="w-[22px] h-[22px] rotate-180" />
              )}
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar