import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x020a378a2eb76772A07a841A22f7526bcA781147";
const ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "function getMetadata(uint256 tokenId) view returns (string titulo, string descripcion, string nombre, string fecha, string imageUrl)"
];

export default function NFTsMinteadosPorMiWallet() {
  const [wallet, setWallet] = useState(null);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Por favor, instalá MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) {
      console.error("Error al conectar wallet:", err);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return "https://placehold.co/100x100?text=Sin+Imagen";
    if (url.startsWith("ipfs://")) {
      const hash = url.replace("ipfs://", "");
      return `https://nftstorage.link/ipfs/${hash}`;
    }
    return url;
  };

  const fetchMintedNFTs = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const transferEvents = await contract.queryFilter(
        contract.filters.TransferSingle(null, null, wallet),
        0,
        "latest"
      );

      const balances = new Map();
      for (const event of transferEvents) {
        const tokenId = event.args.id.toNumber();
        const value = event.args.value.toNumber();
        balances.set(tokenId, (balances.get(tokenId) || 0) + value);
      }

      const results = [];
      for (const [tokenId, balance] of balances.entries()) {
        if (balance > 0) {
          try {
            const metadata = await contract.getMetadata(tokenId);
            results.push({
              tokenId,
              titulo: metadata.titulo,
              descripcion: metadata.descripcion,
              nombre: metadata.nombre,
              fecha: metadata.fecha,
              imageUrl: resolveImageUrl(metadata.imageUrl),
            });
          } catch (e) {
            console.warn(`No se pudo obtener metadata para el token ${tokenId}`);
          }
        }
      }
      setMintedNFTs(results);
    } catch (err) {
      console.error("Error al obtener NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 text-gray-800 p-6">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-end mb-4 space-x-2">
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium px-4 py-2 rounded-lg border border-indigo-300 transition"
          >
            🔍 Ver contrato
          </a>
          <a
            href="https://github.com/itsjoacor/Contract2/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium px-4 py-2 rounded-lg border border-indigo-300 transition"
          >
            📄 GitHub
          </a>
        </div>


        <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-600 drop-shadow-md">
          📋 NFTs minteados por tu wallet
        </h1>

        {!wallet ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl text-white font-semibold shadow"
            >
              🔌 Conectar Wallet
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center space-y-2">
            <p className="text-sm text-gray-700">💳 Wallet: <span className="text-green-600 font-mono">{wallet}</span></p>
            <p className="text-sm text-gray-700">📦 Contrato: <span className="text-indigo-600 font-mono">{CONTRACT_ADDRESS}</span></p>
            <button
              onClick={fetchMintedNFTs}
              className="mt-4 bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold text-white transition"
            >
              📥 Ver NFTs
            </button>
          </div>
        )}

        {loading && <p className="text-center mt-6 text-gray-500">⏳ Cargando NFTs...</p>}

        {!loading && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mintedNFTs.map((nft) => {
              const [day, month, year] = nft.fecha.split("/").map(Number);
              const mintedDate = new Date(year, month - 1, day);
              const cutoffDate = new Date(2025, 5, 24);
              const isValid = mintedDate >= cutoffDate;
              const cardColor = isValid ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50";

              return (
                <div key={nft.tokenId} className={`border rounded-xl p-4 shadow ${cardColor}`}>
                  <img
                    src={nft.imageUrl}
                    alt={nft.titulo}
                    className="w-full h-40 object-contain rounded mb-4 bg-white"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100?text=Imagen";
                    }}
                  />
                  <h2 className="text-lg font-bold text-indigo-700 mb-1">{nft.titulo}</h2>
                  <p className="text-sm text-gray-700 mb-1">📝 {nft.descripcion}</p>
                  <p className="text-sm text-gray-700 mb-1">👤 {nft.nombre}</p>
                  <p className="text-sm text-gray-700 mb-1">📅 {nft.fecha}</p>
                  <p className={`text-xs font-semibold mt-2 ${isValid ? "text-green-600" : "text-red-600"}`}>
                    {isValid ? "✔️ Cumple con la condición" : "❌ No cumple con la condición"}
                  </p>
                </div>
              );
            })}

            {!loading && mintedNFTs.length === 0 && wallet && (
              <p className="col-span-full text-center text-gray-500">No se encontraron NFTs minteados por esta wallet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
