
"use client"
import { BASE_URL } from "@/src/components/BaseUrl";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

export default function CompanyProfile() {



  const { uid, role } = JSON.parse(localStorage.getItem("userProfile"));
  // console.log("userData in return form", uid, role)

  const [formData, setFormData] = useState({
    company_name: "Acme Corporation",
    registration_number: "REG123456",
    tax_id: "TAX987654",
    street_address: "123 Business Street",
    city: "New York",
    state: "NY",
    zip_code: "10001",
    country: "United States",
    phone_number: "+1 (555) 123-4567",
    email: "info@acmecorp.com",
    website: "www.acmecorp.com",
    fiscal_year_end: '',
    createdby_type: role,
    createdby_id: uid,
    notes: "",
    customer_id: uid,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/book-keeping/add-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log("Company profile updated:", response);

      if (!response.ok) {
        toast.error("Network response was not ok");
        console.log(response)
      }
      else {
        toast.success("Company profile updated successfully!");
      }
    } catch (error) {
      
      toast.error("Failed to update company profile.");
    }
  };


  
  const handleChange = (e) => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 max-h-[calc(100vh)] overflow-y-auto space-y-6 pb-24 sm:pb-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
        <p className="text-gray-600 mt-2">
          Manage your company information and settings
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            <p className="text-gray-600 text-sm mt-1">
              Enter your company details for accurate bookkeeping records
            </p>
          </div>
          <div className="p-6 space-y-6">
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
                  className="w-full px-3 py-2  bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fiscalYearEnd" className="block text-sm font-medium text-gray-700">
                  Fiscal Year End (MM-DD)
                </label>

                <input
                  id="fiscalYearEnd"
                  name="fiscal_year_end"
                  type="date"
                  value={formData.fiscal_year_end}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />

              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                id="address"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP/Postal Code
                </label>
                <input
                  id="zipCode"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
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
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  type="tel"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 "
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 "
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
                placeholder="Any additional information about your company..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}