import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2E14CD8D9ecfF34c941c69acE8FD9c17020Ef6Cb";

const ABI = [
    // Solo dejamos lo que usás
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
];

const Mint2 = () => {
    const [wallet, setWallet] = useState(null);
    const [nftData, setNftData] = useState({
        titulo: "",
        description: "",
        nombre: "",
        fecha: new Date().toISOString().split("T")[0],
        image: null,
        imagePreview: "",
    });
    const [isMinting, setIsMinting] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const [toAddress, setToAddress] = useState("");

    const navigate = useNavigate();

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("Instala MetaMask");
            return;
        }

        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            setWallet(accounts[0]);
            setError("");
        } catch (err) {
            setError("Error al conectar wallet: " + err.message);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 5 * 1024 * 1024) {
            setNftData((prev) => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file),
            }));
            setError("");
        } else {
            setError("La imagen debe pesar menos de 5MB");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNftData((prev) => ({ ...prev, [name]: value }));
    };

    const mintNFT = async () => {
        if (!wallet) return setError("Conectá tu wallet primero");
        if (!toAddress || !ethers.utils.isAddress(toAddress)) {
            return setError("Ingresá una dirección válida para mintear");
        }
        if (!nftData.titulo || !nftData.description || !nftData.image) {

            return setError("Completá todos los campos obligatorios");
        }

        setIsMinting(true);
        setError("");

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            // Simulamos IPFS hash de la imagen
            const simulatedIpfsImageUrl = "ipfs://placeholder-hash";

            const tx = await contract.mintConMetadata(
                toAddress,
                nftData.titulo,
                nftData.description,
                nftData.nombre,
                nftData.fecha,
                simulatedIpfsImageUrl,
                { gasLimit: 500000 }
            );

            await tx.wait();
            alert("✅ NFT minteado exitosamente");
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("❌ Error al mintear: " + err.message);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">🎨 Crear NFT (ERC-1155)</h1>

            {!wallet ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    🔌 Conectar Wallet
                </button>
            ) : (
                <p className="mb-4 text-green-400">Wallet conectada: {wallet}</p>
            )}
            <p className="mb-4 text-green-400">Contrato: {CONTRACT_ADDRESS}</p>
            {error && (
                <div className="mb-4 p-3 bg-red-800 text-red-100 rounded">{error}</div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Formulario NFT */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <label className="block mb-2">Título *</label>
                    <input
                        name="titulo"
                        value={nftData.titulo}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 p-2 rounded mb-4"
                        required
                    />
                    <label className="block mb-2">Descripción *</label>
                    <textarea
                        name="description"
                        value={nftData.description}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 p-2 rounded mb-4"
                        required
                    />
                    <label className="block mb-2">Nombre</label>
                    <input
                        name="nombre"
                        value={nftData.nombre}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 p-2 rounded mb-4"
                    />
                    <label className="block mb-2">Fecha</label>
                    <input
                        type="date"
                        name="fecha"
                        value={nftData.fecha}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 p-2 rounded"
                    />
                    <label className="block mb-2">Dirección de destino *</label>
                    <input
                        name="toAddress"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        className="w-full bg-gray-700 p-2 rounded mb-4"
                        placeholder="0x..."
                        required
                    />

                </div>

                {/* Imagen */}
                <div className="bg-gray-800 p-6 rounded-lg">
                    <label className="block mb-2">Imagen *</label>
                    {nftData.imagePreview ? (
                        <img
                            src={nftData.imagePreview}
                            alt="Preview"
                            className="mb-4 rounded-lg max-h-64 mx-auto"
                        />
                    ) : (
                        <div className="h-64 bg-gray-700 flex items-center justify-center text-gray-400 rounded mb-4">
                            Imagen no seleccionada
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                    >
                        {nftData.imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
                    </button>
                </div>

            </div>

            {wallet && (
                <button
                    onClick={mintNFT}
                    disabled={isMinting}
                    className={`mt-6 px-6 py-3 rounded text-white ${isMinting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    {isMinting ? "⏳ Minteando..." : "🛠️ Crear NFT"}
                </button>
            )}
        </div>
    );
};

export default Mint2;
