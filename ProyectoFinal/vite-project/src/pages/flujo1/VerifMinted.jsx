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
      const filter = contract.filters.TransferSingle(wallet);
      const events = await contract.queryFilter(filter, 0, "latest");

      const tokenIds = new Set();
      const nftData = [];

      for (const event of events) {
        if (event.args.from === ethers.constants.AddressZero) {
          const tokenId = event.args.id.toNumber();
          tokenIds.add(tokenId);

          try {
            const metadata = await contract.getMetadata(tokenId);
            nftData.push({
              tokenId,
              titulo: metadata.titulo,
              descripcion: metadata.descripcion,
              nombre: metadata.nombre,
              fecha: metadata.fecha,
              imageUrl: resolveImageUrl(metadata.imageUrl),
              mintedTo: event.args.to,
              mintedFrom: event.args.from,
              operator: event.args.operator,
            });
          } catch (err) {
            console.warn(`Metadata missing for token ${tokenId}`, err);
          }
        }
      }

      setMintedNFTs(nftData);
    } catch (err) {
      console.error("Error fetching minted NFTs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlow2 = () => {
    navigate("/2");
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 text-gray-800 p-6 relative">
      {/* Botones arriba a la derecha */}
      <div className="flex gap-2 absolute right-6 top-6">
        <a
          href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
        >
          🔍 Etherscan
        </a>
        <a
          href="https://github.com/itsjoacor/nft-image/blob/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          🧩 Github
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">🎨 Verificar si fueron minteados los NFTs</h1>

      {!wallet ? (
        <div className="flex justify-center">
          <button
            onClick={connectWallet}
            className="bg-emerald-400 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded shadow"
          >
            🔌 Conectar Wallet
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600">Wallet: {wallet}</p>
          <button
            onClick={fetchMintedNFTs}
            className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded shadow"
          >
            📦 Ver NFTs
          </button>
        </div>
      )}

      {loading && (
        <p className="mt-6 text-center text-indigo-500">⏳ Cargando NFTs...</p>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mintedNFTs.map((nft) => {
          const isAfterJune9 = new Date(nft.fecha).getTime() >= new Date("2025-06-09").getTime();
          const cardColor = isAfterJune9
            ? "border-green-300 bg-green-100"
            : "border-red-300 bg-red-100";

          return (
            <div
              key={nft.tokenId}
              className={`${cardColor} border rounded-xl shadow-md p-4 text-sm`}
            >
              <img
                src={nft.imageUrl}
                alt={nft.titulo || `NFT ${nft.tokenId}`}
                className="w-full h-40 object-contain rounded mb-3 bg-white p-2"
              />
              <h2 className="text-lg font-bold text-indigo-600">{nft.titulo || `NFT ${nft.tokenId}`}</h2>
              <p><strong>📄 Descripción:</strong> {nft.descripcion}</p>
              <p><strong>🧾 Nombre:</strong> {nft.nombre}</p>
              <p><strong>📅 Fecha:</strong> {nft.fecha}</p>
              <p><strong>🆔 Token ID:</strong> {nft.tokenId}</p>
              <p><strong>↩️ From:</strong> {nft.mintedFrom}</p>
              <p><strong>➡️ To:</strong> {nft.mintedTo}</p>
              <p><strong>👤 Operator:</strong> {nft.operator}</p>
            </div>
          );
        })}
      </div>

      {mintedNFTs.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleFlow2}
            className="bg-purple-500 hover:bg-purple-600 transition px-6 py-3 rounded text-white font-semibold shadow"
          >
            ✅ Comenzar flujo 2
          </button>
        </div>
      )}

      {!loading && mintedNFTs.length === 0 && wallet && (
        <p className="mt-8 text-center text-gray-500 italic">
          No se encontraron NFTs minteados por esta wallet.
        </p>
      )}
    </div>
  );
}
