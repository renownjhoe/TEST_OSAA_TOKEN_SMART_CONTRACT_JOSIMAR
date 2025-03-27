const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Set initial supply to 1,000,000 tokens (with 18 decimals)
  const initialSupply = hre.ethers.parseUnits("1000000", 18);

  const OSAAToken = await hre.ethers.getContractFactory("OSAAToken");
  const token = await OSAAToken.deploy(initialSupply);

  await token.waitForDeployment();

  console.log("Token deployed to:", await token.getAddress());
  console.log("Initial supply:", hre.ethers.formatUnits(initialSupply, 18), "OSAA");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });