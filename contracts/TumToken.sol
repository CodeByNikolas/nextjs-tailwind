// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TumToken is ERC20 {
  uint256 public constant CLAIM_AMOUNT = 100 * 10 ** 18;
  uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

  mapping(address account => bool claimed) public hasClaimed;

  event TokensClaimed(address indexed account, uint256 amount);

  constructor() ERC20("TUM Blockchain Club Token", "TUMBC") {
    _mint(msg.sender, INITIAL_SUPPLY);
  }

  function claim() external {
    require(!hasClaimed[msg.sender], "TumToken: already claimed");

    hasClaimed[msg.sender] = true;
    _mint(msg.sender, CLAIM_AMOUNT);

    emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
  }
}
