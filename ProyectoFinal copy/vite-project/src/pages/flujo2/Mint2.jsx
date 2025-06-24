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
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 text-gray-800 p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-600 drop-shadow-md">
        🛠️ Crear NFT condicional
      </h1>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        {!wallet ? (
          <div className="flex justify-center">
            <button onClick={connectWallet} className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl text-white font-semibold shadow">
              🔌 Conectar Wallet
            </button>
          </div>
        ) : (
          <div className="text-sm space-y-4">
            <p className="text-green-600 font-medium">💳 Wallet conectada: <span className="text-gray-700">{wallet}</span></p>
            <div className="space-y-2">
              <p className="text-indigo-500 font-semibold">📜 Contratos disponibles para verificación:</p>
              {[CONTRACT_ADDRESS_F1, CONTRACT_ADDRESS_F2].map((addr, i) => (
                <div key={i} className="flex items-center justify-between bg-indigo-100 px-4 py-2 rounded-lg">
                  <span className="text-sm truncate">{`Contrato Flujo ${i + 1}: ${addr}`}</span>
                  <button onClick={() => copyToClipboard(addr)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1 rounded">
                    📋 Copiar
                  </button>
                </div>
              ))}
              {copied && <p className="text-green-500 text-sm mt-1">✅ Copiado: {copied}</p>}
            </div>
            <p className="text-sm text-gray-600 mt-2">📦 Contrato de minteo: <span className="text-indigo-500 font-medium">{CONTRACT_ADDRESS_F2}</span></p>
            <p className="text-sm text-gray-600">👤 Mint a: <span className="text-indigo-500 font-medium">{DESTINO}</span></p>
          </div>
        )}
      </div>

      {error && <div className="mt-6 max-w-xl mx-auto bg-red-100 border border-red-300 text-red-800 rounded p-4 text-sm">{error}</div>}

      <div className="mt-8 max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Título *</label>
          <input name="titulo" value={nftData.titulo} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Descripción *</label>
          <textarea name="description" value={nftData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input name="nombre" value={nftData.nombre} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Fecha</label>
          <input type="date" name="fecha" value={nftData.fecha} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Contrato a verificar *</label>
          <input value={verifContract} onChange={(e) => setVerifContract(e.target.value)} placeholder="0x..." className="w-full border border-gray-300 rounded p-2 text-sm" />
        </div>
      </div>

      {wallet && (
        <div className="flex justify-center mt-6">
          <button onClick={mintNFT} disabled={isMinting} className={`px-6 py-3 rounded-xl text-white font-semibold shadow ${isMinting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}>
            {isMinting ? "⏳ Minteando..." : "✨ Crear NFT"}
          </button>
        </div>
      )}

      {minted && (
        <div className="flex justify-center mt-4">
          <button onClick={() => navigate("/isMinted2")} className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl text-white font-semibold shadow">
            ✅ Ver NFTs minteados
          </button>
        </div>
      )}
    </div>
  );
}
