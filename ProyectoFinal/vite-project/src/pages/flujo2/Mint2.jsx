import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const DESTINO = "0xb3e143114D4de641A66C7df96B358E7944090628";
const CONTRACT_ADDRESS_F1 = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
const CONTRACT_ADDRESS_F2 = "0x020a378a2eb76772A07a841A22f7526bcA781147";
const FIXED_IMAGE_URL = "https://raw.githubusercontent.com/itsjoacor/Contract2/main/JRP.png";

const ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "address", name: "contratoVerificacion", type: "address" },
      { internalType: "string", name: "titulo", type: "string" },
      { internalType: "string", name: "descripcion", type: "string" },
      { internalType: "string", name: "nombre", type: "string" },
      { internalType: "string", name: "fecha", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
    ],
    name: "mintConMetadataCondicional",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function Mint2() {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState("");
  const [nftData, setNftData] = useState({
    titulo: "",
    description: "",
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [verifContract, setVerifContract] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState("");
  const [minted, setMinted] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setVerifContract(text);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("Error al copiar", err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return setError("Instalá MetaMask");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      setWallet(accounts[0]);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al conectar wallet: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData((prev) => ({ ...prev, [name]: value }));
  };

  const mintNFT = async () => {
    if (!wallet) return setError("Conectá tu wallet");
    if (!nftData.titulo || !nftData.description || !verifContract) {
      return setError("Completá todos los campos obligatorios");
    }

    setIsMinting(true);
    setError("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS_F2, ABI, signer);

      const tx = await contract.mintConMetadataCondicional(
        DESTINO,
        verifContract,
        nftData.titulo,
        nftData.description,
        nftData.nombre,
        nftData.fecha,
        FIXED_IMAGE_URL,
        { gasLimit: 500000 }
      );

      await tx.wait();
      alert("✅ NFT minteado exitosamente");
      setMinted(true);
    } catch (err) {
      console.error(err);

      const isCallException = err?.code === "CALL_EXCEPTION";
      const noLogs = err?.receipt?.logs?.length === 0;
      const txFailed = err?.receipt?.status === 0;

      if (isCallException && noLogs && txFailed) {
        setError("❌ No cumple con la condición de promoción");
      } else {
        setError("❌ Error al mintear: " + (err.reason || err.message));
      }
    }


  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6">🎨 Crear NFT Condicional</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6 max-w-3xl mx-auto text-sm">
        {wallet ? (
          <>
            <p className="text-green-400 mb-2">💳 Wallet conectada: <span className="text-white">{wallet}</span></p>
            <div className="mb-3">
              <p className="text-blue-300 font-semibold">📜 Contratos disponibles para verificación:</p>
              <div className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded mt-2">
                <span className="truncate text-sm">Contrato Flujo 1: {CONTRACT_ADDRESS_F1}</span>
                <button className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-xs rounded" onClick={() => copyToClipboard(CONTRACT_ADDRESS_F1)}>
                  📋 Copiar
                </button>
              </div>
              <div className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded mt-2">
                <span className="truncate text-sm">Contrato Flujo 2: {CONTRACT_ADDRESS_F2}</span>
                <button className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 text-xs rounded" onClick={() => copyToClipboard(CONTRACT_ADDRESS_F2)}>
                  📋 Copiar
                </button>
              </div>
              {copied && (
                <div className="text-green-400 mt-2 text-sm">
                  ✅ Dirección copiada: <span className="text-white">{copied}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mb-2">
            🔌 Conectar Wallet
          </button>
        )}
        <p className="mb-1">📦 Contrato de minteo: <span className="text-blue-400">{CONTRACT_ADDRESS_F2}</span></p>
        <p className="mb-1">👤 Mint a: <span className="text-blue-300">{DESTINO}</span></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-100 rounded max-w-2xl mx-auto">{error}</div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg mb-6 max-w-xl mx-auto">
        <label className="block mb-2">Título *</label>
        <input name="titulo" value={nftData.titulo} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded mb-4" />

        <label className="block mb-2">Descripción *</label>
        <textarea name="description" value={nftData.description} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded mb-4" />

        <label className="block mb-2">Nombre</label>
        <input name="nombre" value={nftData.nombre} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded mb-4" />

        <label className="block mb-2">Fecha</label>
        <input type="date" name="fecha" value={nftData.fecha} onChange={handleInputChange} className="w-full bg-gray-700 p-2 rounded mb-4" />

        <label className="block mb-2">Contrato a verificar *</label>
        <input value={verifContract} onChange={(e) => setVerifContract(e.target.value)} placeholder="0x..." className="w-full bg-gray-700 p-2 rounded mb-4" />
      </div>

      {wallet && (
        <div className="flex justify-center">
          <button onClick={mintNFT} disabled={isMinting} className={`mt-4 px-6 py-3 rounded text-white ${isMinting ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"}`}>
            {isMinting ? "⏳ Minteando..." : "🛠️ Crear NFT"}
          </button>
        </div>
      )}

      {minted && (
        <div className="flex justify-center">
          <button onClick={() => navigate("/isMinted2")} className="mt-4 px-6 py-3 rounded text-white bg-purple-600 hover:bg-purple-700">
            ✅ Ver NFTs minteados
          </button>
        </div>
      )}
    </div>
  );
}