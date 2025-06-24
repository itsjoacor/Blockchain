import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleInstructions = () => {
    navigate("/instructions");
  };

  const handleFetchAndVal = () => {
    navigate("/fetchAndVal");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-pink-100 via-indigo-100 to-cyan-100 text-gray-800 transition-all">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest text-indigo-600 drop-shadow-md animate-pulse mb-4">
        🚀 Blockchain Project
      </h1>

      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-12">
        Una experiencia descentralizada, segura y futurista 🌐<br />
        Validá la promoción de tus alumnos con un solo clic.
      </p>

      <div className="bg-white/70 border border-indigo-200 backdrop-blur-lg rounded-xl px-8 py-6 shadow-xl space-y-5 transition-all hover:scale-105">
        <button
          onClick={handleFetchAndVal}
          className="block w-full bg-gradient-to-r from-cyan-400 to-indigo-400 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-cyan-500 hover:to-indigo-500 transition-colors"
        >
          🚀 Comenzar
        </button>
        <button
          onClick={handleInstructions}
          className="block w-full bg-pink-300 hover:bg-pink-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
        >
          ❓ Tengo dudas
        </button>
      </div>
    </div>
  );
};

export default Home;
