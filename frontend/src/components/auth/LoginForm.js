import { useState } from "react";
import { loginUser } from "../../services/authService";

export default function LoginForm() {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginMessage, setLoginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginMessage("");
    setIsLoading(true);

    try {
      const result = await loginUser(loginForm);

      if (result.success) {
        setLoginMessage("Login successful!");
      } else {
        setLoginMessage(result.message || "Login failed");
      }
    } catch (error) {
      setLoginMessage("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleLoginSubmit}>
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
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
          placeholder="Enter your email"
          disabled={isLoading}
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
          value={loginForm.password}
          onChange={(e) =>
            setLoginForm({ ...loginForm, password: e.target.value })
          }
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#FF8A00] focus:ring-4 focus:ring-orange-100"
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00]"
            disabled={isLoading}
          />
          Remember me
        </label>

        <button
          type="button"
          className="font-medium text-[#FF8A00] hover:text-[#E67C00] transition"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[#FF8A00] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00] focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          )}
          {isLoading ? "Signing in..." : "Sign in"}
        </span>
      </button>

      {loginMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-center text-red-600 font-medium">
            {loginMessage}
          </p>
        </div>
      )}
    </form>
  );
}