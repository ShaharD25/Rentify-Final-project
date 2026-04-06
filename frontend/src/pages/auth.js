import { useState } from "react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
            Rentify
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your rental world in one place
          </p>
        </div>

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

          {activeTab === "login" && (
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-medium text-[#FF8A00] hover:text-[#E67C00] transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                Sign in
              </button>
            </form>
          )}

          {activeTab === "register" && (
            <form className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <label
                  htmlFor="security-question"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Security question
                </label>
                <input
                  id="security-question"
                  name="securityQuestion"
                  type="text"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter a security question"
                />
              </div>

              <div>
                <label
                  htmlFor="security-answer"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Security answer
                </label>
                <input
                  id="security-answer"
                  name="securityAnswer"
                  type="text"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
                  placeholder="Enter your answer"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                Create account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}