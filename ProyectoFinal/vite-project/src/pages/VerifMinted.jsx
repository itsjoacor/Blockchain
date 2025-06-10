import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
const ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "function getMetadata(uint256 tokenId) view returns (string titulo, string descripcion, string nombre, string fecha, string imageUrl)"
];

export default function MintedByWallet() {
  const [wallet, setWallet] = useState(null);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-blue-950 text-white p-6 relative">
      {/* Botones arriba a la derecha */}
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

      <h1 className="text-3xl font-bold mb-4">🎨 NFTs Minteados por tu Wallet</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          🔌 Conectar Wallet
        </button>
      ) : (
        <div>
          <p className="mb-2 text-sm">Wallet: {wallet}</p>
          <button
            onClick={fetchMintedNFTs}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            📦 Ver NFTs Minteados
          </button>
        </div>
      )}

      {loading && <p className="mt-4">⏳ Cargando NFTs...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {mintedNFTs.map((nft) => {
          const isAfterJune9 =
            new Date(nft.fecha).getTime() >= new Date("2025-06-09").getTime();
          const cardColor = isAfterJune9
            ? "bg-green-900 border-green-700"
            : "bg-red-900 border-red-700";

          return (
            <div
              key={nft.tokenId}
              className={`${cardColor} rounded-lg shadow p-3 border text-sm`}
            >
              <img
                src={nft.imageUrl}
                alt={nft.titulo || `NFT ${nft.tokenId}`}
                className="w-full max-h-[300px] object-contain mb-3 rounded bg-white p-2"
                onError={(e) => {
                  e.target.src = "https://placehold.co/300x300?text=Error+Imagen";
                }}
              />
              <h2 className="text-lg font-bold mb-1">{nft.titulo || `NFT ${nft.tokenId}`}</h2>
              <p><strong>📄 Descripción:</strong> {nft.descripcion}</p>
              <p><strong>🧾 Nombre:</strong> {nft.nombre}</p>
              <p><strong>📅 Fecha:</strong> {nft.fecha}</p>
              <p><strong>🆔 Token ID:</strong> {nft.tokenId}</p>
              <p><strong>↩️ Minted From:</strong> {nft.mintedFrom}</p>
              <p><strong>➡️ Minted To:</strong> {nft.mintedTo}</p>
              <p><strong>👤 Operator:</strong> {nft.operator}</p>
            </div>
          );
        })}
      </div>

      {!loading && mintedNFTs.length === 0 && wallet && (
        <p className="mt-6 text-gray-400">No se encontraron NFTs minteados por esta wallet.</p>
      )}
    </div>
  );
}
