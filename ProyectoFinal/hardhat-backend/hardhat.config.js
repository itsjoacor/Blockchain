require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/a71398a242c54edba1df1c68d2013158",
      accounts: ["/Fierro123"]
    }
  }
};
