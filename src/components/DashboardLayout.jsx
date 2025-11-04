"use client"

import Sidebar from "./Sidebar"
import { useState, useEffect, createContext, useContext } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import {
  FileText,
  Activity,
  CreditCard,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Receipt
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

const FilterModalContext = createContext();
export const useFilterModal = () => useContext(FilterModalContext);

export default function DashboardLayout({ children, isOpen, setIsOpen, currentPath }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { currentUser, logout } = useAuth()
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

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
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [setIsOpen])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      toast.error("Logout error")
    }
  }

  return (
    <FilterModalContext.Provider
      value={{
        isFilterModalOpen,
        setIsFilterModalOpen,
        isFormModalOpen,
        setIsFormModalOpen,
      }}
    >
      <div className="flex-1 flex h-screen overflow-hidden bg-[#541DA0]">
        {/* Sidebar Container */}
        <div className={`flex-shrink-0 transition-all duration-300 ${
          isFilterModalOpen || isFormModalOpen ? "blur-sm" : ""
        }`}>
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} currentPath={currentPath} />
        </div>

        {/* Main Content - FIXED HEIGHT */}
        <div className={`flex-1 flex flex-col h-screen overflow-hidden bg-white transition-all duration-300 ${
          isMobile ? "rounded-none" : ""
        }`}>
          {/* Fixed header space for mobile */}
          <div className="block sm:hidden min-h-8 flex-shrink-0"></div>
          
          {/* Scrollable content area */}
          <div className="flex-1 ">
            <div className="px-3 py-4 min-h-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </FilterModalContext.Provider>
  )
}
