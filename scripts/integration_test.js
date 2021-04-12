const hre = require("hardhat");
const { signPermit, signPermitEIP2612, IdleTokens} = require("../lib");
const { ethers, upgrades } = require("hardhat");
const BN = require("bignumber.js");
const IERC20 = artifacts.require('IERC20Nonces');
const IIdleTokenV3_1 = artifacts.require('IIdleTokenV3_1');
const IdleDepositForwarder = artifacts.require('IdleDepositForwarder');
const TestForwarder = artifacts.require('TestForwarder');
const { getNetworkAddresses } = require("../lib/addresses");


// config
const CHAIN_ID = 1;
const network = "mainnet";
const holder = "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98";
console.log("network", hre.network.name)
const addresses = getNetworkAddresses(hre.network.name);

const scenarios = [
  {
    signPermitFunc: signPermit,
    idleTokenAddress: addresses.idleTokens.idleDAIBest,
    holder,
  },
  {
    signPermitFunc: signPermitEIP2612,
    idleTokenAddress: addresses.idleTokens.idleUSDCBest,
    holder,
  },
];

const check = (a, b, message) => {
  let [icon, symbol] = a === b ? ["✔️", "==="] : ["🚨🚨🚨", "!=="];
  console.log(`${icon}  `, a, symbol, b, message ? message : "");
}

const checkIncreased = (a, b, message) => {
  let [icon, symbol] = b.gt(a) ? ["✔️", ">"] : ["🚨🚨🚨", "<="];
  console.log(`${icon}  `, a.toString(), symbol, b.toString(), message ? message : "");
}

const toBN = (v) => new BN(v.toString());

const start = async ({signPermitFunc, idleTokenAddress, holder}) => {
  const [owner, user, forwarderAccount] = await ethers.getSigners();

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [holder]}
  );

  console.log("testing IdleToken at ", idleTokenAddress);

  const IdleToken = await IIdleTokenV3_1.at(idleTokenAddress);
  const underlyingAddress = await IdleToken.token();
  const UnderlyingToken = await IERC20.at(underlyingAddress);
  const decimals = toBN(await UnderlyingToken.decimals()).toNumber();

  const ONE_UNDERLYING_UNIT = toBN(10 ** decimals);
  const ONE_IDLE_UNIT = toBN(10 ** 18);

  const toUnderlyingUnit = (v) => toBN(v).div(ONE_UNDERLYING_UNIT);
  const fromUnderlyingUnit = (v) => toBN(v).times(ONE_UNDERLYING_UNIT);
  const toIdleUnit = (v) => toBN(v).div(ONE_IDLE_UNIT);
  const toIdleUnitString = (v) => toBN(v).div(ONE_IDLE_UNIT).toString();
  const fromIdleUnit = (v) => toBN(v).times(ONE_IDLE_UNIT);

  console.log("using holder", holder);
  console.log("using idle token 🪙 " , (await IdleToken.name()), "-", idleTokenAddress);
  console.log("using underlying token", (await UnderlyingToken.name()), "-", underlyingAddress);
  console.log("holder balance", toUnderlyingUnit(await UnderlyingToken.balanceOf(holder)).toString());
  console.log(`underlying token decimals ${decimals}`);

  // deploy
  const trustedForwarder = await TestForwarder.new({ from: owner.address });

  const depositForwarderFactory = await ethers.getContractFactory("IdleDepositForwarder");
  const depositForwarder = await upgrades.deployProxy(depositForwarderFactory, [trustedForwarder.address, IdleToken.address]);
  await depositForwarder.deployed();
  console.log("depositForwarder deployed at", depositForwarder.address)

  const deposit = async (accountAddress, amountInUnit, permit) => {
    const amount = fromUnderlyingUnit(amountInUnit).toString();

    console.log("⬇️  deposit");
    console.log(`deposit of ${amountInUnit} (${(amount)}) from ${accountAddress} (${accountAddress})`)

    await UnderlyingToken.transfer(accountAddress, amount, { from: holder });

    const nonce = await UnderlyingToken.nonces(accountAddress);
    console.log("nonce:", nonce.toString())
    const expiry = Math.round(new Date().getTime() / 1000 + 3600);
    const erc20Name = await UnderlyingToken.name();
    const sig =  await signPermitFunc(UnderlyingToken.address, erc20Name, accountAddress, depositForwarder.address, amount, nonce, expiry, CHAIN_ID);
    const r = sig.slice(0, 66);
    const s = "0x" + sig.slice(66, 130);
    const v = "0x" + sig.slice(130, 132);

    const idleBalanceBefore = toBN(await IdleToken.balanceOf(accountAddress));

    if (signPermitFunc === signPermit) { // DAI
      const sig = "permitAndDeposit(uint256,uint256,uint256,uint8,bytes32,bytes32)";
      const data = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "uint256", "uint8", "bytes32", "bytes32"],
        [amount, nonce, expiry, v, r, s]
      )
      console.log("calling trustedForwarder.execute permitAndDeposit");
      const tx = await trustedForwarder.execute(depositForwarder.address, sig, data, accountAddress, { from: forwarderAccount.address });
    } else {
      const sig = "permitEIP2612AndDeposit(uint256,uint256,uint8,bytes32,bytes32)";
      const data = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "uint8", "bytes32", "bytes32"],
        [amount, expiry, v, r, s]
      )
      console.log("calling trustedForwarder.execute permitEIP2612AndDeposit");
      const tx = await trustedForwarder.execute(depositForwarder.address, sig, data, accountAddress, { from: forwarderAccount.address });
    }

    const idleBalanceAfter = toBN(await IdleToken.balanceOf(accountAddress));
    console.log("before", toIdleUnitString(idleBalanceBefore))
    console.log("after ", toIdleUnitString(idleBalanceAfter))
    checkIncreased(idleBalanceBefore, idleBalanceAfter);
  }

  await deposit(user.address, 10);

  const versionRecipientBefore = "2.0.0-alpha.1+opengsn.test.recipient";
  const trustedForwarderAddressBefore = trustedForwarder.address;
  const versionRecipientAfter = "3.0.0-test";
  const trustedForwarderAddressAfter = "0x0000000000000000000000000000000000000001";

  check((await depositForwarder.versionRecipient()), versionRecipientBefore);
  check((await depositForwarder.trustedForwarder()), trustedForwarderAddressBefore);

  try {
    await depositForwarder.connect(user).setBiconomyConfig(versionRecipientAfter, trustedForwarderAddressAfter);
    console.error("\n🚨🚨🚨 setBiconomyConfig sent from a normal user should have failed.\n");
    process.exit(1);
  } catch(err) {
    console.log("✔️ expected error since normal user cannot call setBiconomyConfig: ", err);
  }

  await depositForwarder.connect(owner).setBiconomyConfig(versionRecipientAfter, trustedForwarderAddressAfter);

  check((await depositForwarder.versionRecipient()), versionRecipientAfter);
  check((await depositForwarder.trustedForwarder()), trustedForwarderAddressAfter);
}

const main = async () => {
  for (var i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    console.log("➡️  STARTING NEW SCENARIO ⬅️");
    await start(s);
  };
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
