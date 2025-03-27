// require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
/** @type import("@nomicfoundation/hardhat-toolbox") */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: 
        process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

console.log("Hardhat config loaded"); //Add this line.
console.log("Sepolia RPC URL:", process.env.SEPOLIA_RPC_URL); //Add this line.
console.log("Private Key Provided:", !!process.env.PRIVATE_KEY); //Add this line.
