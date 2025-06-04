import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

// Minimal ERC1155 Contract ABI and Bytecode (replace with your actual compiled contract)
const ERC1155_ABI = [
  "function mint(address to, uint256 id, uint256 amount, bytes memory data)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function uri(uint256 id) view returns (string memory)"
];

// Example ERC1155 bytecode - REPLACE WITH YOUR ACTUAL COMPILED CONTRACT BYTECODE
const ERC1155_BYTECODE = "0x608060405234801561001057600080fd5b506101..."; // Shortened for example

const Mint = () => {
  const [wallet, setWallet] = useState(null);
  const [contractAddress, setContractAddress] = useState("");
  const [nftData, setNftData] = useState({
    titulo: "",
    description: "",
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
    image: null,
    imagePreview: ""
  });
  const [isMinting, setIsMinting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Check network (Sepolia)
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18
                  },
                  rpcUrls: ["https://rpc.sepolia.org"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"]
                }],
              });
            } catch (addError) {
              setError("Failed to add Sepolia network");
              return;
            }
          } else {
            setError("Failed to switch to Sepolia");
            return;
          }
        }
      }

      const accounts = await provider.listAccounts();
      setWallet(accounts[0]);
      setError("");
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setNftData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      setError("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData(prev => ({ ...prev, [name]: value }));
  };

  const deployContract = async () => {
    if (!wallet) {
      setError("Please connect wallet first");
      return;
    }

    setIsDeploying(true);
    setError("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Validate bytecode
      if (!ERC1155_BYTECODE || ERC1155_BYTECODE === "0x") {
        throw new Error("Contract bytecode not provided");
      }

      const factory = new ethers.ContractFactory(
        ERC1155_ABI,
        ERC1155_BYTECODE,
        signer
      );

      const contract = await factory.deploy({
        gasLimit: 5000000 // Higher gas limit for deployment
      });

      await contract.deployTransaction.wait();
      setContractAddress(contract.address);
      setError("");
    } catch (err) {
      console.error("Deployment error:", err);
      setError("Failed to deploy contract: " + 
        (err.message.includes("bytecode") 
          ? "Invalid contract bytecode - please compile your contract and replace the bytecode" 
          : err.message));
    } finally {
      setIsDeploying(false);
    }
  };

  const mintNFT = async () => {
    if (!wallet || !contractAddress) {
      setError("Please deploy contract first");
      return;
    }

    if (!nftData.titulo || !nftData.description || !nftData.image) {
      setError("Please fill all required fields");
      return;
    }

    setIsMinting(true);
    setError("");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, signer);

      // Generate token ID
      const tokenId = ethers.BigNumber.from(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${Date.now()}`))
      ).mod(1000000);

      // Create metadata (in production, upload to IPFS)
      const metadata = {
        name: nftData.titulo,
        description: nftData.description,
        image: "ipfs://[will-be-replaced]",
        attributes: [
          { trait_type: "Nombre", value: nftData.nombre },
          { trait_type: "Fecha", value: nftData.fecha }
        ]
      };

      // Mint NFT
      const tx = await contract.mint(
        wallet, // Mint to yourself
        tokenId,
        1, // Amount
        ethers.utils.toUtf8Bytes(JSON.stringify(metadata)),
        { gasLimit: 500000 }
      );

      await tx.wait();
      alert(`Successfully minted NFT with ID: ${tokenId}`);
      navigate("/");
    } catch (err) {
      console.error("Minting error:", err);
      setError("Failed to mint NFT: " + err.message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎨 Create ERC1155 NFT (Sepolia)</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          🔌 Connect Wallet
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-green-400">Connected: {wallet}</p>
          <p className="text-sm text-gray-400">Network: Sepolia Testnet</p>
          
          {!contractAddress ? (
            <button
              onClick={deployContract}
              disabled={isDeploying}
              className={`mt-2 px-4 py-2 rounded ${
                isDeploying 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              {isDeploying ? "⏳ Deploying Contract..." : "🚀 Deploy Contract"}
            </button>
          ) : (
            <div className="mt-2">
              <p className="text-blue-400">Contract: {contractAddress}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* NFT Details Form */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📝 NFT Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Title *</label>
              <input
                type="text"
                name="titulo"
                value={nftData.titulo}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded border border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Description *</label>
              <textarea
                name="description"
                value={nftData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded border border-gray-600 h-24"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="nombre"
                value={nftData.nombre}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="fecha"
                value={nftData.fecha}
                onChange={handleInputChange}
                className="w-full bg-gray-700 p-2 rounded border border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🖼️ NFT Image</h2>
          
          {nftData.imagePreview ? (
            <img 
              src={nftData.imagePreview} 
              alt="Preview" 
              className="mb-4 max-h-64 rounded-lg mx-auto"
            />
          ) : (
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Image Preview</p>
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
            {nftData.imagePreview ? "Change Image" : "Select Image"}
          </button>
        </div>
      </div>

      {contractAddress && (
        <button
          onClick={mintNFT}
          disabled={isMinting}
          className={`px-6 py-3 rounded text-white ${
            isMinting 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isMinting ? "⏳ Minting NFT..." : "🛠️ Mint NFT"}
        </button>
      )}
    </div>
  );
};

export default Mint;