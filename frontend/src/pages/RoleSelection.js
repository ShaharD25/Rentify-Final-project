/*
RoleSelection component.
Displays a separate role selection step after registration.
Allows the user to choose between Homeowner and Renter
using two clear buttons before continuing to the next step.
*/

import { useState } from "react";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");

  function handleContinue() {
    if (!selectedRole) {
      return;
    }

    console.log("Selected role:", selectedRole);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose your role</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the role that matches how you will use Rentify
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelectedRole("homeowner")}
          className={`rounded-2xl border px-4 py-3 text-center transition ${
            selectedRole === "homeowner"
              ? "border-[#FF8A00] bg-orange-50 ring-2 ring-orange-100"
              : "border-gray-200 bg-white hover:border-orange-200"
          }`}
        >
          <p className="text-center text-xl font-bold text-gray-900">Homeowner</p>
         
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("renter")}
          className={`rounded-2xl border px-4 py-3 text-center transition ${
            selectedRole === "renter"
              ? "border-[#FF8A00] bg-orange-50 ring-2 ring-orange-100"
              : "border-gray-200 bg-white hover:border-orange-200"
          }`}
        >
          <p className="text-center text-xl font-bold text-gray-900">Renter</p>
          
        </button>
      </div>

  <div className="mt-5 text-center min-h-[24px]">
  <p className="text-sm text-gray-600 font-medium">
    {selectedRole === "homeowner" && "Manage properties, renters, and payments."}
    {selectedRole === "renter" && "Track rent, issues, and property updates."}

  </p>
</div>


      
      <button
        type="button"
        onClick={handleContinue}
        disabled={!selectedRole}
        className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Continue
      </button>
    </div>
  );
}