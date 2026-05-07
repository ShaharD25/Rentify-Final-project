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
import HomeownerLayout from "./components/layout/HomeownerLayout";
import PropertiesPage from "./pages/PropertiesPage";
import CreateProperty from "./pages/CreateProperty";
import PropertyDetails from "./pages/PropertyDetails";
import IssuesPage from "./pages/IssuesPage";
import IssueDetails from "./pages/IssueDetails";
import PaymentsPage from "./pages/PaymentsPage";
import RenterHome from "./pages/RenterHome";
import AddApartment from "./pages/AddApartment";

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

function ComingSoonPage({ title }) {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-orange-100 bg-[#FFF8F3]/95 px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#FF8A00]">
          Rentify
        </p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This section will be implemented in the next development steps.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashRedirect />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/renter" element={<RenterHome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* Renter routes */}
        <Route path="/renter" element={<RenterHome />} />
        <Route path="/renter/apartments/add" element={<AddApartment />} />

        {/* Homeowner routes  */}
        <Route path="/homeowner" element={<HomeownerLayout />}>
          {/* Homeowner dashboard */}
          <Route index element={<HomeownerHome />} />

          {/* Property management routes */}
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/new" element={<CreateProperty />} />
          <Route path="properties/:propertyId" element={<PropertyDetails />} />

           {/* Issue management routes */}
          <Route path="issues" element={<IssuesPage />} />
          <Route path="properties/:propertyId/issues" element={<IssuesPage />} />
          <Route path="issues/:issueId" element={<IssueDetails />} />

          {/* Payment management route */}
          <Route path="payments" element={<PaymentsPage />} />

          
          <Route path="maintenance" element={<ComingSoonPage title="Maintenance" />} />
          <Route path="messages" element={<ComingSoonPage title="Messages" />} />
          <Route path="notifications" element={<ComingSoonPage title="Notifications" />} />
          <Route path="settings" element={<ComingSoonPage title="Settings" />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;