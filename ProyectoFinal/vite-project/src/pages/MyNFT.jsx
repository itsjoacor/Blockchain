import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const NFT_CONTRACT_ADDRESS = "0xa37bA077a062c60A018993694Acbd4759207DcEE";

const NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "titulo", type: "string" },
      { internalType: "string", name: "descripcion", type: "string" },
      { internalType: "string", name: "nombre", type: "string" },
      { internalType: "string", name: "fecha", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
    ],
    name: "mintConMetadata",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "getMetadata",
    outputs: [
      { internalType: "string", name: "titulo", type: "string" },
      { internalType: "string", name: "descripcion", type: "string" },
      { internalType: "string", name: "nombre", type: "string" },
      { internalType: "string", name: "fecha", type: "string" },
      { internalType: "string", name: "imageUrl", type: "string" },
    ],
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

// Maximum token ID to check (adjust as needed)
const MAX_TOKEN_ID = 200;

export default function NFTGallery() {
  const [wallet, setWallet] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this dApp!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchAllNFTs = async () => {
    if (!wallet) return alert("Please connect your wallet first");

    setLoading(true);
    setNfts([]);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        provider
      );

      const ownedNFTs = [];

      // Check each token ID up to MAX_TOKEN_ID
      for (let tokenId = 0; tokenId < MAX_TOKEN_ID; tokenId++) {
        try {
          // Check balance for this token ID
          const balance = await contract.balanceOf(wallet, tokenId);

          if (balance.gt(0)) {
            // Get token URI
            let tokenUri = "";
            try {
              tokenUri = await contract.uri(tokenId);
              // Handle OpenSea-style {id} replacement
              tokenUri = tokenUri.replace(
                "{id}",
                ethers.utils
                  .hexZeroPad(ethers.utils.hexlify(tokenId), 64)
                  .slice(2)
              );
            } catch (e) {
              console.log(`No URI for token ${tokenId}`);
            }

            // Get metadata from contract
            let metadata = {
              titulo: "",
              descripcion: "",
              nombre: "",
              fecha: "",
              imageUrl: "",
            };

            try {
              const [titulo, descripcion, nombre, fecha, imageUrl] =
                await contract.getMetadata(tokenId);

              metadata = {
                titulo,
                descripcion,
                nombre,
                fecha,
                imageUrl,
              };

              metadata = {
                titulo: contractMetadata.titulo,
                descripcion: contractMetadata.descripcion,
                nombre: contractMetadata.nombre,
                fecha: contractMetadata.fecha,
                imageUrl: contractMetadata.imageUrl,
              };
            } catch (e) {
              console.log(
                `Couldn't get contract metadata for token ${tokenId}`
              );
            }

            // Get additional metadata from URI if it exists
            let externalMetadata = {};
            if (tokenUri) {
              try {
                const res = await fetch(tokenUri);
                externalMetadata = await res.json();
              } catch (e) {
                console.log(
                  `Couldn't fetch external metadata for token ${tokenId}`
                );
              }
            }

            // Get mint event data
            const getMintEvent = async (contract, provider, tokenId) => {
              try {
                const filter = contract.filters.TransferSingle(); // sin filtros
                const events = await contract.queryFilter(filter, 0, "latest");

                for (const e of events) {
                  if (
                    e.args.id.toString() === tokenId.toString() &&
                    e.args.from === ethers.constants.AddressZero
                  ) {
                    const block = await provider.getBlock(e.blockNumber);
                    return {
                      minter: e.args.to,
                      date: new Date(block.timestamp * 1000).toLocaleString(),
                    };
                  }
                }

                return null;
              } catch (err) {
                console.error("Error fetching mint event:", err);
                return null;
              }
            };

            ownedNFTs.push({
              tokenId,
              balance: balance.toString(),
              title:
                metadata.titulo || externalMetadata.name || `NFT #${tokenId}`,
              description:
                metadata.descripcion || externalMetadata.description || "",
              name: metadata.nombre || externalMetadata.name || "",
              date: metadata.fecha || "",
              imageUrl:
                metadata.imageUrl ||
                externalMetadata.image ||
                "https://via.placeholder.com/300",
              mintedBy: mintEvent?.minter || "Unknown",
              mintDate: mintEvent?.date || "Unknown",
              tokenUri,
            });
          }
        } catch (error) {
          console.log(`Token ${tokenId} not found or error:`, error);
          continue;
        }
      }

      setNfts(ownedNFTs);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMintEvent = async (contract, provider, tokenId) => {
    try {
      const filter = contract.filters.TransferSingle(
        null,
        ethers.constants.AddressZero,
        null,
        tokenId
      );

      const events = await contract.queryFilter(filter, 0, "latest");

      if (events.length > 0) {
        const mintEvent = events[0];
        const block = await provider.getBlock(mintEvent.blockNumber);

        return {
          minter: mintEvent.args.to,
          date: new Date(block.timestamp * 1000).toLocaleString(),
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching mint event:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
    }

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setWallet(null);
      } else {
        setWallet(accounts[0]);
      }
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          ERC-1155 NFT Gallery
        </h1>
        <p className="text-gray-600 mb-6">Contract: {NFT_CONTRACT_ADDRESS}</p>

        {!wallet ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <p className="text-gray-700">
                <span className="font-semibold">Connected Wallet:</span>{" "}
                {wallet}
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={fetchAllNFTs}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow disabled:opacity-50"
              >
                {loading ? "Loading..." : "Fetch My NFTs"}
              </button>
            </div>

            {loading && (
              <div className="p-4 bg-white rounded-lg shadow">
                <p className="text-gray-700">Loading NFTs...</p>
              </div>
            )}

            {nfts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Your NFTs ({nfts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <div
                      key={nft.tokenId}
                      className="bg-white rounded-lg overflow-hidden shadow-lg"
                    >
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                          {nft.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {nft.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Token ID:</span>
                            <span className="text-gray-700">{nft.tokenId}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Balance:</span>
                            <span className="text-gray-700">{nft.balance}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Minted By:</span>
                            <span className="text-gray-700">
                              {nft.mintedBy.substring(0, 6)}...
                              {nft.mintedBy.substring(nft.mintedBy.length - 4)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Mint Date:</span>
                            <span className="text-gray-700">
                              {nft.mintDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && nfts.length === 0 && (
              <div className="p-4 bg-white rounded-lg shadow">
                <p className="text-gray-700">No NFTs found in your wallet.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Note: We checked token IDs 0 through {MAX_TOKEN_ID - 1}.
                  Adjust MAX_TOKEN_ID if needed.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
