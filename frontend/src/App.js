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
import RenterApartmentDetails from "./pages/RenterApartmentDetails";
import RenterLayout from "./components/layout/RenterLayout";
import RenterNotificationsPage from "./pages/RenterNotificationsPage";
import RenterApartmentIssuesPage from "./pages/RenterApartmentIssuesPage";
import CreateRenterIssue from "./pages/CreateRenterIssue";
import RenterIssuesPage from "./pages/RenterIssuesPage";
import RenterApartmentsPage from "./pages/RenterApartmentsPage";
import HomeownerNotificationsPage from "./pages/HomeownerNotificationsPage";
import PropertyChatPage from "./pages/PropertyChatPage";
import ChatsPage from "./pages/ChatsPage";
import RenterApartmentBillsPage from "./pages/RenterApartmentBillsPage";
import RenterBillsPage from "./pages/RenterBillsPage";
import RenterRoommatesPage from "./pages/RenterRoommatesPage";
import RenterApartmentRoommatesPage from "./pages/RenterApartmentRoommatesPage";
import SettingsPage from "./pages/SettingsPage";


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
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Renter routes */}
        <Route path="/renter" element={<RenterLayout />}>
          {/* Renter dashboard */}
          <Route index element={<RenterHome />} />

          {/* Renter apartment routes */}
          <Route path="apartments" element={<RenterApartmentsPage />} />
          <Route path="apartments/add" element={<AddApartment />} />
          <Route path="apartments/:propertyId" element={<RenterApartmentDetails />} />

          {/* Renter issue routes */}
          <Route path="issues" element={<RenterIssuesPage />} />
          <Route path="apartments/:propertyId/issues" element={<RenterApartmentIssuesPage />} />
          <Route path="apartments/:propertyId/issues/new" element={<CreateRenterIssue />} />

          {/* Renter bills routes */}
          <Route path="bills" element={<RenterBillsPage />} />
          <Route path="apartments/:propertyId/bills" element={<RenterApartmentBillsPage />} />

          {/* Renter roommates routes */}
          <Route path="roommates" element={<RenterRoommatesPage />} />
          <Route
            path="apartments/:propertyId/roommates"
            element={<RenterApartmentRoommatesPage />}
          />

          {/* Renter chat routes */}
          <Route path="chat" element={<ChatsPage role="renter" />} />
          <Route
            path="apartments/:propertyId/chat"
            element={<PropertyChatPage role="renter" />}
          />

          {/* Renter notification routes */}
          <Route path="notifications" element={<RenterNotificationsPage />} />

          {/* Renter settings route */}
          <Route path="settings" element={<SettingsPage />} />

          
        </Route>

        {/* Homeowner routes */}
        <Route path="/homeowner" element={<HomeownerLayout />}>
          {/* Homeowner dashboard */}
          <Route index element={<HomeownerHome />} />

          {/* Homeowner property routes */}
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/new" element={<CreateProperty />} />
          <Route path="properties/:propertyId" element={<PropertyDetails />} />

          {/* Homeowner issue routes */}
          <Route path="issues" element={<IssuesPage />} />
          <Route path="properties/:propertyId/issues" element={<IssuesPage />} />
          <Route path="issues/:issueId" element={<IssueDetails />} />

          {/* Homeowner payment routes */}
          <Route path="payments" element={<PaymentsPage />} />

          {/* Homeowner chat routes */}
          <Route path="chat" element={<ChatsPage role="homeowner" />} />
          <Route
            path="properties/:propertyId/chat"
            element={<PropertyChatPage role="homeowner" />}
          />

          {/* Homeowner notification routes */}
          <Route path="notifications" element={<HomeownerNotificationsPage />} />

          
          {/* Homeowner settings route  */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;