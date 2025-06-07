import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OldPage from "./pages/OldPage";
import Instructions from "./pages/Instructions";
import FetchAndVal from "./pages/FetchAndVal";
import Mint from "./pages/Mint";
import VerifyMinted from "./pages/VerifMinted"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/oldP" element={<OldPage />} />
        <Route path="/fetchAndVal" element={<FetchAndVal />} />
        <Route path="/mint" element={<Mint />} />

        <Route path="/minted?" element={<VerifyMinted />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;