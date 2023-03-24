 pragma solidity ^0.5.0;

 import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

 contract HTLC {
   uint public startTime;
   uint public lockTime;
   bytes32 public secret;
   bytes32 public hash;
   address public recipient;
   address public owner;
   uint256 public amount;
   IERC20 public token;
   bool public finished;

   constructor(address _recipient, address _token, uint256 _amount, bytes32 _hash, uint _lockTime) public {
     recipient = _recipient;
     owner = msg.sender;
     amount = _amount;
     token = IERC20(_token);
     hash = _hash;
     startTime = block.timestamp;
     lockTime = _lockTime;
     finished = false;
   }

   function withdraw(bytes32 _secret) public {
     require(finished == false, 'Swap already done');
     require(sha256(abi.encodePacked(_secret)) == hash, 'Wrong secret');
     require(token.balanceOf(address(this)) > 0, 'Not enough funds');
     require(block.timestamp < startTime + lockTime, 'Withdraw delay outdated, use refund');
     secret = _secret;
     token.transfer(recipient, amount);
     finished = true;
   }

   function refund() public {
     require(finished == false, 'Swap already done');
     require(block.timestamp >= startTime + lockTime, 'Too early');
     token.transfer(owner, amount);
     finished = true;
   }
 }
