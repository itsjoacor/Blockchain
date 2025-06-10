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
    if (!url) return "";
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
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }
  }, []);

  return (
    <div className="min-h-screen bg-blue-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎨 NFTs minteados por tu wallet</h1>

      {!wallet ? (
        <button onClick={connectWallet} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">
          🔌 Conectar Wallet
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-sm">Wallet conectada: {wallet}</p>
          <p className="text-sm">Contrato: {CONTRACT_ADDRESS}</p>
          <button onClick={fetchMintedNFTs} className="bg-blue-600 mt-2 px-4 py-2 rounded hover:bg-blue-700">
            📥 Ver NFTs minteados
          </button>
        </div>
      )}

      {loading && <p className="mt-4 text-gray-300">⏳ Cargando NFTs...</p>}

      {mintedNFTs.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border border-gray-700 text-sm text-white">
            <thead className="bg-indigo-800">
              <tr>
                <th className="border px-3 py-2">Token ID</th>
                <th className="border px-3 py-2">Título</th>
                <th className="border px-3 py-2">Descripción</th>
                <th className="border px-3 py-2">Nombre</th>
                <th className="border px-3 py-2">Fecha</th>
                <th className="border px-3 py-2">Minted From</th>
                <th className="border px-3 py-2">Minted To</th>
                <th className="border px-3 py-2">Operator</th>
              </tr>
            </thead>
            <tbody>
              {mintedNFTs.map((nft) => (
                <tr key={nft.tokenId} className="bg-gray-900 hover:bg-gray-800">
                  <td className="border px-3 py-2">{nft.tokenId}</td>
                  <td className="border px-3 py-2">{nft.titulo}</td>
                  <td className="border px-3 py-2">{nft.descripcion}</td>
                  <td className="border px-3 py-2">{nft.nombre}</td>
                  <td className="border px-3 py-2">{nft.fecha}</td>
                  <td className="border px-3 py-2">{nft.mintedFrom}</td>
                  <td className="border px-3 py-2">{nft.mintedTo}</td>
                  <td className="border px-3 py-2">{nft.operator}</td>
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
