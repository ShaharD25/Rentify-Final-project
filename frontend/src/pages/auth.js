/*
Authentication page component.
Displays the main auth screen with tab switching between
the login form and the registration form.
Responsible for the page layout and active tab state.
*/

import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import RoleSelection from "./RoleSelection";


export default function Auth() {
    const [activeTab, setActiveTab] = useState("login");
    const [pendingUserId, setPendingUserId] = useState("");

    function handleRegisterSuccess(userId) {
        setPendingUserId(userId);
        setActiveTab("roleSelection");
    }



 return (
  <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center px-6 py-10">
    <div className="w-full max-w-md">
        {activeTab === "register" && (
      <div className="text-center mb-8">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
          Rentify
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Welcome</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your rental world in one place
        </p>
      </div>
        )} 

      {activeTab !== "roleSelection" && (
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-orange-100 p-6 sm:p-8">
          <div className="bg-[#FFF1E0] rounded-2xl p-1 flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-[#FF8A00] text-white shadow-md"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              Sign in
            </button>

            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-[#FF8A00] text-white shadow-md"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === "login" && <LoginForm />}

          {activeTab === "register" && (
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          )}
        </div>
      )}

      {activeTab === "roleSelection" && (
        <RoleSelection pendingUserId={pendingUserId} />
      )}
    </div>
  </div>
);
}