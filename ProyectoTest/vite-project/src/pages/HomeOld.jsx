import React, { useState } from "react";

// 🔑 Alchemy Sepolia endpoint con tu API key
const ALCHEMY_BASE_URL = `https://eth-sepolia.g.alchemy.com/v2/TTecTP8-drgMcfnoeoO6PH1YwI48YWI5`;

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

  const fetchNFTs = async () => {
    if (!wallet) return alert("Conectá la wallet primero");

    setLoading(true);

    const url = `${ALCHEMY_BASE_URL}/getNFTsForOwner?owner=${wallet}&withMetadata=true&pageSize=100`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("🎨 NFTs en Sepolia:", data);
      setNfts(data.ownedNfts || []);
    } catch (err) {
      console.error("❌ Error al obtener NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6">🖼️ NFTs en Sepolia</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-green-500 text-white px-4 py-2 rounded shadow"
        >
          🔌 Conectar Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4 text-sm text-gray-700">
            🔐 Wallet conectada: {wallet}
          </p>

          <button
            onClick={fetchNFTs}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            📥 Ver NFTs
          </button>

          {loading && <p className="mt-4">Cargando NFTs desde Sepolia...</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {nfts.map((nft, idx) => {
              const tokenClassHex = nft.id.tokenId;
              const tokenClassDecimal = parseInt(tokenClassHex, 16);

              return (
                <div
                  key={idx}
                  className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-lg flex flex-col items-center"
                >
                  <p className="text-sm text-blue-600 font-bold mb-2">
                    Clase: {tokenClassDecimal}
                  </p>
                  <img
                    src={
                      nft.media?.[0]?.gateway ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={nft.title || "NFT"}
                    className="w-full h-60 object-contain rounded"
                  />
                  <p className="mt-4 text-base font-semibold text-center">
                    {nft.title || "NFT sin título"}
                  </p>
                </div>
              );
            })}
          </div>

          {!loading && nfts.length === 0 && (
            <p className="mt-6 text-gray-500">No se encontraron NFTs en Sepolia.</p>
          )}
        </div>
      )}
    </div>
  );
}
