const hre = require("hardhat");
const { getNetworkAddresses } = require("../../lib/addresses");
const { prompt } = require("../../lib");
const { HardwareSigner } = require("../../lib/HardwareSigner");

async function main() {
  const network = hre.network.name;

  const signer = new HardwareSigner(ethers.provider, null, "m/44'/60'/0'/0/0");
  // const signer = (await ethers.getSigners())[0];

  const address = await signer.getAddress();
  const chainId = await web3.eth.getChainId();
  const addresses = getNetworkAddresses(hre.network.name);

  console.log("runing on network", hre.network.name);
  console.log("chainId", chainId);
  console.log("deploying with account", address);
  console.log("account balance", web3.utils.fromWei(await web3.eth.getBalance(address)).toString(), "\n\n");

  const answer = await prompt("continue? [y/n]");
  if (answer !== "y" && answer !== "yes") {
    console.log("exiting...");
    process.exit(1);
  }

  console.log("starting...")

  // in fork, we can send 10 ETH from accounts[0] to the ledger account
  if (chainId === 31337) {
    const accounts = await web3.eth.getAccounts();
    await web3.eth.sendTransaction({from: accounts[0], to: address, value: "10000000000000000000"})
  }

  for (const token in addresses.idleTokens) {
    const tokenAddress = addresses.idleTokens[token];
    console.log(`deploying IdleDepositForwarder for ${token} (${tokenAddress})`);

    const IdleDepositForwarder = await ethers.getContractFactory("IdleDepositForwarder", signer);
    const args = [addresses.biconomyTrustedForwarder, tokenAddress];
    const proxy = await upgrades.deployProxy(IdleDepositForwarder, args);
    await proxy.deployed();
    console.log("IdleDepositForwarder deployed at:", proxy.address);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
