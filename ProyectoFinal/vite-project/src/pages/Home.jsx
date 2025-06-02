import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import NavbarAdmin from "../components/NavbarAdmin";
import { useNavigate } from "react-router-dom";
import fondoHome from "../assets/fondos/fondoHome.jpg";
import EstadoTag from "../components/EstadoTag";
import Info from "../components/Info";
import Warning from "../components/Warning";
import axios from "axios";

const Home = () => {


  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-blue-400 drop-shadow-lg animate-pulse">
        🚀 Blockchain Project
      </h1>
      <p className="mt-6 text-xl text-gray-300 max-w-2xl">
        En construcción... Una experiencia descentralizada, segura y del futuro está por llegar.
      </p>
      <div className="mt-12 border border-blue-500 rounded-xl px-6 py-3 animate-bounce shadow-lg hover:scale-105 transition-transform">
        <span className="text-blue-300 font-medium tracking-wide">#Web3 #DeFi #Crypto</span>
      </div>
    </div>
  );
};

export default Home;
