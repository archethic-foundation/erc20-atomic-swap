// Fetch the UnirisToken contract
var UnirisToken = artifacts.require("UnirisToken.sol");

// JavaScript export
module.exports = async function(deployer, network, accounts) {
  let funding_pool_benificiary
  let deliverables_beneficiary
  let network_pool_beneficiary
  let enhancement_beneficiary
  let team_beneficiary
  let exch_pool_beneficiary
  let marketing_beneficiary
  let foundation_beneficiary

  funding_pool_benificiary = accounts[0]
  deliverables_beneficiary = accounts[1]
  network_pool_beneficiary = accounts[2]
  enhancement_beneficiary = accounts[3]
  team_beneficiary = accounts[4]
  exch_pool_beneficiary = accounts[5]
  marketing_beneficiary = accounts[6]
  foundation_beneficiary = accounts[7]

  // Deploy the contract to the network
  deployer.deploy(UnirisToken,
    funding_pool_benificiary,
    deliverables_beneficiary,
    network_pool_beneficiary,
    enhancement_beneficiary,
    team_beneficiary,
    exch_pool_beneficiary,
    marketing_beneficiary,
    foundation_beneficiary);
}
