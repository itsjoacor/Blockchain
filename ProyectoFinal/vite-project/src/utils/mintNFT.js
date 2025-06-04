import { ethers } from "ethers";
import ERC1155NFT from "../contracts/ERC1155NFT.json";

export const mintNFT = async (contractAddress, signer, recipients) => {
  const contract = new ethers.Contract(contractAddress, ERC1155NFT.abi, signer);
  const TOKEN_ID = 1;
  const amount = 1;
  const data = "0x";

  for (const recipient of recipients) {
    const tx = await contract.safeTransferFrom(signer.getAddress(), recipient, TOKEN_ID, amount, data);
    await tx.wait();
  }
};
