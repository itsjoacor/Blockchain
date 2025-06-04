import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Mint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = location.state?.wallet;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">🎨 Minteo de NFT ERC-1155</h1>

      <p className="mb-4 text-gray-300">
        Bienvenido al proceso de creación de tu NFT exclusivo. A continuación,
        se detallan los pasos que se llevarán a cabo:
      </p>

      <ul className="list-disc list-inside mb-6 text-gray-200 space-y-2">
        <li>
          📦 Se generará un NFT bajo el estándar ERC-1155, asociado a tu wallet.
        </li>
        <li>
          🔐 La emisión se realizará de forma segura y transparente en la red
          Sepolia.
        </li>
        <li>
          🖼️ El NFT contendrá metadatos personalizados que reflejan tu
          participación.
        </li>
      </ul>

      <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <p className="text-sm text-gray-400">Wallet seleccionada:</p>
        <p className="text-green-400 font-mono">{wallet || "No conectada"}</p>
      </div>

      <button
        onClick={() => navigate("/minting")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow"
      >
        🚀 Crear NFT
      </button>
    </div>
  );
};

export default Mint;
