import { useEffect, useState } from "react";
import Splash from "./pages/splash";
import Auth from "./pages/auth";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return showSplash ? <Splash /> : <Auth />;
}

export default App;