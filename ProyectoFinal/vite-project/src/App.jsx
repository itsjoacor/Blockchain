import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OldPage from "./pages/OldPage";
import Instructions from "./pages/Instructions";
import FetchAndVal from "./pages/FetchAndVal";
import Mint from "./pages/Mint";
import Minting from "./pages/Minting";
import FetchAndVal2 from "./pages/FetchAndVal2";
import MyNFT from "./pages/MyNFT";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/oldP" element={<OldPage />} />
        <Route path="/fetchAndVal" element={<FetchAndVal />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/minting" element={<Minting />} />
        <Route path="/fetchAndVal2" element={<FetchAndVal2 />} />
        <Route path="/mynft" element={<MyNFT />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;