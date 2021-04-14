const rl = require("readline");

const prompt = (question) => {
  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  return new Promise((resolve, error) => {
    r.question(question, answer => {
      r.close()
      resolve(answer)
    });
  })
}
exports.prompt = prompt;


exports.signPermit = async (contractAddress, erc20Name, holder, spender, value, nonce, expiry, chainId) => {
  if (chainId === undefined) {
    const result = await web3.eth.getChainId();
    chainId = parseInt(result);
  }

  const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  const permit = [
    { name: "holder", type: "address" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "allowed", type: "bool" },
  ];

  const domainData = {
    name: erc20Name,
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddress
  };

  const message = {
    holder,
    spender,
    nonce,
    expiry,
    allowed: true,
  };

  const data = {
    types: {
      EIP712Domain: domain,
      Permit: permit,
    },
    primaryType: "Permit",
    domain: domainData,
    message: message
  };

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      id: Date.now().toString().substring(9),
      method: "eth_signTypedData",
      params: [holder, data],
      from: holder
    }, (error, res) => {
      if (error) {
        return reject(error);
      }

      resolve(res.result);
    });
  });
}

exports.signPermitEIP2612 = async (contractAddress, erc20Name, owner, spender, value, nonce, deadline, chainId) => {
  if (chainId === undefined) {
    const result = await web3.eth.getChainId();
    chainId = parseInt(result);
  }

  const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  const permit = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ];

  const domainData = {
    name: erc20Name,
    version: "2",
    chainId: chainId,
    verifyingContract: contractAddress
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const data = {
    types: {
      EIP712Domain: domain,
      Permit: permit,
    },
    primaryType: "Permit",
    domain: domainData,
    message: message
  };

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      id: Date.now().toString().substring(9),
      method: "eth_signTypedData",
      params: [owner, data],
      from: owner
    }, (error, res) => {
      if (error) {
        return reject(error);
      }

      resolve(res.result);
    });
  });
}

const prettifyNumber = (_n) => {
  if (typeof _n != "number") {
    return _n;
  }

  const n = _n.toString();
  let s = "";
  for (let i = 0; i < n.length; i++) {
    if (i != 0 && i % 3 == 0) {
      s = "_" + s;
    }

    s = n[n.length - 1 - i] + s;
  };

  return s;
}
exports.prettifyNumber = prettifyNumber;

exports.confirmRun = async (hre, signerAddress) => {
  const chainId = await web3.eth.getChainId();

  console.log("runing on network", hre.network.name);
  console.log("chainId", chainId);
  console.log("deploying with account", signerAddress);
  console.log("gas limit", prettifyNumber(hre.network.config.gas))
  console.log("gasPrice", prettifyNumber(hre.network.config.gasPrice))
  console.log("account balance", web3.utils.fromWei(await web3.eth.getBalance(signerAddress)).toString(), "\n\n");

  const answer = await prompt("continue? [y/n]");
  if (answer !== "y" && answer !== "yes") {
    console.log("exiting...");
    process.exit(1);
  }

  console.log("starting...")

  return chainId;
}
