"use client";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { BASE_URL } from "./BaseUrl";

const AddAccountModal = ({ isOpen, onClose, onSave, isView, isUpdate, accountId, viewData }) => {
  const { uid, role } = JSON.parse(localStorage.getItem("userProfile"));
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isReadOnly = isView;

  const viewdata = viewData || {};
  console.log("viewdata", viewdata);
  console.log("accountId", accountId); // 👈 Debug log to check accountId
  console.log("isUpdate", isUpdate); // 👈 Debug log to check isUpdate

  const [newAccount, setNewAccount] = useState({
    account_name: "",
    account_number: 0,
    description: "",
    type: "",
    category: "",
    balance: 0,
    company_id: 0,
    createdby_type: role,
    createdby_id: uid,
    customer_id: uid,
    customCategory: ""
  });

  // Get company name from companies data based on company_id
  const getCompanyName = (companyId) => {
    if (!companies || companies.length === 0) return "-";
    const company = companies.find(comp => comp.id === companyId || comp.id === parseInt(companyId));
    return company ? company.company_name : "-";
  };

  // Reset form when modal opens or viewData changes
  useEffect(() => {
    if (viewData && Object.keys(viewData).length > 0) {
      console.log("Setting form with viewData:", viewData); // 👈 Debug log
      setNewAccount({
        company_id: viewData.company_id || 0,
        account_number: viewData.account_number || 0,
        account_name: viewData.account_name || "",
        description: viewData.description || "",
        type: viewData.type || "",
        category: viewData.category || "",
        balance: viewData.balance || 0,
        createdby_type: role,
        createdby_id: uid,
        customer_id: uid,
        customCategory: viewData.customCategory || ""
      });
    } else {
      console.log("Resetting form for add mode"); // 👈 Debug log
      setNewAccount({
        account_name: "",
        account_number: "",
        description: "",
        type: "",
        category: "",
        balance: 0,
        company_id: 0,
        createdby_type: role,
        createdby_id: uid,
        customer_id: uid,
        customCategory: ""
      });
    }
  }, [viewData, isOpen, role, uid]);

  useEffect(() => {
    getCompanies();
  }, []);

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

  const getCompanies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/get-companies/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧩 Basic validation before API call
    if (!newAccount.account_number) {
      toast.error("Please enter a valid Account Number");
      return;
    }
    if (!newAccount.account_name.trim()) {
      toast.error("Please enter Account Name");
      return;
    }
    if (!newAccount.type.trim()) {
      toast.error("Please select Account Type");
      return;
    }
    if (!newAccount.category.trim()) {
      toast.error("Please select Account Category");
      return;
    }
    if (newAccount.category === "other" && !newAccount.customCategory?.trim()) {
      toast.error("Please enter a Custom Category");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      let url;
      let method;

      // 👈 FIXED THE CONDITIONAL LOGIC HERE
      if (isUpdate && accountId) {
        // Update existing account
        url = `${BASE_URL}/api/book-keeping/update-account/${accountId}`; // 👈 Use BASE_URL
        method = "PATCH";
        console.log("Calling UPDATE API for accountId:", accountId); // 👈 Debug log
      } else {
        // Create new account
        url = `${BASE_URL}/api/book-keeping/add-account`;
        method = "POST";
        console.log("Calling CREATE API"); // 👈 Debug log
      }

      // Prepare the data to be sent
      const finalCategory = newAccount.category === "other"
        ? newAccount.customCategory
        : newAccount.category;

      const accountData = {
        ...newAccount,
        account_number: Number(newAccount.account_number),
        balance: Number(newAccount.balance) || 0,
        category: finalCategory,
        // Remove customCategory field if not needed in the backend
        ...(newAccount.category !== "other" && { customCategory: undefined })
      };

      console.log("Sending data:", accountData); // 👈 Debug log
      console.log("URL:", url); // 👈 Debug log
      console.log("Method:", method); // 👈 Debug log

      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();
      console.log("Response:", data); // 👈 Debug log

      if (response.ok) {
        const successMessage = isUpdate
          ? "Account updated successfully ✅"
          : "Account created successfully 🎉";

        toast.success(successMessage);

        // Prepare the account data for the parent component
        const formattedAccountData = {
          ...newAccount,
          category: finalCategory,
          balance: newAccount.balance
            ? `$${parseFloat(newAccount.balance).toLocaleString()}`
            : "$0",
          documentCount: 0,
          lastUpdated: new Date().toISOString().split("T")[0],
          // Include the account ID for update scenarios
          ...(isUpdate && accountId && { id: accountId })
        };

        onSave(formattedAccountData);
        onClose();
      } else {
        toast.error(data.message || `Failed to ${isUpdate ? 'update' : 'create'} account. Please try again.`);
      }
    } catch (err) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} account:`, err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    newAccount.account_number &&
    newAccount.account_name.trim() &&
    newAccount.type.trim() &&
    (
      newAccount.category.trim() &&
      (newAccount.category !== "other" || newAccount.customCategory?.trim())
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isView ? "View Account" : isUpdate ? "Update Account" : "Create New Account"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isView ? "View account details" : isUpdate ? "Update account information" : "Add a new account to your chart of accounts"}
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
            {/* Account Number and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAccount.account_number || ""}
                  readOnly={isReadOnly}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewAccount({
                      ...newAccount,
                      account_number: value ? parseInt(value, 10) : "", // 👈 convert to integer
                    });
                  }}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  readOnly={isReadOnly}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                  placeholder="Enter account name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              {isReadOnly ? (
                <input
                  type="text"
                  value={getCompanyName(newAccount.company_id)}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
              ) : (
                <select
                  value={newAccount.company_id || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, company_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Account Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type <span className="text-red-500">*</span>
                </label>

                {isReadOnly ? (
                  <input
                    type="text"
                    value={newAccount.type || "-"}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                ) : (
                  <select
                    value={newAccount.type || ""}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        type: e.target.value,
                        category: "", // Reset category when type changes
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                )}
              </div>

              {/* Account Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Category <span className="text-red-500">*</span>
                </label>

                {isReadOnly ? (
                  <input
                    type="text"
                    value={
                      newAccount.category === "other"
                        ? newAccount.customCategory || "-"
                        : newAccount.category || "-"
                    }
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                ) : newAccount.type ? (
                  <div>
                    <select
                      value={newAccount.category || ""}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, category: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Category</option>

                      {newAccount.type === "Asset" && (
                        <>
                          <option value="Current Assets">Current Assets</option>
                          <option value="Fixed Assets">Fixed Assets</option>
                          <option value="Investments">Investments</option>
                          <option value="Intangible Assets">Intangible Assets</option>
                          <option value="Other Assets">Other Assets</option>
                        </>
                      )}
                      {newAccount.type === "Liability" && (
                        <>
                          <option value="Current Liabilities">Current Liabilities</option>
                          <option value="Long-term Liabilities">Long-term Liabilities</option>
                          <option value="Loans Payable">Loans Payable</option>
                          <option value="Other Liabilities">Other Liabilities</option>
                        </>
                      )}
                      {newAccount.type === "Equity" && (
                        <>
                          <option value="Owner's Equity">Owner's Equity</option>
                          <option value="Retained Earnings">Retained Earnings</option>
                          <option value="Common Stock">Common Stock</option>
                          <option value="Preferred Stock">Preferred Stock</option>
                        </>
                      )}
                      {newAccount.type === "Revenue" && (
                        <>
                          <option value="Operating Revenue">Operating Revenue</option>
                          <option value="Non-operating Revenue">Non-operating Revenue</option>
                          <option value="Sales Revenue">Sales Revenue</option>
                          <option value="Service Revenue">Service Revenue</option>
                        </>
                      )}
                      {newAccount.type === "Expense" && (
                        <>
                          <option value="Cost of Sales">Cost of Sales</option>
                          <option value="Operating Expenses">Operating Expenses</option>
                          <option value="Financial Expenses">Financial Expenses</option>
                          <option value="Administrative Expenses">Administrative Expenses</option>
                          <option value="Other Expenses">Other Expenses</option>
                        </>
                      )}
                      <option value="other">Other (Specify)</option>
                    </select>

                    {newAccount.category === "other" && (
                      <input
                        type="text"
                        value={newAccount.customCategory || ""}
                        onChange={(e) =>
                          setNewAccount({ ...newAccount, customCategory: e.target.value })
                        }
                        placeholder="Enter custom category name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                      />
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-2.5 bg-gray-100 rounded-lg text-gray-500 text-sm">
                    Select account type first
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newAccount.description}
                readOnly={isReadOnly}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                placeholder="Enter account description or purpose..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional description for better account management
              </p>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Balance
              </label>
              <div className="max-w-xs">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={newAccount.balance}
                    readOnly={isReadOnly}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) || 0 })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the initial balance (leave 0 for new accounts)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-2 m-1 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="px-6 py-2.5 bg-[linear-gradient(257deg,_#5EA1F8_0%,_#4486D9_100%)] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isUpdate ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {isUpdate ? "Update Account" : "Create Account"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;