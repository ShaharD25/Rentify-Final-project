/*
RoleSelection component.
Displays a separate role selection step after registration.
Allows the user to choose between Homeowner and Renter
using two clear buttons before continuing to the next step.
*/

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveUserRole } from "../services/authService";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");

  // Navigate to the next page after role selection.
  const navigate = useNavigate();

  // Store the registered user's id for the current role selection flow.
  const [pendingUserId, setPendingUserId] = useState("");
  // Display an error message if role saving fails.
  const [roleMessage, setRoleMessage] = useState("");
  // Prevent multiple submissions while saving the selected role.
  const [isLoading, setIsLoading] = useState(false);

  // Load the temporary user id from session storage.
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("pendingUserId");

    if (!storedUserId) {
      // Return to auth if no user id is available.
      navigate("/auth");
      return;
    }

    setPendingUserId(storedUserId);
  }, [navigate]);

  // Save the selected role and move to the matching home page.
  async function handleContinue() {
    if (!selectedRole || !pendingUserId) {
      return;
    }

    setRoleMessage("");
    setIsLoading(true);

    try {
      const result = await saveUserRole({
        userId: pendingUserId,
        role: selectedRole,
      });

      if (result.success) {
        // Clear the temporary user id after successful role selection.
        sessionStorage.removeItem("pendingUserId");

        if (selectedRole === "homeowner") {
          navigate("/homeowner");
        } else if (selectedRole === "renter") {
          navigate("/renter");
        }
      } else {
        setRoleMessage(result.message || "Failed to save the selected role.");
      }
    } catch (error) {
      setRoleMessage("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

return (
  <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
    <div className="w-full max-w-md sm:max-w-2xl">
      <div className="bg-[#FFF8F3]/90 backdrop-blur-sm rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-orange-100 p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Choose your role
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Select the role that matches how you will use Rentify
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setSelectedRole("homeowner")}
            className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 text-center transition-all duration-200 ${
              selectedRole === "homeowner"
                ? "border-[#FF8A00] bg-orange-100 ring-4 ring-orange-200 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-300"
            }`}
          >
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              Homeowner
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("renter")}
            className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 text-center transition-all duration-200 ${
              selectedRole === "renter"
                ? "border-[#FF8A00] bg-orange-100 ring-4 ring-orange-200 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-300"
            }`}
          >
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              Renter
            </p>
          </button>
        </div>

        <div className="mt-4 sm:mt-5 text-center min-h-[24px]">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {selectedRole === "homeowner" && "Manage properties, renters, and payments."}
            {selectedRole === "renter" && "Track rent, issues, and property updates."}
          </p>
        </div>

        {roleMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-center font-medium text-red-600">
              {roleMessage}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="mt-5 sm:mt-6 w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  </div>
);
}