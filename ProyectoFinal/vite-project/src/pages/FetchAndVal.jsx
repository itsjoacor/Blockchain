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
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-x-auto">
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

          {/* Validation Status */}
          {nfts.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Validaciones:</h2>
              <ul className="space-y-2">
                <li
                  className={`flex items-center ${
                    validations.has10NFTs ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {validations.has10NFTs ? "✓" : "✗"} Tienes exactamente 10 NFTs
                </li>
                <li
                  className={`flex items-center ${
                    validations.allMintedBeforeDate
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {validations.allMintedBeforeDate ? "✓" : "✗"} Todos minteados
                  antes del 28/05/2025
                </li>
              </ul>

              {allValidationsPassed ? (
                <button
                  onClick={handleRedirect}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
                >
                  🚀 Proceder a Mint
                </button>
              ) : (
                <p className="mt-4 text-red-400">
                  No cumples con todos los requisitos de validación.
                </p>
              )}
            </div>
          )}

          {/* NFT Table */}
          {nfts.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-700 text-sm">
                <thead className="bg-indigo-800 text-white">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700">ID</th>
                    <th className="px-4 py-2 border border-gray-700">Título</th>
                    <th className="px-4 py-2 border border-gray-700">Tema</th>
                    <th className="px-4 py-2 border border-gray-700">Clase</th>
                    <th className="px-4 py-2 border border-gray-700">Alumno</th>
                    <th className="px-4 py-2 border border-gray-700">
                      Minteado A
                    </th>
                    <th className="px-4 py-2 border border-gray-700">
                      Minteado por
                    </th>
                    <th className="px-4 py-2 border border-gray-700">Fecha</th>
                    <th className="px-4 py-2 border border-gray-700">
                      Minteado desde 0x0
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nfts.map((nft, idx) => (
                    <tr key={idx} className="hover:bg-gray-800">
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.id}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.title}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.tema}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.clase}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.alumno}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.minteadoA}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.minteadoPor}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.fechaMint}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {nft.esMinteadoDesdeCero ? "Sí" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && nfts.length === 0 && (
            <p className="mt-6 text-gray-500">No se encontraron NFTs.</p>
          )}
        </div>
      )}
    </div>
  );
}
