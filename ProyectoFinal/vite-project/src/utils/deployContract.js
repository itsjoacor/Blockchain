import { ethers } from "ethers";
import ERC1155NFT from "../contracts/ERC1155NFT.json";

export const deployContract = async (signer, uri) => {
  const factory = new ethers.ContractFactory(ERC1155NFT.abi, ERC1155NFT.bytecode, signer);
  const contract = await factory.deploy(uri);
  await contract.deployed();
  return contract;
};
