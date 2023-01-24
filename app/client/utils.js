

export async function handleResponse(response) {
    return new Promise(function (resolve, reject) {
        if (response.status >= 200 && response.status <= 299) {
            response.json().then(resolve);
        } else {
            response
                .json()
                .then(reject)
                .catch(() => reject(response.statusText));
        }
    });
}

const byteToHex = [];
for (let n = 0; n <= 0xff; ++n) {
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

export function uint8ArrayToHex(bytes) {
    const buff = new Uint8Array(bytes);
    const hexOctets = new Array(buff.length);

    for (let i = 0; i < buff.length; ++i) {
        hexOctets[i] = byteToHex[buff[i]];
    }

    return hexOctets.join("");
}


export function handleError(e, step) {
    $('#btnSwap').prop('disabled', false);
    $('#nbTokensToSwap').prop('disabled', false);
    $('#recipientAddress').prop('disabled', false);
    $("#btnSwap").show();
    $("#btnSwapSpinner").hide();

    console.error(e.message || e);
    $("#error")
        .text(`${e.message || e}`)
        .show();
    console.log(step);
    switch (step) {
        case 1:
            $("#ethDeploymentStep").removeClass("is-active");
            $("#ethDeploymentStep").addClass("is-failed");
            $("#ethTransferStep").addClass("is-failed");
            break;
        case 2:
            $("#ethTransferStep").removeClass("is-active");
            $("#ethTransferStep").addClass("is-failed");
            break;
        case 3:
            $("#archethicDeploymentStep").removeClass("is-active");
            $("#archethicDeploymentStep").addClass("is-failed");
            break;
        case 4:
            $("#swapStep").removeClass("is-active");
            $("#swapStep").addClass("is-failed");
            break;
        default:
            break;
    }
}
