const addressesByNetwork = {
  kovan: {
    dai: "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",

    biconomy: {
      // forwarder: "0xE8Df44bcaedD41586cE73eB85e409bcaa834497B", // OLD
      forwarder: "0x61F5832429D203977945414D4b391a348D162A32", // NEW
    },
  },
};

addressesByNetwork.local = addressesByNetwork.kovan;

const getNetworkAddresses = (networkName) => {
  const addresses = addressesByNetwork[networkName];
  if (addresses === undefined) {
    throw(`network adddresses not found: ${networkName}`);
  }
  return addresses;
}

exports.getNetworkAddresses = getNetworkAddresses;
