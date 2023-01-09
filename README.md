# Archethic ERC20 Atomic Swap

The project contains the application able to make the atomic swap between ERC20's UCOs to Archethic's UCOs

It is composed of two applications:

- Truffle App (for the Solidity smart contracts)
- Bridge's app (UI + API)

## Development

In order to develop and test the applications, you need to have some prerequisites:

- [Ganache installed](https://trufflesuite.com/ganache/) (Simulation of the Ethereum's node)
- NodeJS

### Uniris's token deployment

In order to create the token on ethereum, you need to:

- Start ganache with network id (1337) and use the mnemonic `test`
- Execute the following command to deploy the contract

```bash
cd truffle
npm install -g truffle
npm install
truffle deploy --network development
```

This will deploy the contract.

### Start the bridge's app

You need to execute the following commands:

```bash
cd app
npm install
ARCHETHIC_ENDPOINT=https://testnet.archethic.net npm run start
```

The application will be started and available at http://localhost:3000

This command connects to the bridge to the Archethic's testnet.

If you wish to use a local node, you have to start it before to start the app.
Then change the environment variable ARCHETHIC_ENDPOINT and funds the bridge address

### Use the app

After opening http://localhost:3000, you have to connect your metamask to the Ganache instance, to be able to use it with funds.
