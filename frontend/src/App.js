import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Splash from "./pages/splash";
import Auth from "./pages/auth";
import RoleSelection from "./pages/RoleSelection";

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

function HomeownerHome() {
  return (
    <div className="min-h-screen bg-[#FFE8D6] flex items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900">Homeowner Home</h1>
    </div>
  );
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;