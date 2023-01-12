 pragma solidity ^0.5.0;

 import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

 contract HTLC {
   uint public startTime;
   uint public lockTime = 10000 seconds;
   bytes32 public secret;
   bytes32 public hash;
   address public recipient;
   address public owner;
   uint256 public amount;
   IERC20 public token;

   constructor(address _recipient, address _token, uint256 _amount, bytes32 _hash, uint _lockTime) public {
     recipient = _recipient;
     owner = msg.sender;
     amount = _amount;
     token = IERC20(_token);
     hash = _hash;
     startTime = block.timestamp;
     lockTime = _lockTime;
   }

   function withdraw(bytes32 _secret) public {
     require(block.timestamp < startTime + lockTime, 'too late');
     require(sha256(abi.encodePacked(_secret)) == hash, 'wrong secret');
     require(token.balanceOf(address(this)) > 0, 'not enough funds');
     secret = _secret;
     token.transfer(recipient, amount);
   }

   function refund() public {
     require(block.timestamp > startTime + lockTime, 'too early');
     token.transfer(owner, amount);
   }
 }
