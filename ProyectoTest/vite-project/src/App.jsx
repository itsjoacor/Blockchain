import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomeOld";
import HomeNew from "./pages/HomeNew";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/1" element={<HomeNew />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
