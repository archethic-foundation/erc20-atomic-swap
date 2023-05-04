import Archethic, { Crypto as AECrypto, Utils } from "archethic";

const endpoint = process.env["ARCHETHIC_ENDPOINT"] || "https://mainnet.archethic.net";

const bridgeAddress = process.env["ARCHETHIC_BRIDGE_SEED"] || "00001819800e90bd6abc80408947b125a67bc1959d955997567e62caff71ea7434dd"

const fundingSeed = process.env["ARCHETHIC_FUNDING_SEED"];
if (!fundingSeed) {
  throw new Error("ARCHETHIC_FUNDING_SEED env var is undefined");
}

const archethic = new Archethic(endpoint);

try {
  await archethic.connect();
} catch (error) {
  console.log(`Error connecting to Archethic: ${error}`);
  process.exit(1);
}

let retry = 0

async function refill(amount) {
  const fundingGenesisAddress = AECrypto.deriveAddress(fundingSeed, 0);

  const lastIndex = await archethic.transaction.getTransactionIndex(
    fundingGenesisAddress
  );

  try {
    const tx = archethic.transaction.new()
      .setType("transfer")
      .addUCOTransfer(bridgeAddress, amount)
      .build(fundingSeed, lastIndex)
      .originSign(Utils.originPrivateKey);

    return new Promise((resolve, reject) => {
      tx.on("error", (context, reason) => {
        console.log("Error: ", reason)
        if (retry == 10) {
          return reject(reason)
        }
        retry += 1
        console.log(`Retry #${retry}`)
        setTimeout(async () => {
          await refill(amount)
          resolve()
        }, 10000)
      })
      .on("requiredConfirmation", () => {
        console.log(`${Utils.fromBigInt(amount)} UCO sent to the bridge (tx address: ${Utils.uint8ArrayToHex(tx.address)})`);
        resolve();
      })
      .on("timeout", () => {
        reject("Timeout")
      })
      .send(50);
    })

  } catch (error) {
    console.error(`Error creating transaction: ${error}`);
    throw error;
  }
}


const { lastTransaction: { balance: {uco: ucoBalance }} } = await archethic.network.rawGraphQLQuery(`
  query {
    lastTransaction(address: "${bridgeAddress}") {
      balance{
        uco
      }
    }
  }
`);

console.log(`Bridge's balance is ${Utils.fromBigInt(ucoBalance)} UCO`)

if (ucoBalance < Utils.toBigInt(10000)) { 
  const amountToFill = Utils.toBigInt(100000);

  try {
    await refill(amountToFill);
  } catch (error) {
    console.log(`Error refilling bridge: ${error}`);
    process.exit(1);
  }

  process.exit(0);
}

console.log("No need to send UCO to the bridge");
process.exit(0);