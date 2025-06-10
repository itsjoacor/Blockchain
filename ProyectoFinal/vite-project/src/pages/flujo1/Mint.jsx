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
    if (!window.ethereum) return setError("Instala MetaMask");

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold text-center w-full">🎨 Crear NFT (ERC-1155)</h1>
        <div className="flex gap-2 absolute right-6 top-6">
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
          >
            🔍 Ver contrato en Etherscan
          </a>
          <a
            href={`https://github.com/itsjoacor/nft-image/blob/main/README.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            🧩 Ver contrato en Github
          </a>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-w-3xl mx-auto text-sm">
        {wallet ? (
          <p className="text-green-400 mb-2">💳 Wallet conectada: <span className="text-white">{wallet}</span></p>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mb-2"
          >
            🔌 Conectar Wallet
          </button>
        )}
        <p className="mb-1">📦 Contrato: <span className="text-blue-400">{CONTRACT_ADDRESS}</span></p>
        <p className="mb-1">👤 Address Dani: <span className="text-blue-300">{ADDRESS_DANIEL}</span></p>
        <p className="mb-1">👤 Address Pablo: <span className="text-blue-300">{ADDRESS_PABLO}</span></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-100 rounded max-w-2xl mx-auto">{error}</div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-xl mx-auto">
        <label className="block mb-2">Título *</label>
        <input
          name="titulo"
          value={nftData.titulo}
          onChange={handleInputChange}
          className="w-full bg-gray-700 p-2 rounded mb-4"
        />
        <label className="block mb-2">Descripción *</label>
        <textarea
          name="description"
          value={nftData.description}
          onChange={handleInputChange}
          className="w-full bg-gray-700 p-2 rounded mb-4"
        />
        <label className="block mb-2">Nombre</label>
        <input
          name="nombre"
          value={nftData.nombre}
          onChange={handleInputChange}
          className="w-full bg-gray-700 p-2 rounded mb-4"
        />
        <label className="block mb-2">Fecha</label>
        <input
          type="date"
          name="fecha"
          value={nftData.fecha}
          onChange={handleInputChange}
          className="w-full bg-gray-700 p-2 rounded"
        />
      </div>
      {/* Botón de mint centrado */}
      {wallet && (
        <div className="flex justify-center">
          <button
            onClick={mintNFT}
            disabled={isMinting}
            className={`mt-4 px-6 py-3 rounded text-white ${isMinting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isMinting ? "⏳ Minteando..." : "🛠️ Crear NFT"}
          </button>
        </div>
      )}

      {/* Botón para redirigir a ver minteados */}
      {mintedAll && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/minted")}
            className="mt-4 px-6 py-3 rounded text-white bg-purple-600 hover:bg-purple-700"
          >
            ✅ Ver NFTs minteados
          </button>
        </div>
      )}

    </div>
  );
};

export default Mint2;
