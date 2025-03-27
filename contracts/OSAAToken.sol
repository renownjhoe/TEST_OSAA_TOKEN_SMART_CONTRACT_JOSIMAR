// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract OSAAToken is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    string public name = "OSAA Token";
    string public symbol = "OSAA";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 amount);

    constructor(uint256 initialSupply) {
        require(initialSupply > 0, "Initial supply must be greater than 0");
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply;
    }

    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }

    function transferTokens(address to, uint256 amount) public nonReentrant {
        require(to != address(0), "Cannot transfer to the zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[to] = balances[to].add(amount);
        emit Transfer(msg.sender, to, amount);
    }

    function mint(address to, uint256 amount) public onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to the zero address");
        totalSupply = totalSupply.add(amount);
        balances[to] = balances[to].add(amount);
        emit Mint(to, amount);
    }
}