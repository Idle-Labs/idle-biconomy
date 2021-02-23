// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { getNetworkAddresses } = require("./addresses");

async function main() {
  const addresses = getNetworkAddresses(hre.network.name);
  const Foo = await hre.ethers.getContractFactory("Foo");
  const foo = await Foo.deploy(addresses.biconomy.forwarder);
  await foo.deployed();

  console.log("Foo deployed to:", foo.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
