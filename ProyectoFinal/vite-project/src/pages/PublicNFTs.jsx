import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const NFT_CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";

const NFT_ABI = [
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "getMetadata",
        outputs: [
            { internalType: "string", name: "titulo", type: "string" },
            { internalType: "string", name: "descripcion", type: "string" },
            { internalType: "string", name: "nombre", type: "string" },
            { internalType: "string", name: "fecha", type: "string" },
            { internalType: "string", name: "imageUrl", type: "string" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "uri",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "operator", type: "address" },
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
        ],
        name: "TransferSingle",
        type: "event"
    }
];

export default function NFTGallery() {
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllNFTs = async () => {
        setLoading(true);
        setNfts([]);

        try {
            const provider = new ethers.providers.JsonRpcProvider(
                "https://eth-sepolia.g.alchemy.com/v2/TTecTP8-drgMcfnoeoO6PH1YwI48YWI5"
            );
            const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

            const tokenIds = await getAllMintedTokenIds(contract, provider);

            const allNFTs = await Promise.all(
                tokenIds.map(async (tokenId) => {
                    try {
                        const [titulo, descripcion, nombre, fecha, imageUrl] = await contract.getMetadata(tokenId);
                        return {
                            tokenId,
                            titulo: titulo || `NFT #${tokenId}`,
                            descripcion: descripcion || "No description available",
                            nombre: nombre || "Unnamed",
                            fecha: fecha || "Unknown date",
                            imageUrl: imageUrl || "https://placehold.co/300x300?text=Sin+Imagen"
                        };
                    } catch (e) {
                        return null;
                    }
                })
            );

            setNfts(allNFTs.filter(Boolean));
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAllMintedTokenIds = async (contract, provider) => {
        const filter = contract.filters.TransferSingle(null, ethers.constants.AddressZero);
        const latestBlock = await provider.getBlockNumber();
        const step = 500;

        const tokenIds = new Set();

        for (let fromBlock = 0; fromBlock <= latestBlock; fromBlock += step) {
            const toBlock = Math.min(fromBlock + step - 1, latestBlock);

            try {
                const events = await contract.queryFilter(filter, fromBlock, toBlock);

                for (const event of events) {
                    tokenIds.add(event.args.id.toNumber());
                }
            } catch (e) {
                console.warn(`Error fetching logs from ${fromBlock} to ${toBlock}`, e);
            }
        }

        return Array.from(tokenIds);
    };


    useEffect(() => {
        fetchAllNFTs();
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
                            {nfts.map((nft) => (
                                <div key={nft.tokenId} className="bg-white rounded-lg overflow-hidden shadow-lg">
                                    <img
                                        src={nft.imageUrl}
                                        alt={nft.titulo}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://placehold.co/600x400?text=Error";
                                        }}
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-xl text-gray-800 mb-2">{nft.titulo}</h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            <span className="font-semibold">Descripción:</span> {nft.descripcion}
                                        </p>
                                        <p className="text-gray-600 text-sm mb-2">
                                            <span className="font-semibold">Nombre:</span> {nft.nombre}
                                        </p>
                                        <p className="text-gray-600 text-sm mb-2">
                                            <span className="font-semibold">Fecha:</span> {nft.fecha}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Token ID:</span>
                                                <span className="text-gray-700">{nft.tokenId}</span>
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
                        <p className="text-gray-700">No se encontraron NFTs en el contrato.</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Revisa que haya NFTs minteados o que la red esté sincronizada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
