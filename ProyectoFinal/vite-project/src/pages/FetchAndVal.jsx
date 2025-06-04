import React, { useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";

const ALCHEMY_API_KEY = "TTecTP8-drgMcfnoeoO6PH1YwI48YWI5";
const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhkNDg2ZDBmLWRiYTAtNDJlOC1iNGVhLTQ0ZGYxZjc3NmVmNSIsIm9yZ0lkIjoiNDUwODI3IiwidXNlcklkIjoiNDYzODY1IiwidHlwZUlkIjoiZmRkNjU3OWQtN2MyNi00Yzk3LWI5M2YtZWQ0NDVhNmFmODhkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDg5OTQyOTQsImV4cCI6NDkwNDc1NDI5NH0.1zcyJ8YwLhbDKRMwKa7DhEPgbKQxGu53RqBqNocPIcU"; // ← reemplazá por la tuya
const CONTRACT_ADDRESS = "0x1FEe62d24daA9fc0a18341B582937bE1D837F91d".toLowerCase();
const FECHA_CORTE = new Date("2025-05-28T00:00:00Z");
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

// Alchemy SDK config
const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
});

// 🧠 Fallback Moralis → Alchemy para detectar dirección de minteo
const obtenerMinteoConFallback = async (contract, tokenId, wallet) => {
  const tokenIdDecimal =
    typeof tokenId === "string" && tokenId.startsWith("0x")
      ? parseInt(tokenId, 16).toString()
      : parseInt(tokenId).toString();

  const moralisUrl = `https://deep-index.moralis.io/api/v2/nft/${contract}/${tokenIdDecimal}/transfers?chain=sepolia&format=decimal&limit=100`;

  try {
    const res = await fetch(moralisUrl, {
      headers: { "X-API-Key": MORALIS_API_KEY },
    });

    const data = await res.json();
    const eventos = data.result || [];

    if (eventos.length > 0) {
      const e = eventos[0];
      return {
        from: e.from_address || "Desconocida",
        to: e.to_address || "Desconocido",
        fuente: "moralis",
      };
    }
  } catch (err) {
    console.warn("⚠️ Moralis falló, intento con Alchemy...");
  }

  try {
    const alchemyResult = await alchemy.nft.getNftTransfersForNft(contract, tokenId);
    const primer = alchemyResult.transfers?.[0];

    return {
      from: primer?.from || "Desconocida",
      to: primer?.to || "Desconocido",
      fuente: "alchemy",
    };
  } catch (err) {
    console.error("❌ Alchemy también falló:", err);
  }

  return {
    from: "Desconocida",
    to: "Desconocido",
    fuente: "ninguna",
  };
};

export default function Validacion() {
  const [wallet, setWallet] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [reglas, setReglas] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Instalá MetaMask");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } catch (err) {
      console.error("Error conectando wallet:", err);
    }
  };

  const fetchNFTsFromAlchemy = async () => {
    if (!wallet) return alert("Conectá la wallet primero");

    setLoading(true);
    setResultado(null);
    setReglas([]);
    setNfts([]);

    try {
      const data = await alchemy.nft.getNftsForOwner(wallet, {
        contractAddresses: [CONTRACT_ADDRESS],
        withMetadata: true,
      });

      const enriquecidos = await Promise.all(
        data.ownedNfts.map(async (nft) => {
          const id = parseInt(nft.tokenId, 16);
          const metadata = nft.rawMetadata || {};
          const tema = metadata.name || `NFT ${id}`;
          const fecha = new Date(metadata.createdAt || "2025-05-20");

          const { from, to } = await obtenerMinteoConFallback(
            CONTRACT_ADDRESS,
            nft.tokenId,
            wallet
          );

          return {
            id,
            tema,
            fecha,
            direccionDeMinteo: from,
            esMinteadoDirectamente:
              from.toLowerCase() === NULL_ADDRESS &&
              to.toLowerCase() === wallet.toLowerCase(),
          };
        })
      );

      setNfts(enriquecidos);
    } catch (err) {
      console.error("❌ Error al obtener NFTs o historial:", err);
    } finally {
      setLoading(false);
    }
  };

  const validarNFTs = async () => {
    if (!wallet || nfts.length === 0) return;

    const cantidadOk = nfts.length === 10;
    const fechasOk = nfts.every((n) => n.fecha < FECHA_CORTE);
    const mintOk = nfts.every((n) => n.esMinteadoDirectamente);

    setReglas([
      { regla: "Debe haber exactamente 10 NFTs", ok: cantidadOk },
      { regla: "Todos deben estar emitidos antes del 28/05/2025", ok: fechasOk },
      {
        regla: "Todos deben haber sido minteados directamente hacia tu wallet",
        ok: mintOk,
      },
    ]);

    if (cantidadOk && fechasOk && mintOk) {
      setResultado("✅ Validación exitosa. Podés continuar al minteo.");
    } else {
      setResultado("❌ Error: no cumplís con los requisitos.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Validación con Alchemy + Moralis</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          🔌 Conectar Wallet
        </button>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-300">Wallet conectada: {wallet}</p>

          <button
            onClick={fetchNFTsFromAlchemy}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            📄 Obtener NFTs
          </button>

          {loading && (
            <p className="mt-4 animate-pulse text-blue-300">
              ⏳ Cargando NFTs y transferencias...
            </p>
          )}

          {nfts.length > 0 && (
            <>
              <h2 className="mt-6 text-xl font-semibold">🎯 NFTs encontrados:</h2>
              <ul className="mt-2 space-y-2 text-sm text-gray-200">
                {nfts.map((nft) => (
                  <li key={nft.id} className="border-b border-gray-700 pb-2">
                    <p>
                      <strong>ID:</strong> {nft.id} — <strong>Tema:</strong> {nft.tema}
                    </p>
                    <p>
                      📅 Fecha: {nft.fecha.toLocaleDateString()} <br />
                      🧾 Minteado desde:{" "}
                      <span
                        className={
                          nft.direccionDeMinteo.toLowerCase() === NULL_ADDRESS
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {nft.direccionDeMinteo}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>

              <button
                onClick={validarNFTs}
                className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow"
              >
                ✅ Validar NFTs
              </button>
            </>
          )}

          {reglas.length > 0 && (
            <div className="mt-6 space-y-2">
              <h2 className="text-lg font-semibold">📋 Reglas aplicadas:</h2>
              <ul className="text-sm space-y-1 text-gray-200">
                {reglas.map((r, idx) => (
                  <li key={idx}>
                    {r.ok ? "✅" : "❌"} {r.regla}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultado && (
            <div className="mt-6 text-center">
              <p className="text-lg font-bold mb-4">{resultado}</p>
              <button
                onClick={() => console.log("➡️ Ir al minteo o siguiente paso")}
                disabled={resultado.startsWith("❌")}
                className={`px-6 py-3 rounded font-semibold shadow ${
                  resultado.startsWith("✅")
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-white cursor-not-allowed"
                }`}
              >
                {resultado.startsWith("✅") ? "Continuar" : "Validación incompleta"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
