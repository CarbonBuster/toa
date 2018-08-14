pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TestToken is StandardToken {
    constructor(){
        totalSupply_ = 1000000000000000000000;
        balances[msg.sender] = totalSupply_;
    }
}