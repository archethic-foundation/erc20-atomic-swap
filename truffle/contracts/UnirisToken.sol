pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";

contract UnirisToken is ERC20Pausable, ERC20Detailed {

  //38.2% for the sale
  uint256 public constant funding_pool_supply = 3820000000000000000000000000;

  //23.6% for the deliverables (10% will be available before the mainnet for early contributions)
  uint256 public constant deliverable_supply = 2360000000000000000000000000;

  //14.6% for the network pool (10% will be available before the mainnet for early nodes)
  uint256 public constant network_pool_supply = 1460000000000000000000000000;

  //9% for the enhancements (locked until mainnet)
  uint256 public constant enhancement_supply = 900000000000000000000000000;

  //5.6% for the team
  uint256 public constant team_supply = 560000000000000000000000000;

  //3.4% for the Exch. Pool
  uint256 public constant exch_pool_supply = 340000000000000000000000000;

  //3.4% for the marketing
  uint256 public constant marketing_supply = 340000000000000000000000000;

  //2.2% for the foundation
  uint256 public constant foundation_supply = 220000000000000000000000000;

  address public funding_pool_beneficiary;
  address public deliverables_beneficiary;
  address public network_pool_beneficiary;
  address public enhancement_beneficiary;
  address public team_beneficiary;
  address public exch_pool_beneficiary;
  address public marketing_beneficiary;
  address public foundation_beneficiary;

  modifier onlyUnlocked(address from, uint256 value) {
    // Enhancement wallet is locked until the mainnet, no transfer possible
    // The swap will be done directly on the Uniris chain
    require(from != enhancement_beneficiary, "Enhancement wallet is locked forever until mainnet");

    //Deliverable and network pool are only unlocked for 10% of their supply
    //These 10% will serve to rewards early contributors and nodes before mainnet.
    //The rest is locked until the main, no transfer possible
    //The swap will be done directly on the Uniris chain
    if (from == deliverables_beneficiary) {
      uint256 _delivered = deliverable_supply - balanceOf(deliverables_beneficiary);
      require(_delivered.add(value) <= deliverable_supply.mul(10).div(100), "Only 10% of the deliverable supply is unlocked before mainnet");
    }
    else if (from == network_pool_beneficiary) {
      uint256 _delivered = network_pool_supply - balanceOf(network_pool_beneficiary);
      require(_delivered.add(value) <= network_pool_supply.mul(10).div(100), "Only 10% of the network supply is unlocked before mainnet");
    }
    _;
  }

  constructor(
    address _funding_pool_beneficiary,
    address _deliverables_beneficiary,
    address _network_pool_beneficiary,
    address _enhancement_beneficiary,
    address _team_beneficiary,
    address _exch_pool_beneficiary,
    address _marketing_beneficiary,
    address _foundation_beneficiary
    ) public ERC20Detailed("UnirisToken", "UCO", 18) {

    require(_funding_pool_beneficiary != address(0), "Invalid funding pool beneficiary address");
    require(_deliverables_beneficiary != address(0), "Invalid deliverables beneficiary address");
    require(_network_pool_beneficiary != address(0), "Invalid network pool beneficiary address");
    require(_enhancement_beneficiary != address(0), "Invalid enhancement beneficiary address");
    require(_team_beneficiary != address(0), "Invalid team beneficiary address");
    require(_exch_pool_beneficiary != address(0), "Invalid exch pool beneficiary address");
    require(_marketing_beneficiary != address(0), "Invalid marketing beneficiary address");
    require(_foundation_beneficiary != address(0), "Invalid foundation beneficiary address");

    funding_pool_beneficiary = _funding_pool_beneficiary;
    deliverables_beneficiary = _deliverables_beneficiary;
    network_pool_beneficiary = _network_pool_beneficiary;
    enhancement_beneficiary = _enhancement_beneficiary;
    team_beneficiary = _team_beneficiary;
    exch_pool_beneficiary = _exch_pool_beneficiary;
    marketing_beneficiary = _marketing_beneficiary;
    foundation_beneficiary = _foundation_beneficiary;

    _mint(funding_pool_beneficiary, funding_pool_supply);
    _mint(deliverables_beneficiary, deliverable_supply);
    _mint(network_pool_beneficiary, network_pool_supply);
    _mint(enhancement_beneficiary, enhancement_supply);
    _mint(team_beneficiary, team_supply);
    _mint(exch_pool_beneficiary, exch_pool_supply);
    _mint(marketing_beneficiary, marketing_supply);
    _mint(foundation_beneficiary, foundation_supply);
  }

  function transfer(address _to, uint256 _value) public onlyUnlocked(msg.sender, _value) returns (bool success) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public onlyUnlocked(_from, _value) returns (bool success) {
    return super.transferFrom(_from, _to, _value);
  }
}
