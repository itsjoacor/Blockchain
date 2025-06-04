import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleOld = () => {
    navigate("/oldP"); // Ruta hacia el flujo principal (Flow 1)
  };

  const handleInstructions = () => {
    navigate("/instructions"); // Ruta hacia la página de instrucciones
  };

  const handleFetchAndVal = () => {
    navigate("/fetchAndVal")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white">
      <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-blue-400 drop-shadow-lg animate-pulse">
        🚀 Blockchain Project
      </h1>
      <p className="mt-6 text-xl text-gray-300 max-w-2xl">
        En construcción... Una experiencia descentralizada, segura y del futuro
        está por llegar.
      </p>

      <div className="mt-12 border border-blue-500 rounded-xl px-6 py-6 shadow-lg hover:scale-105 transition-transform space-y-4">
        <button
          onClick={handleOld}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          🚀 Checkout the beggininn
        </button>
        <button
          onClick={handleFetchAndVal}
          className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded"
        >
          🚀 Start!
        </button>
        <button
          onClick={handleInstructions}
          className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded"
        >
          ❓ Tengo dudas
        </button>
      </div>
    </div>
  );
};

export default Home;
