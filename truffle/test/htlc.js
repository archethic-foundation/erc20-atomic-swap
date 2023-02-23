const web3 = require("web3")
const UnirisToken = artifacts.require("UnirisToken")
const HTLC = artifacts.require("HTLC")

const { createHash, randomBytes } = require("crypto")

contract("HTLC", (accounts) => {
  it("should create contract", async () => {
    const UnirisTokenInstance = await UnirisToken.deployed()
    const recipientEthereum = accounts[2]


    const HTLCInstance = await HTLC.new(
      recipientEthereum,
      UnirisTokenInstance.address,
      web3.utils.toWei("1"),
      "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      1
    )
  })

  it("should withdraw the funds with the hash preimage reveal", async () => {
    const UnirisTokenInstance = await UnirisToken.deployed()
    const recipientEthereum = accounts[2]

    const amount = web3.utils.toWei('1')
    const secret = randomBytes(32)
    const secretHash = createHash("sha256")
      .update(secret)
      .digest("hex")

    const HTLCInstance = await HTLC.new(
      recipientEthereum,
      UnirisTokenInstance.address,
      amount,
      `0x${secretHash}`,
      60
    )

    await UnirisTokenInstance.transfer(HTLCInstance.address, amount);

    const balance1 = await UnirisTokenInstance.balanceOf(recipientEthereum)

    await HTLCInstance.withdraw(`0x${secret.toString('hex')}`, { from: accounts[2] })

    const balance2 = await UnirisTokenInstance.balanceOf(recipientEthereum)
    assert.equal(1, web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1))
  })

  it("should refund the owner after the lock time", async () => {
    const UnirisTokenInstance = await UnirisToken.deployed()
    const recipientEthereum = accounts[2]

    const amount = web3.utils.toWei('1')
    const secret = randomBytes(32)
    const secretHash = createHash("sha256")
      .update(secret)
      .digest("hex")

    const balance1 = await UnirisTokenInstance.balanceOf(accounts[0])

    const HTLCInstance = await HTLC.new(
      recipientEthereum,
      UnirisTokenInstance.address,
      amount,
      `0x${secretHash}`,
      1
    )

    setTimeout(async () => {
      await UnirisTokenInstance.transfer(HTLCInstance.address, amount);
      await HTLCInstance.refund()
      const balance2 = await UnirisTokenInstance.balanceOf(accounts[0])
      assert.equal(1, web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1))
    }, 2000);
  })
})
