// SPDX-License-Identifier:MIT
pragma solidity ^0.6.2;

/**
 * A base contract to be inherited by any contract that want to receive relayed transactions
 * A subclass must use "_msgSender()" instead of "msg.sender"
 */
contract TestForwarder {
  function execute(address target, string memory sig, bytes memory data) public {
    bytes memory callData = abi.encodePacked(bytes4(keccak256(bytes(sig))), data, msg.sender);
    (bool success,) = target.call(callData);
    require(success, "error executing tx");
  }
}
