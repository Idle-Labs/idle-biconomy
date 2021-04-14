const hre = require("hardhat");
const { getNetworkAddresses } = require("../../lib/addresses");
const { prompt, prettifyNumber, confirmRun } = require("../../lib");
const { HardwareSigner } = require("../../lib/HardwareSigner");

async function main() {
  const network = hre.network.name;
  const addresses = getNetworkAddresses(hre.network.name);

  const signer = new HardwareSigner(ethers.provider, null, "m/44'/60'/0'/0/0");
  const signerAddress = await signer.getAddress();
  // const signer = (await ethers.getSigners())[0];

  const chainId = await confirmRun(hre, signerAddress);

  // in fork, we can send 10 ETH from accounts[0] to the ledger account
  // if (chainId === 31337) {
  //   const accounts = await web3.eth.getAccounts();
  //   await web3.eth.sendTransaction({from: signerAddress, to: signerAddress, value: "10000000000000000000"})
  // }

  const IdleDepositForwarder = await hre.artifacts.readArtifact("IdleDepositForwarder");
  const versionRecipient = "1";
  const trustedForwarder = addresses.biconomyTrustedForwarder;

  for (const forwarderToken in addresses.idleDepositForwarders) {
    const forwarderAddress = addresses.idleDepositForwarders[forwarderToken];
    console.log(`setting biconomy config to ${forwarderToken} (${forwarderAddress})`)
    const forwarder = new ethers.Contract(forwarderAddress, IdleDepositForwarder.abi, signer);
    // await forwarder.setBiconomyConfig(versionRecipient, trustedForwarder);
    console.log("new trustedForwarder: ", (await forwarder.trustedForwarder()))
    console.log("new versionRecipient: ", (await forwarder.versionRecipient()))
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
