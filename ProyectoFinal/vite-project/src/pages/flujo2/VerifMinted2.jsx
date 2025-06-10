import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
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
            mintedFrom: event.args.from,
            mintedTo: event.args.to,
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
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-blue-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">📋 NFTs minteados por tu wallet</h1>

      {!wallet ? (
        <button onClick={connectWallet} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
          🔌 Conectar Wallet
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-sm">Wallet conectada: <span className="text-green-400">{wallet}</span></p>
          <p className="text-sm mb-2">Contrato: {CONTRACT_ADDRESS}</p>
          <button onClick={fetchMintedNFTs} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            📥 Ver NFTs minteados
          </button>
        </div>
      )}

      {loading && <p className="mt-4 text-gray-300">⏳ Cargando NFTs...</p>}

      {!loading && mintedNFTs.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto text-sm border border-gray-700">
            <thead className="bg-indigo-800 text-white">
              <tr>
                <th className="px-4 py-2 border">🆔 Token ID</th>
                <th className="px-4 py-2 border">Título</th>
                <th className="px-4 py-2 border">Descripción</th>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Fecha</th>
                <th className="px-4 py-2 border">Imagen</th>
                <th className="px-4 py-2 border">Minteado desde</th>
                <th className="px-4 py-2 border">Minteado hacia</th>
                <th className="px-4 py-2 border">Operator</th>
              </tr>
            </thead>
            <tbody>
              {mintedNFTs.map((nft) => (
                <tr key={nft.tokenId} className="bg-gray-800 hover:bg-gray-700">
                  <td className="px-4 py-2 border text-center">{nft.tokenId}</td>
                  <td className="px-4 py-2 border">{nft.titulo}</td>
                  <td className="px-4 py-2 border">{nft.descripcion}</td>
                  <td className="px-4 py-2 border">{nft.nombre}</td>
                  <td className="px-4 py-2 border">{nft.fecha}</td>
                  <td className="px-4 py-2 border text-center">
                    <img
                      src={nft.imageUrl}
                      alt={nft.titulo}
                      className="w-20 h-20 object-contain bg-white rounded mx-auto"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=Imagen";
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 border">{nft.mintedFrom}</td>
                  <td className="px-4 py-2 border">{nft.mintedTo}</td>
                  <td className="px-4 py-2 border">{nft.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && mintedNFTs.length === 0 && wallet && (
        <p className="mt-6 text-gray-400">No se encontraron NFTs minteados por esta wallet.</p>
      )}
    </div>
  );
}
