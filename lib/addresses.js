const addressesByNetwork = {
  mainnet: {
    idleTokens: {
      idleDAIBest:  "0x3fE7940616e5Bc47b0775a0dccf6237893353bB4",
      idleUSDCBest: "0x5274891bEC421B39D23760c04A6755eCB444797C",
    },
    biconomyTrustedForwarder: "0x61F5832429D203977945414D4b391a348D162A32", // FIXME: change it to the new mainnet one
  },
  kovan: {
    idleTokens: {
      idleDAIBest: "0x295CA5bC5153698162dDbcE5dF50E436a58BA21e",
      idleUSDCBest: "0x0de23D3bc385a74E2196cfE827C8a640B8774B9f",
    },
    // biconomyTrustedForwarder: "0xE8Df44bcaedD41586cE73eB85e409bcaa834497B", // OLD
    biconomyTrustedForwarder: "0x61F5832429D203977945414D4b391a348D162A32", // NEW
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
