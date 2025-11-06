
// "use client"
// import { BASE_URL } from "@/src/components/BaseUrl";
// import { useState } from "react";
// import DatePicker from "react-datepicker";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion"


// export default function CompanyProfile() {



//   const { uid, role } = JSON.parse(localStorage.getItem("userProfile"));
//   // console.log("userData in return form", uid, role)

//   const [formData, setFormData] = useState({
//     company_name: "Acme Corporation",
//     registration_number: "REG123456",
//     tax_id: "TAX987654",
//     street_address: "123 Business Street",
//     city: "New York",
//     state: "NY",
//     zip_code: "10001",
//     country: "United States",
//     phone_number: "+1 (555) 123-4567",
//     email: "info@acmecorp.com",
//     website: "www.acmecorp.com",
//     fiscal_year_end: '',
//     createdby_type: role,
//     createdby_id: uid,
//     notes: "",
//     customer_id: uid,
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${BASE_URL}/api/book-keeping/add-company`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });
//       console.log("Company profile updated:", response);

//       if (!response.ok) {
//         toast.error("Network response was not ok");
//         console.log(response)
//       }
//       else {
//         toast.success("Company profile updated successfully!");
//       }
//     } catch (error) {
      
//       toast.error("Failed to update company profile.");
//     }
//   };


  
//   const handleChange = (e) => {
//     console.log(e.target.name, e.target.value);
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <motion.div className=" flex flex-col min-h-screen ">
//     <div className="w-full max-w-7xl mx-auto p-3 max-h-[calc(100vh)] overflow-y-auto space-y-3 pb-24 sm:pb-8">
//       <div>
//         <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
//         <p className="text-gray-600 mt-2">
//           Manage your company information and settings
//         </p>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
//             <p className="text-gray-600 text-sm mt-1">
//               Enter your company details for accurate bookkeeping records
//             </p>
//           </div>
//           <div className="p-6 space-y-6">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
//                   Company Name *
//                 </label>
//                 <input
//                   id="companyName"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
//                   Registration Number
//                 </label>
//                 <input
//                   id="registrationNumber"
//                   name="registration_number"
//                   value={formData.registration_number}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2  bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
//                   Tax ID
//                 </label>
//                 <input
//                   id="taxId"
//                   name="tax_id"
//                   value={formData.tax_id}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="fiscalYearEnd" className="block text-sm font-medium text-gray-700">
//                   Fiscal Year End (MM-DD)
//                 </label>

//                 <input
//                   id="fiscalYearEnd"
//                   name="fiscal_year_end"
//                   type="date"
//                   value={formData.fiscal_year_end}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />

//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//                 Street Address
//               </label>
//               <input
//                 id="address"
//                 name="street_address"
//                 value={formData.street_address}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//               />
//             </div>

//             <div className="grid gap-4 md:grid-cols-3">
//               <div className="space-y-2">
//                 <label htmlFor="city" className="block text-sm font-medium text-gray-700">
//                   City
//                 </label>
//                 <input
//                   id="city"
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="state" className="block text-sm font-medium text-gray-700">
//                   State/Province
//                 </label>
//                 <input
//                   id="state"
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
//                   ZIP/Postal Code
//                 </label>
//                 <input
//                   id="zipCode"
//                   name="zip_code"
//                   value={formData.zip_code}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="country" className="block text-sm font-medium text-gray-700">
//                 Country
//               </label>
//               <input
//                 id="country"
//                 name="country"
//                 value={formData.country}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//               />
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   id="phone"
//                   name="phone_number"
//                   value={formData.phone_number}
//                   onChange={handleChange}
//                   type="tel"
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 "
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                   Email Address
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   type="email"
//                   className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 "
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="website" className="block text-sm font-medium text-gray-700">
//                 Website
//               </label>
//               <input
//                 id="website"
//                 name="website"
//                 value={formData.website}
//                 onChange={handleChange}
//                 type="url"
//                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
//                 Additional Notes
//               </label>
//               <textarea
//                 id="notes"
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 rows={4}
//                 placeholder="Any additional information about your company..."
//                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
//               />
//             </div>

//             <div className="flex justify-end gap-4 pt-4">
//               <button
//                 type="button"
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//     </motion.div>
//   );
// }

"use client"
import { BASE_URL } from "@/src/components/BaseUrl";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion"

export default function CompanyProfile() {
  const { uid, role } = JSON.parse(localStorage.getItem("userProfile"));
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    registration_number: "",
    tax_id: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    phone_number: "",
    email: "",
    website: "",
    fiscal_year_end: '',
    createdby_type: role,
    createdby_id: uid,
    notes: "",
    customer_id: uid,
  });

  // Fetch companies on component mount
  useEffect(() => {
    getCompanies();
  }, []);

  const getCompanies = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/get-companies/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let response;
      let url;
      let method;

      if (isEditMode && selectedCompany) {
        // Update existing company
        url = `${BASE_URL}/api/book-keeping/update-company/${selectedCompany.id}`;
        method = "PATCH";
      } else {
        // Create new company
        url = `${BASE_URL}/api/book-keeping/add-company`;
        method = "POST";
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const successMessage = isEditMode 
          ? "Company updated successfully!" 
          : "Company created successfully!";
        toast.success(successMessage);
        
        // Refresh companies list
        await getCompanies();
        handleCloseModal();
      } else {
        toast.error("Failed to save company data.");
      }
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to save company data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCompany = () => {
    setIsViewMode(false);
    setIsEditMode(false);
    setSelectedCompany(null);
    setFormData({
      company_name: "",
      registration_number: "",
      tax_id: "",
      street_address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
      phone_number: "",
      email: "",
      website: "",
      fiscal_year_end: '',
      createdby_type: role,
      createdby_id: uid,
      notes: "",
      customer_id: uid,
    });
    setIsModalOpen(true);
  };

  const handleViewCompany = (company) => {
    setIsViewMode(true);
    setIsEditMode(false);
    setSelectedCompany(company);
    setFormData({
      company_name: company.company_name || "",
      registration_number: company.registration_number || "",
      tax_id: company.tax_id || "",
      street_address: company.street_address || "",
      city: company.city || "",
      state: company.state || "",
      zip_code: company.zip_code || "",
      country: company.country || "",
      phone_number: company.phone_number || "",
      email: company.email || "",
      website: company.website || "",
      fiscal_year_end: company.fiscal_year_end ? company.fiscal_year_end.split('T')[0] : '',
      createdby_type: role,
      createdby_id: uid,
      notes: company.notes || "",
      customer_id: uid,
    });
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setIsViewMode(false);
    setIsEditMode(true);
    setSelectedCompany(company);
    setFormData({
      company_name: company.company_name || "",
      registration_number: company.registration_number || "",
      tax_id: company.tax_id || "",
      street_address: company.street_address || "",
      city: company.city || "",
      state: company.state || "",
      zip_code: company.zip_code || "",
      country: company.country || "",
      phone_number: company.phone_number || "",
      email: company.email || "",
      website: company.website || "",
      fiscal_year_end: company.fiscal_year_end ? company.fiscal_year_end.split('T')[0] : '',
      createdby_type: role,
      createdby_id: uid,
      notes: company.notes || "",
      customer_id: uid,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(`${BASE_URL}/api/book-keeping/delete-company/${companyId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success("Company deleted successfully!");
          await getCompanies();
        } else {
          toast.error("Failed to delete company.");
        }
      } catch (error) {
        console.error("Error deleting company:", error);
        toast.error("Failed to delete company.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewMode(false);
    setIsEditMode(false);
    setSelectedCompany(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <motion.div className="flex flex-col min-h-screen">
      <div className="w-full max-w-7xl mx-auto p-3 max-h-[calc(100vh)] overflow-y-auto space-y-3 pb-24 sm:pb-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
            <p className="text-gray-600 mt-2">
              Manage your company information and settings
            </p>
          </div>
          <button
            onClick={handleAddCompany}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Companies</h3>
            <p className="text-gray-600 text-sm mt-1">
              {companies.length} company{companies.length !== 1 ? 'ies' : ''} registered
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No Companies Found</h3>
              <p className="text-gray-600 text-sm">
                Get started by adding your first company profile
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiscal Year End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {company.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.website || "No website"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.registration_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.tax_id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{company.city || "-"}</div>
                        <div className="text-gray-500">{company.country || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(company.fiscal_year_end)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewCompany(company)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* <button
                            onClick={() => handleEditCompany(company)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Edit Company"
                          >
                            <Edit className="w-4 h-4" />
                          </button> */}
                          {/* <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isViewMode ? "View Company" : isEditMode ? "Edit Company" : "Add New Company"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {isViewMode ? "View company details" : isEditMode ? "Update company information" : "Add a new company to your profile"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name *
                      </label>
                      <input
                        id="companyName"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                        Registration Number
                      </label>
                      <input
                        id="registrationNumber"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                        Tax ID
                      </label>
                      <input
                        id="taxId"
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="fiscalYearEnd" className="block text-sm font-medium text-gray-700">
                        Fiscal Year End
                      </label>
                      <input
                        id="fiscalYearEnd"
                        name="fiscal_year_end"
                        type="date"
                        value={formData.fiscal_year_end}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="street_address" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      id="street_address"
                      name="street_address"
                      value={formData.street_address}
                      onChange={handleChange}
                      readOnly={isViewMode}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                        ZIP/Postal Code
                      </label>
                      <input
                        id="zip_code"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      readOnly={isViewMode}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        type="tel"
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        readOnly={isViewMode}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      type="url"
                      readOnly={isViewMode}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      readOnly={isViewMode}
                      placeholder="Any additional information about your company..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {isViewMode ? "Close" : "Cancel"}
                  </button>
                  {!isViewMode && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {isEditMode ? "Update Company" : "Create Company"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}