import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
const ADDRESS_DANIEL = "0x81Bce31CaB4F37DdC8561550Ee7eaa859ca50581";
const ADDRESS_PABLO = "0x96664195a728321F0F672B3BA29639eD727CE7a1";
const FIXED_IMAGE_URL = "https://raw.githubusercontent.com/itsjoacor/nft-image/main/ChatGPT%20Image%20Jun%209%2C%202025%2C%2011_13_20%20PM.png";

const ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "titulo", type: "string" },
      { internalType: "string", name: "descripcion", type: "string" },
      { internalType: "string", name: "nombre", type: "string" },
      { internalType: "string", name: "fecha", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
    ],
    name: "mintConMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Mint2 = () => {
  const [wallet, setWallet] = useState(null);
  const [nftData, setNftData] = useState({
    titulo: "",
    description: "",
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState("");
  const [mintedAll, setMintedAll] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return setError("Instalá MetaMask");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      setWallet(accounts[0]);
      setError("");
    } catch (err) {
      setError("Error al conectar wallet: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData((prev) => ({ ...prev, [name]: value }));
  };

  const mintNFT = async () => {
    if (!wallet) return setError("Conectá tu wallet primero");
    if (!nftData.titulo || !nftData.description) {
      return setError("Completá todos los campos obligatorios");
    }

    setIsMinting(true);
    setError("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const addresses = [ADDRESS_DANIEL, ADDRESS_PABLO];

      for (const address of addresses) {
        const tx = await contract.mintConMetadata(
          address,
          nftData.titulo,
          nftData.description,
          nftData.nombre,
          nftData.fecha,
          FIXED_IMAGE_URL,
          { gasLimit: 500000 }
        );
        await tx.wait();
      }

      alert("✅ NFTs minteados exitosamente para ambos destinatarios");
      setMintedAll(true);
    } catch (err) {
      console.error(err);
      setError("❌ Error al mintear: " + err.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-indigo-700 text-center w-full drop-shadow">
            🪄 Crear NFT con Metadata
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-indigo-200">
          {wallet ? (
            <p className="text-sm text-green-600 mb-3">
              ✅ Wallet conectada: <span className="font-mono">{wallet}</span>
            </p>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded font-semibold mb-4"
            >
              🔌 Conectar Wallet
            </button>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            <p>📦 Contrato: <span className="text-indigo-600">{CONTRACT_ADDRESS}</span></p>
            <p>👤 Address Dani: <span className="text-pink-600">{ADDRESS_DANIEL}</span></p>
            <p>👤 Address Pablo: <span className="text-pink-600">{ADDRESS_PABLO}</span></p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-200 mb-6">
          <label className="block mb-2 text-sm font-semibold">Título *</label>
          <input
            name="titulo"
            value={nftData.titulo}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border border-indigo-300 rounded"
          />
          <label className="block mb-2 text-sm font-semibold">Descripción *</label>
          <textarea
            name="description"
            value={nftData.description}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border border-indigo-300 rounded"
          />
          <label className="block mb-2 text-sm font-semibold">Nombre</label>
          <input
            name="nombre"
            value={nftData.nombre}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border border-indigo-300 rounded"
          />
          <label className="block mb-2 text-sm font-semibold">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={nftData.fecha}
            onChange={handleInputChange}
            className="w-full p-2 border border-indigo-300 rounded"
          />
        </div>

        {wallet && (
          <div className="text-center">
            <button
              onClick={mintNFT}
              disabled={isMinting}
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${isMinting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
                }`}
            >
              {isMinting ? "⏳ Minteando..." : "🚀 Mintear NFT"}
            </button>
          </div>
        )}

        {mintedAll && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/isMinted")}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded"
            >
              ✅ Ver NFTs minteados
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mint2;
