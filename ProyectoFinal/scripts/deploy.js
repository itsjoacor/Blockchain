const hre = require("hardhat");

async function main() {
  const MiNFT = await hre.ethers.getContractFactory("MiNFT");
  const contract = await MiNFT.deploy();
  await contract.deployed();
  console.log("✅ Contrato desplegado en:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
