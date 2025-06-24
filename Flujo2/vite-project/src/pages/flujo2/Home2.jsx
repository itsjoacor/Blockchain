import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleInstructions = () => {
    navigate("/instructions2");
  };

  const handleFetchAndVal = () => {
    navigate("/fetchAndVal2");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-pink-100 via-white to-blue-100 text-gray-800">
      <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-indigo-600 drop-shadow-lg mb-4">
        🚀 Blockchain Project
      </h1>

      <p className="mt-2 text-xl text-gray-600 max-w-2xl">
        ...Comencemos con la promoción...
      </p>

      <div className="mt-12 border border-indigo-300 rounded-2xl px-8 py-8 shadow-xl hover:scale-105 transition-transform bg-white space-y-4">
        <button
          onClick={handleFetchAndVal}
          className="block w-full bg-emerald-400 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition"
        >
          🚀 Comenzar
        </button>
        <button
          onClick={handleInstructions}
          className="block w-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition"
        >
          ❓ Tengo dudas
        </button>
      </div>
    </div>
  );
};

export default Home;
