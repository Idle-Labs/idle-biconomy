import hre from "hardhat";
import { Biconomy } from "@biconomy/mexa";
import { getNetworkAddresses } from "../lib/addresses";
import { signPermit } from "../lib";

const account = "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98";

const initBiconomy = (biconomy) => {
  return new Promise((resolve, reject) => {
    biconomy.onEvent(biconomy.READY, () => {
      const erc20ForwarderClient = biconomy.erc20ForwarderClient;
      const permitClient = biconomy.permitClient;
      resolve([erc20ForwarderClient, permitClient]);
    }).onEvent(biconomy.ERROR, (error, message) => {
      reject(error);
    });
  });
}

async function main() {
  // await hre.network.provider.request({
  //   method: "hardhat_impersonateAccount",
  //   params: [account]}
  // );

  const addresses = getNetworkAddresses(hre.network.name);
  const [account] = await web3.eth.getAccounts();

  const biconomy = new Biconomy(web3.currentProvider, {
    apiKey: process.env.IDLE_BICONOMY_KOVAN_API_KEY,
    debug: true
  });
  const _ethers = new ethers.providers.Web3Provider(biconomy);
  const [erc20ForwarderClient, permitClient] = await initBiconomy(biconomy);

  const daiPermitOptions = {
    expiry: Math.floor(Date.now() / 1000 + 3600),
    allowed: true
  };

  const tokenAddress = addresses.dai;
  console.log("getting user's permit to spend dai");
  console.log(tokenAddress);
  return;
  const x = await erc20ForwarderClient.daiPermit(daiPermitOptions);
  console.log(x)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
