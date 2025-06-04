import React, { useState } from "react";
import { ethers } from "ethers";

const ERC1155_CONTRACT_ADDRESS = "0x1FEe62d24daA9fc0a18341B582937bE1D837F91d";

// ABI con balanceOf, uri y datosDeClases
const ERC1155_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "datosDeClases",
    outputs: [
      { internalType: "uint256", name: "clase", type: "uint256" },
      { internalType: "string", name: "tema", type: "string" },
      { internalType: "address", name: "alumno", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "uri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const MAX_TOKEN_ID = 100;

export default function Start() {
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        ERC1155_CONTRACT_ADDRESS,
        ERC1155_ABI,
        signer
      );

      const ownedNFTs = [];

      for (let id = 0; id < MAX_TOKEN_ID; id++) {
        const balance = await contract.balanceOf(wallet, id);

        if (balance && balance.toString() !== "0") {
          const rawUri = await contract.uri(id);
          const tokenUri = rawUri.replace(
            "{id}",
            id.toString(16).padStart(64, "0")
          );

          let metadata = {};
          try {
            const res = await fetch(tokenUri);
            metadata = await res.json();
          } catch {
            metadata = { name: `NFT ${id}`, image: "", error: true };
          }

          let clase = "-";
          let tema = "-";
          let alumno = wallet;

          try {
            const datos = await contract.datosDeClases(id);
            clase = datos.clase?.toString() || "-";
            tema = datos.tema || "-";
            alumno = datos.alumno || wallet;
          } catch (err) {
            console.warn(
              `⚠️ No se pudieron obtener los datos de clase para ID ${id}`,
              err
            );
          }

          ownedNFTs.push({
            id,
            balance: balance.toString(),
            title: metadata.name || `NFT ${id}`,
            image:
              metadata.image || "https://via.placeholder.com/300?text=No+Image",
            clase,
            tema,
            alumno,
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
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        🖼️ Tus NFTs (ERC-1155)
      </h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          🔌 Conectar Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4 text-sm text-gray-300">
            🔐 Wallet conectada: {wallet}
          </p>

          <button
            onClick={fetchAllNFTs}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            📥 Obtener NFTs
          </button>

          {loading && (
            <p className="mt-4 text-gray-400">
              🔄 Cargando NFTs desde contrato...
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {nfts.map((nft, idx) => (
              <div
                key={idx}
                className="bg-black border border-gray-700 rounded-lg p-4 shadow text-white max-w-sm w-full mx-auto"
              >
                <h2 className="bg-indigo-900 text-white text-lg font-bold px-3 py-1 rounded-t-md mb-2">
                  Clase #{nft.clase}
                </h2>

                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-full h-44 object-contain rounded bg-white p-2"
                />

                <div className="mt-4">
                  <h3 className="text-xl font-semibold">{nft.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Token de participación en una clase del Seminario de
                    Introducción a Blockchain, otorgado por la Universidad
                    Nacional de Quilmes.
                  </p>

                  <div className="mt-4 text-sm space-y-1">
                    <p>
                      <span className="font-semibold">🎯 Token ID:</span>{" "}
                      {nft.id}
                    </p>
                    <p>
                      <span className="font-semibold">📚 Tema:</span> {nft.tema}
                    </p>
                    <p>
                      <span className="font-semibold">🧑 Alumno:</span>{" "}
                      {nft.alumno}
                    </p>
                  </div>
                </div>
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
