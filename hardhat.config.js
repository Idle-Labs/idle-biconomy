const path = require('path');
const root = path.resolve(__dirname);

require("@babel/register")({
  only: [
    new RegExp(`^${root}/scripts`),
    new RegExp(`^${root}/test`),
    new RegExp(`^${root}/node_modules/@biconomy`),
  ],
});

require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
global.fetch = require("node-fetch");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const mainnetAccounts = process.env.MAINNET_PRIVATE_KEY ? [`${process.env.MAINNET_PRIVATE_KEY}`] : [];
const kovanAccounts   = process.env.KOVAN_PRIVATE_KEY   ? [`${process.env.KOVAN_PRIVATE_KEY}`]   : [];
const rinkebyAccounts = process.env.RINKEBY_PRIVATE_KEY ? [`${process.env.RINKEBY_PRIVATE_KEY}`] : [];

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      }
    ],
  },
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:8545/",
      timeout: 120000,
    },
    kovan: {
      url: `https://eth-kovan.alchemyapi.io/v2/${process.env.IDLE_ALCHEMY_KEY}`,
      accounts: kovanAccounts,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.IDLE_ALCHEMY_KEY}`,
      accounts: rinkebyAccounts,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.IDLE_INFURA_KEY}`,
      accounts: mainnetAccounts,
    },
  },
};
