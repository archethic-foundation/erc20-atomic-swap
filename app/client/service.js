import { handleResponse } from "./utils.js";

export async function getArchethicBalance(address) {
    return fetch(`/balances/archethic/${address}`)
        .then(handleResponse)
        .then((r) => {
            return r.balance
        });
}