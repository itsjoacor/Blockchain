import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/flujo1/Home";
import OldPage from "./pages/flujo1/OldPage";
import Instructions from "./pages/flujo1/Instructions";
import FetchAndVal from "./pages/flujo1/FetchAndVal";
import Mint from "./pages/flujo1/Mint";
import VerifyMinted from "./pages/flujo1/VerifMinted";

import Home2 from "./pages/flujo2/Home2";
import OldPage2 from "./pages/flujo2/OldPage2";
import Instructions2 from "./pages/flujo2/Instructions2";
import FetchAndVal2 from "./pages/flujo2/FetchAndVal2";
import Mint2 from "./pages/flujo2/Mint2";
import VerifyMinted2 from "./pages/flujo2/VerifMinted2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/2" element={<Home2 />} />
        <Route path="/instructions2" element={<Instructions2 />} />
        <Route path="/oldP2" element={<OldPage2 />} />
        <Route path="/fetchAndVal2" element={<FetchAndVal2 />} />
        <Route path="/mint2" element={<Mint2 />} />
        <Route path="/isMinted2" element={<VerifyMinted2 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
