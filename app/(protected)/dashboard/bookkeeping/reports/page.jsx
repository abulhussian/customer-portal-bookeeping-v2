"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, Calendar, BarChart3, Calculator, File } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const reportTypes = [
  {
    title: "Financial Summary",
    description: "Comprehensive financial overview",
    icon: FileText, // Your icon component
    bg: "/Rectangle145138.svg", // Background image path
    borderColor: "#7285D5",
    iconBg: "#9A6EEF"
  },
  {
    title: "Expense Report", 
    description: "Detailed expense breakdown",
    icon: File,
    bg: "/Rectangle145211orange.svg",
    borderColor: "#DD7949", 
    iconBg: "#E86118"
  },
  {
    title: "Revenue Analysis",
    description: "Revenue trends and insights",
    icon: BarChart3,
    bg: "/Rectangle145235blue.svg", 
    borderColor: "#7285D5",
    iconBg: "#4C56CC"
  },
  {
    title: "Tax Report",
    description: "Tax-related documents and summaries",
    icon: Calculator,
    bg: "/Rectangle45212.svg",
    borderColor: "#3CB0A5",
    iconBg: "#229187"
  }
];

  const handleGenerateReport = (reportType) => {
    toast.success(`Generating ${reportType}...`);
  };

  return (
    <motion.div className=" flex flex-col min-h-screen ">
    <div className=" w-full space-y-3 max-h-[calc(100vh)] overflow-y-auto p-3 max-w-7xl mx-auto pb-24 sm:pb-8">
      <div>
  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">Available Reports</h3>
 <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5 mt-4">
  {reportTypes.map((report, index) => (
    <div
      key={report.title}
      className="w-full xs:w-[48%] sm:w-[200px] md:w-[210px] lg:w-[234px] 
               h-[120px] sm:h-[130px] md:h-[142px] 
               rounded-[40px_6px_6px_6px] 
               bg-cover bg-no-repeat hover:shadow-lg transition-shadow 
               cursor-pointer p-3 md:p-4 group flex-shrink-0"
      style={{ 
        backgroundImage: `url(${report.bg})`, 
        borderRadius: index === 0 ? "40px 6px 6px 6px" : 
                     index === reportTypes.length - 1 ? "6px 6px 40px 6px" : "6px"
      }}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start gap-2 md:gap-3">
          <div
            className="p-2 rounded-full w-8 h-8 sm:w-[36px] sm:h-[36px] md:w-[39px] md:h-[39px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: report.iconBg }}
          >
            <report.icon className="h-4 w-4 sm:h-5 sm:w-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-xs md:text-sm font-medium text-white uppercase tracking-widest line-clamp-1">
              {report.title}
            </h4>
            <p className="text-[10px] sm:text-[10px] md:text-xs text-gray-200 opacity-90 leading-tight line-clamp-2 mt-1">
              {report.description}
            </p>
          </div>
        </div>

        <div className="mt-1 md:mt-2">
          <button
            onClick={() => handleGenerateReport(report.title)}
            className="px-2 py-1.5 md:px-3 md:py-1.5 text-white rounded text-xs font-medium transition-all hover:opacity-90 w-20 sm:w-24 md:w-1/3"
            style={{ backgroundColor: report.iconBg }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
</div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Reports</h2>
        <p className="text-gray-600 mt-2">
          Generate and download financial reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select report parameters and generate your financial statements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select defaultValue="balance-sheet">
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                  <SelectItem value="income-statement">Income Statement</SelectItem>
                  <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                  <SelectItem value="trial-balance">Trial Balance</SelectItem>
                  <SelectItem value="general-ledger">General Ledger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select defaultValue="current-month">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={() => handleGenerateReport("Balance Sheet")}>
            <Download className="mr-2 h-4 w-4" />
            Generate & Download Report
          </Button>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Balance Sheet - January 2024", date: "Generated on Jan 15, 2024", format: "PDF" },
              { name: "Income Statement - Q4 2023", date: "Generated on Jan 10, 2024", format: "Excel" },
              { name: "Cash Flow - December 2023", date: "Generated on Jan 5, 2024", format: "PDF" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-gray-600">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600">
                    {report.format}
                  </span>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </motion.div>
  );
}