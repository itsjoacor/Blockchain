const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const baseURI = "https://ipfs.io/ipfs/tu_cid/{id}.json"; // Reemplaza con tu URI de metadatos
  const ERC1155NFT = await hre.ethers.getContractFactory("ERC1155NFT");
  const contract = await ERC1155NFT.deploy(baseURI);

  await contract.deployed();

  console.log("Contrato desplegado en:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
