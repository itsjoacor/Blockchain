import React, { useState } from "react";
import { ethers } from "ethers";

const ERC1155_CONTRACT_ADDRESS = "0xTuContratoAca";
const ERC1155_ABI = [
  "function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[])",
  "function uri(uint256) view returns (string)",
];

const MAX_TOKEN_ID = 100; // Podés ajustar esto a un rango mayor si es necesario

export default function Home() {
  const [wallet, setWallet] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Instalá Metamask");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } catch (error) {
      console.error("❌ Error al conectar Metamask:", error);
    }
  };

  const fetchAllNFTs = async () => {
    if (!wallet) return alert("Conectá la wallet primero");

    setLoading(true);
    setNfts([]);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ERC1155_CONTRACT_ADDRESS, ERC1155_ABI, signer);

      const ids = Array.from({ length: MAX_TOKEN_ID }, (_, i) => i);
      const owners = ids.map(() => wallet);

      const balances = await contract.balanceOfBatch(owners, ids);
      const ownedNFTs = [];

      for (let i = 0; i < balances.length; i++) {
        const balance = balances[i].toString();
        if (balance !== "0") {
          const id = ids[i];

          const rawUri = await contract.uri(id);
          const tokenUri = rawUri.replace("{id}", id.toString(16).padStart(64, "0"));

          let metadata = {};
          try {
            const res = await fetch(tokenUri);
            metadata = await res.json();
          } catch {
            metadata = { name: `NFT ${id}`, image: "", error: true };
          }

          ownedNFTs.push({
            id,
            balance,
            title: metadata.name || `NFT ${id}`,
            image: metadata.image || "https://via.placeholder.com/300?text=No+Image",
          });
        }
      }

      setNfts(ownedNFTs);
    } catch (err) {
      console.error("❌ Error al obtener NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6">🖼️ Tus NFTs (ERC-1155)</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          🔌 Conectar Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4 text-sm text-gray-700">🔐 Wallet conectada: {wallet}</p>

          <button
            onClick={fetchAllNFTs}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            📥 Obtener NFTs
          </button>

          {loading && <p className="mt-4">🔄 Cargando NFTs desde contrato...</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {nfts.map((nft, idx) => (
              <div key={idx} className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow">
                <p className="text-sm font-bold text-blue-700">ID: {nft.id}</p>
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-full h-52 object-contain mt-2 rounded"
                />
                <p className="mt-2 text-center font-semibold">{nft.title}</p>
                <p className="text-sm text-gray-500">Cantidad: {nft.balance}</p>
              </div>
            ))}
          </div>

          {!loading && nfts.length === 0 && (
            <p className="mt-6 text-gray-500">No se encontraron NFTs.</p>
          )}
        </div>
      )}
    </div>
  );
}
