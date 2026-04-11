/*
Authentication page component.
Displays the auth screen with tab switching
between login and registration forms.
*/

import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {activeTab !== "roleSelection" && (
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

        <div className="bg-[#FFF8F3]/90 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-orange-100 p-6 sm:p-8">
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
          {activeTab === "register" && <RegisterForm />}
        </div>
      </div>
    </div>
  );
}