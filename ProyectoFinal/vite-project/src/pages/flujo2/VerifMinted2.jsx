// ✅ Modern minimalist restyling applied with Tailwind
// ⚠️ Logic, addresses and core functionality remain untouched
// 🔄 Unified design system for great UX/UI

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto relative">
        <div className="absolute right-4 top-4 flex gap-2">
          <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 border border-white/20 px-3 py-1 rounded hover:bg-white/20 transition text-sm">
            🔍 Ver contrato
          </a>
          <a href="https://github.com/itsjoacor/Contract2/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="bg-white/10 border border-white/20 px-3 py-1 rounded hover:bg-white/20 transition text-sm">
            📄 Github
          </a>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8">📋 NFTs minteados</h1>

        {!wallet ? (
          <div className="text-center">
            <button onClick={connectWallet} className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded text-white font-semibold transition">
              🔌 Conectar Wallet
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <p className="text-sm">💳 Wallet: <span className="text-green-400 font-mono">{wallet}</span></p>
            <p className="text-sm">📦 Contrato: {CONTRACT_ADDRESS}</p>
            <button onClick={fetchMintedNFTs} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition">
              📥 Ver NFTs
            </button>
          </div>
        )}

        {loading && <p className="text-center mt-6 text-gray-300">⏳ Cargando NFTs...</p>}

        {!loading && (
          <div className="overflow-x-auto mt-8">
            <table className="w-full text-sm text-left border border-zinc-700 rounded overflow-hidden">
              <thead className="bg-zinc-800 text-white">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Títul</th>
                  <th className="px-4 py-2 border">Descripción</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Fecha</th>
                  <th className="px-4 py-2 border">Imagen</th>
                </tr>
              </thead>
              <tbody>
                {mintedNFTs.map((nft) => {
                  const [day, month, year] = nft.fecha.split("/").map(Number);
                  const mintedDate = new Date(year, month - 1, day);
                  const cutoffDate = new Date(2025, 5, 24);
                  const isValid = mintedDate >= cutoffDate;
                  const rowColor = isValid ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700";

                  return (
                    <tr key={nft.tokenId} className={`hover:bg-zinc-700 ${rowColor}`}>
                      <td className="px-4 py-2 border font-mono">{nft.tokenId}</td>
                      <td className="px-4 py-2 border">{nft.titulo}</td>
                      <td className="px-4 py-2 border">{nft.descripcion}</td>
                      <td className="px-4 py-2 border">{nft.nombre}</td>
                      <td className="px-4 py-2 border">{nft.fecha}</td>
                      <td className="px-4 py-2 border">
                        <img
                          src={nft.imageUrl}
                          alt={nft.titulo}
                          className="w-20 h-20 object-contain bg-white rounded mx-auto"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100?text=Imagen";
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && mintedNFTs.length === 0 && wallet && (
              <p className="mt-6 text-center text-gray-400">No se encontraron NFTs minteados por esta wallet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
