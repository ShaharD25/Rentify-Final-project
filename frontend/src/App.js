/*
Main application component.
Defines the main page routes of the app using React Router.
*/

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Splash from "./pages/splash";
import Auth from "./pages/auth";
import RoleSelection from "./pages/RoleSelection";
import ForgotPassword from "./pages/ForgotPassword";
import HomeownerHome from "./pages/HomeownerHome";
import CreateProperty from "./pages/CreateProperty";
import PropertyDetails from "./pages/PropertyDetails";
import IssuesPage from "./pages/IssuesPage";
import IssueDetails from "./pages/IssueDetails";


// Show the splash screen first, then move to the auth page.
function SplashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <Splash />;
}

function RenterHome() {
  return (
    <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900">Renter Home</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashRedirect />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/homeowner" element={<HomeownerHome />} />
        <Route path="/renter" element={<RenterHome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/homeowner/properties/new" element={<CreateProperty />} />
        <Route path="/homeowner/properties/:propertyId" element={<PropertyDetails />} />
        <Route path="/homeowner/issues" element={<IssuesPage />} />
        <Route path="/homeowner/properties/:propertyId/issues" element={<IssuesPage />} />
        <Route path="/homeowner/issues/:issueId" element={<IssueDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;