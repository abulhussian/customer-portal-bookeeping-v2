"use client"

import { AuthProvider } from "@/src/contexts/AuthContext"
import './globals.css'
import DashboardLayout from "@/src/components/DashboardLayout"
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  useEffect(() => {
    const originalFetch = window.fetch; 
     function handleLogout() {
      localStorage.clear();
      window.location.href = "/login";
    }

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();

        let data;
        try {
          data = await clonedResponse.json();
        } catch {
          data = null;
        }


        if (data?.error?.toLowerCase().includes("token expired")) {
          toast.error('Session Expired please login again.')
          setTimeout(()=>{
            localStorage.clear();
            window.location.href = "/login";
          } , 2000)

        }

        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    };

   
  }, []);
  return (
    <>
    <html lang="en" style={{ overflow: "hidden" }}>
      <head>
        <title>Invertio.us – Invertio Taxation Company</title>
        <meta
          name="description"
          content="Professional taxation management platform with comprehensive document handling, payment processing, and business management solutions"
        />
        <meta name="keywords" content="taxation, business management, document handling, payment processing, tax returns, Invertio" />
        <meta name="author" content="Invertio Taxation Company" />
      </head>
      <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      <body width="device-width" initial-scale="1">
     <ToastContainer position="top-right" autoClose={3000} />

        <AuthProvider>
        {/* <DashboardLayout> */}

          {children}
        {/* </DashboardLayout> */}

        </AuthProvider>
      </body>
    </html>
    </>
  )
}