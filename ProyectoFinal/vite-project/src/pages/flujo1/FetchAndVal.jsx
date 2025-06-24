import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const ERC1155_CONTRACT_ADDRESS = "0x1FEe62d24daA9fc0a18341B582937bE1D837F91d";

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
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "TransferSingle",
    type: "event",
  },
];

const MAX_TOKEN_ID = 100;

export default function Start() {
  const [wallet, setWallet] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validations, setValidations] = useState({
    has10NFTs: false,
    allMintedBeforeDate: false,
  });
  const navigate = useNavigate();

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

  const getMintEvent = async (contract, provider, tokenId) => {
    try {
      const filter = contract.filters.TransferSingle(
        null,
        ethers.constants.AddressZero
      );
      const events = await contract.queryFilter(filter, 0, "latest");

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.args.id.toString() === tokenId.toString()) {
          const block = await provider.getBlock(event.blockNumber);
          return {
            minteadoA: event.args.to,
            minteadoPor: event.args.operator,
            fecha: new Date(block.timestamp * 1000).toLocaleString(),
            esMinteadoDesdeCero: true,
          };
        }
      }
      return { esMinteadoDesdeCero: false };
    } catch (err) {
      console.warn(
        `⚠️ No se pudo obtener evento de minteo para ID ${tokenId}`,
        err
      );
      return { esMinteadoDesdeCero: false };
    }
  };

  const fetchAllNFTs = async () => {
    if (!wallet) return alert("Conectá la wallet primero");

    setLoading(true);
    setNfts([]);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
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

          const mintInfo = await getMintEvent(contract, provider, id);

          ownedNFTs.push({
            id,
            balance: balance.toString(),
            title: metadata.name || `NFT ${id}`,
            image:
              metadata.image || "https://via.placeholder.com/300?text=No+Image",
            clase,
            tema,
            alumno,
            minteadoA: mintInfo?.minteadoA || "Desconocido",
            minteadoPor: mintInfo?.minteadoPor || "Desconocido",
            fechaMint: mintInfo?.fecha || "Desconocida",
            esMinteadoDesdeCero: mintInfo?.esMinteadoDesdeCero || false,
          });
        }
      }

      setNfts(ownedNFTs);

      // Check validations after fetching NFTs
      const has10NFTs = ownedNFTs.length === 10;

      // Check if all NFTs were minted before 28/05/2025 (timestamp: 1716854400)
      const cutoffDate = new Date("2025-05-28").getTime();
      const allMintedBeforeDate = ownedNFTs.every((nft) => {
        if (nft.fechaMint === "Desconocida") return false;
        const mintDate = new Date(nft.fechaMint).getTime();
        return mintDate < cutoffDate;
      });

      setValidations({
        has10NFTs,
        allMintedBeforeDate,
      });
    } catch (err) {
      console.error("❌ Error al obtener NFTs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    navigate("/mint");
  };

  const allValidationsPassed =
    validations.has10NFTs && validations.allMintedBeforeDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 text-gray-800 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-indigo-600">
          🖼️ Tus NFTs (ERC-1155)
        </h1>

        {!wallet ? (
          <div className="flex justify-center">
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-green-300 to-emerald-400 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-green-400 hover:to-emerald-500 transition-all"
            >
              🔌 Conectar Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 px-4 py-3 rounded-lg shadow">
              <span className="text-sm text-gray-600 font-mono">
                🔐 Wallet conectada: {wallet}
              </span>
              <button
                onClick={fetchAllNFTs}
                className="bg-gradient-to-r from-blue-300 to-indigo-400 text-white px-6 py-3 rounded-lg shadow hover:from-blue-400 hover:to-indigo-500 transition-all"
              >
                📥 Obtener NFTs
              </button>
            </div>

            {loading && (
              <p className="text-indigo-500 italic text-center">
                🔄 Cargando NFTs desde contrato...
              </p>
            )}

            {nfts.length > 0 && (
              <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">
                  ✅ Validaciones
                </h2>
                <ul className="space-y-2 text-base text-center">
                  <li className={validations.has10NFTs ? "text-green-600" : "text-rose-500"}>
                    {validations.has10NFTs ? "✓" : "✗"} Tienes exactamente 10 NFTs
                  </li>
                  <li className={validations.allMintedBeforeDate ? "text-green-600" : "text-rose-500"}>
                    {validations.allMintedBeforeDate ? "✓" : "✗"} Todos minteados antes del 28/05/2025
                  </li>
                </ul>
                {allValidationsPassed ? (
                  <div className="flex justify-center">
                    <button
                      onClick={handleRedirect}
                      className="mt-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      🚀 Proceder a Mint
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-rose-500 italic text-center">
                    No cumples con todos los requisitos de validación.
                  </p>
                )}
              </div>
            )}

            {nfts.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {nfts.map((nft, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-4 border border-indigo-200 hover:shadow-xl transition-all"
                  >
                    <img
                      src={nft.image}
                      alt={`NFT ${nft.id}`}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-bold text-indigo-700 mb-1">{nft.title}</h3>
                    <p className="text-sm text-gray-700 mb-1">🎓 Tema: {nft.tema}</p>
                    <p className="text-sm text-gray-700 mb-1">📚 Clase: {nft.clase}</p>
                    <p className="text-sm text-gray-700 mb-1">👤 Alumno: {nft.alumno}</p>
                    <p className="text-sm text-gray-700 mb-1">🧾 ID: {nft.id}</p>
                    <p className="text-sm text-gray-700 mb-1">📤 Minteado a: {nft.minteadoA}</p>
                    <p className="text-sm text-gray-700 mb-1">👨‍🏫 Minteado por: {nft.minteadoPor}</p>
                    <p className="text-sm text-gray-700 mb-1">📅 Fecha: {nft.fechaMint}</p>
                    <p className={`text-sm font-semibold ${nft.esMinteadoDesdeCero ? "text-green-600" : "text-red-600"}`}>
                      {nft.esMinteadoDesdeCero ? "✅ Desde 0x0" : "❌ No desde 0x0"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!loading && nfts.length === 0 && (
              <p className="text-gray-500 italic text-center">No se encontraron NFTs.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}