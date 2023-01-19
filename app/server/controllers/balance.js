import { archethicConnection } from "../utils.js";
import fetch from "cross-fetch"

export default {
    getArchethicBalance
}

async function getArchethicBalance(req, res, next) {
    try {
      
        const address = req.params.address
        const balance = await getBalance(address)

        res.json({ balance: balance })
    }
    catch (e) {
        next(e)
    }
}

async function getBalance(address) {
  
    const archethic  = await archethicConnection()
    
    return archethic.requestNode(async (endpoint) => {
        const url = new URL("/api", endpoint);
        const r = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: `
            query {
              lastTransaction(address: "${address}") {
                 balance {
                   uco
                 }
              }
            }
          `,
            }),
        });
        if (r.status != 200) {
          throw "Node not available. Switch to another"
        }
        const res = await r.json();

        if (
            res.errors &&
            res.errors.find((x) => x.message == "transaction_not_exists")
        ) {
            return await getInputs(address, archethic);
        }

        if (res.data.lastTransaction && res.data.lastTransaction.balance) {
            return res.data.lastTransaction.balance.uco;
        }

        return 0;
    });
}

async function getInputs(address, archethic) {
    return archethic.requestNode(async (endpoint) => {
        const url = new URL("/api", endpoint);
        const r = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query: `
            query {
              transactionInputs(address: "${address}") {
                 type,
                 amount
              }
            }
          `,
            }),
        });
        const res = await r.json();
        if (res.data.transactionInputs && res.data.transactionInputs.length > 0) {
            return res.data.transactionInputs
                .filter((r) => r.type == "UCO")
                .reduce((acc, { amount: amount }) => acc + amount, 0);
        }
        return 0;
    });
}

