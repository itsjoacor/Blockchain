import React, { useState, useEffect } from "react";
import axios from "axios";

const NFT_CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";
const ALCHEMY_API_KEY = "TTecTP8-drgMcfnoeoO6PH1YwI48YWI";
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export default function NFTGallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMintedNFTs = async () => {
    setLoading(true);
    setNfts([]);

    try {
      const response = await axios.post(ALCHEMY_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [
          {
            fromBlock: "0x0",
            toBlock: "latest",
            contractAddresses: [NFT_CONTRACT_ADDRESS],
            fromAddress: "0x0000000000000000000000000000000000000000",
            category: ["erc1155"],
            withMetadata: true,
            excludeZeroValue: false,
            maxCount: "0x3e8" // 1000 en hexadecimal
          }
        ]
      });

      const transfers = response.data.result.transfers;

      // Procesar los eventos de transferencia para obtener los token IDs y metadatos
      const mintedNFTs = transfers.map((transfer) => ({
        tokenId: transfer.tokenId,
        to: transfer.to,
        transactionHash: transfer.hash,
        metadata: transfer.metadata
      }));

      setNfts(mintedNFTs);
    } catch (error) {
      console.error("Error fetching minted NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMintedNFTs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">NFTs Minteados</h1>
        <p className="text-gray-600 mb-6">Contrato: {NFT_CONTRACT_ADDRESS}</p>

        {loading && (
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-gray-700">Cargando NFTs...</p>
          </div>
        )}

        {nfts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Total: {nfts.length}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Token ID: {nft.tokenId}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Minteado a:</span> {nft.to}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Transacción:</span> {nft.transactionHash}
                    </p>
                    {/* Puedes agregar más detalles del metadata si están disponibles */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && nfts.length === 0 && (
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-gray-700">No se encontraron NFTs minteados en el contrato.</p>
          </div>
        )}
      </div>
    </div>
  );
}
