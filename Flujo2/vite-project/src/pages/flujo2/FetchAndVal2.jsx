import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
const ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "function getMetadata(uint256 tokenId) view returns (string titulo, string descripcion, string nombre, string fecha, string imageUrl)"
];

export default function MintedByWallet() {
  const [wallet, setWallet] = useState(null);
  const [attemptedLoad, setAttemptedLoad] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Instala MetaMask primero");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) {
      console.error("Error al conectar wallet", err);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return "https://placehold.co/300x300?text=Sin+Imagen";
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

      const filter = contract.filters.TransferSingle(null, ethers.constants.AddressZero, wallet);
      const events = await contract.queryFilter(filter, 0, "latest");

      const seen = new Set();
      const results = [];

      for (const event of events) {
        const tokenId = event.args.id.toNumber();
        if (seen.has(tokenId)) continue;
        seen.add(tokenId);

        try {
          const metadata = await contract.getMetadata(tokenId);
          results.push({
            tokenId,
            titulo: metadata.titulo,
            descripcion: metadata.descripcion,
            nombre: metadata.nombre,
            fecha: metadata.fecha,
            imageUrl: resolveImageUrl(metadata.imageUrl),
            mintedTo: event.args.to,
            mintedFrom: event.args.from,
            operator: event.args.operator
          });
        } catch (e) {
          console.warn(`No se pudo obtener metadata para el token ${tokenId}`);
        }
      }

      setMintedNFTs(results);
    } catch (err) {
      console.error("Error al obtener NFTs:", err);
    } finally {
      setLoading(false);
      setAttemptedLoad(true);
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 text-gray-800 p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-600 drop-shadow-md">
        🎨 NFTs Minteados a tu wallet del flujo 1
      </h1>

      {!wallet ? (
        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl text-white font-semibold shadow-md"
          >
            🔌 Conectar Wallet
          </button>
        </div>
      ) : (
        <div className="text-center space-y-2 mb-6">
          <p className="text-sm text-gray-600">👛 Wallet: {wallet}</p>
          <p className="text-sm text-gray-600">📜 Contrato: {CONTRACT_ADDRESS}</p>
          <button
            onClick={fetchMintedNFTs}
            className="mt-2 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-xl text-white font-semibold shadow"
          >
            📥 Ver NFTs minteados
          </button>
        </div>
      )}

      {loading && <p className="mt-6 text-center text-gray-500">⏳ Cargando NFTs...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {mintedNFTs.map((nft) => (
          <div
            key={nft.tokenId}
            className="bg-white rounded-2xl shadow-lg p-4 border border-indigo-200 flex flex-col items-center text-center"
          >
            <img
              src={nft.imageUrl}
              alt={`NFT ${nft.tokenId}`}
              className="w-40 h-40 object-contain mb-3 rounded border"
              onError={(e) => {
                e.target.src = "https://placehold.co/300x300?text=Error+Imagen";
              }}
            />
            <h2 className="text-lg font-bold text-indigo-600 mb-2">{nft.titulo}</h2>
            <p className="text-sm text-gray-700">🧾 {nft.nombre}</p>
            <p className="text-sm text-gray-700">📄 {nft.descripcion}</p>
            <p className="text-sm text-gray-600">📅 {nft.fecha}</p>
            <p className="text-xs text-gray-400 mt-2">🆔 Token ID: {nft.tokenId}</p>
          </div>
        ))}
      </div>

      {attemptedLoad && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/mint2")}
            className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-white font-semibold shadow-lg"
          >
            ✨ Mintear
          </button>
        </div>
      )}

      {!loading && mintedNFTs.length === 0 && attemptedLoad && (
        <p className="mt-8 text-center text-gray-500">No se encontraron NFTs minteados por esta wallet.</p>
      )}
    </div>
  );
}
