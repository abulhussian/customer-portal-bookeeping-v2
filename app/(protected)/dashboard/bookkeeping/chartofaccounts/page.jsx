
"use client";
import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");

  const accounts = [
    { id: "1000", name: "Cash", type: "Asset", category: "Current Assets", balance: "$25,000" },
    { id: "1100", name: "Accounts Receivable", type: "Asset", category: "Current Assets", balance: "$12,500" },
    { id: "1200", name: "Inventory", type: "Asset", category: "Current Assets", balance: "$8,750" },
    { id: "1500", name: "Equipment", type: "Asset", category: "Fixed Assets", balance: "$45,000" },
    { id: "2000", name: "Accounts Payable", type: "Liability", category: "Current Liabilities", balance: "$7,200" },
    { id: "2100", name: "Credit Card", type: "Liability", category: "Current Liabilities", balance: "$3,400" },
    { id: "3000", name: "Owner's Equity", type: "Equity", category: "Equity", balance: "$80,650" },
    { id: "4000", name: "Sales Revenue", type: "Revenue", category: "Income", balance: "$125,000" },
    { id: "5000", name: "Cost of Goods Sold", type: "Expense", category: "Cost of Sales", balance: "$45,000" },
    { id: "6000", name: "Rent Expense", type: "Expense", category: "Operating Expenses", balance: "$12,000" },
  ];

  const getTypeBadgeColor = (type) => {
    const colors = {
      Asset: "bg-blue-100 text-blue-800 border-blue-200",
      Liability: "bg-red-100 text-red-800 border-red-200",
      Equity: "bg-purple-100 text-purple-800 border-purple-200",
      Revenue: "bg-green-100 text-green-800 border-green-200",
      Expense: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.includes(searchTerm) ||
      account.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl max-h-[calc(100vh-50px)] overflow-y-auto mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Chart of Accounts</h2>
          <p className="text-gray-600 mt-2">
            Manage your company's account structure
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Accounts</h3>
          <p className="text-gray-600 text-sm mt-1">
            View and manage all your accounting categories
          </p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search accounts by name, number, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm w-[100px]">Account #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Account Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Balance</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-gray-900">{account.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{account.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{account.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900">{account.balance}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-1">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}