import { ethers } from 'ethers';

function generatePrivateKey() {
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const address = wallet.address;

  console.log("Private Key:", privateKey);
  console.log("Address:", address);
  return privateKey;
}

console.log(generatePrivateKey());