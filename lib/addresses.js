const addressesByNetwork = {
  mainnet: {
    idleTokens: {
      idleDAIBest:  "0x3fE7940616e5Bc47b0775a0dccf6237893353bB4",
      idleUSDCBest: "0x5274891bEC421B39D23760c04A6755eCB444797C",
    },
    biconomyTrustedForwarder: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",
    idleDepositForwarders: {
      dai: "0xDe3c769cCD1878372864375e9f89956806B86daA",
      usdc: "0x43bD6a78b37b50E3f52CAcec53F1202dbDe6a761",
    }
  },
  kovan: {
    idleTokens: {
      idleDAIBest: "0x295CA5bC5153698162dDbcE5dF50E436a58BA21e",
      idleUSDCBest: "0x0de23D3bc385a74E2196cfE827C8a640B8774B9f",
    },
    dai: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
    biconomyTrustedForwarder: "0xF82986F574803dfFd9609BE8b9c7B92f63a1410E",
  },
};

addressesByNetwork.local = addressesByNetwork.mainnet;

const getNetworkAddresses = (networkName) => {
  const addresses = addressesByNetwork[networkName];
  if (addresses === undefined) {
    throw(`network adddresses not found: ${networkName}`);
  }

  return addresses;
}

exports.getNetworkAddresses = getNetworkAddresses;
