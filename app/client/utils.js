import { getHTLCLockTime } from "./contract"

export async function handleResponse(response) {
  return new Promise(function(resolve, reject) {
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


export async function handleError(e, step, state) {
  $('#btnSwap').prop('disabled', false);
  $('#nbTokensToSwap').prop('disabled', false);
  $('#recipientAddress').prop('disabled', false);
  $("#btnSwap").show();
  $("#btnSwapSpinner").hide();

  console.error(e.message || e);
  $("#error")
    .text(`${e.message || e}`)
    .show();
  $("#close").show();

  switch (step) {
    case 1:
      $("#ethDeploymentStep").removeClass("is-active is-failed");
      $("#ethTransferStep").removeClass("is-active")
      $("#ethTransferStep").addClass("is-failed");
      $("#archethicDeploymentStep").addClass("is-failed");
      $("#swapStep").addClass("is-failed");
      break;
    case 2:
      $("#ethTransferStep").addClass("is-failed");
      $("#ethTransferStep").removeClass("is-active");
      $("#ethDeploymentStep").removeClass("is-active is-failed")
      break;
    case 3:
      $("#archethicDeploymentStep").addClass("is-failed");
      $("#archethicDeploymentStep").removeClass("is-active");
      $("#ethDeploymentStep").removeClass("is-active is-failed")
      $("#ethTransferStep").removeClass("is-active is-failed")
      break;
    case 4:
      $("#ethDeploymentStep").removeClass("is-active is-failed")
      $("#ethTransferStep").removeClass("is-active is-failed")
      $("#archethicDeploymentStep").removeClass("is-active is-failed");
      $("#swapStep").addClass("is-failed");
      $("#swapStep").removeClass("is-active");
      break;
    default:
      break;
  }

  if (state && state.HTLC_Contract) {
    const endDate = await getHTLCLockTime(state.HTLC_Contract)
    updateClock(endDate);
    $("#txSummary2Timer").show();
  }
}

export function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  return {
    'total': t,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

export function updateClock(endtime) {
  let timeinterval = setInterval(function() {
    var t = getTimeRemaining(endtime);
    if (t.total <= 0) {
      clearInterval(timeinterval);
      $("#txSummary2Timer").html(`<img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />As the transfer is not effective, you can retrieve your funds by clicking on the following button (fees not included).<img src="assets/images/refund_btn.svg" height="20" alt="Refund" style="padding-left: 5px; padding-right: 5px; padding-bottom: 5px; cursor: pointer;" onclick="" /><img src="assets/images/icons/help.png" height="20" alt="" style="padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge');" />`);
    }
    else {
      $("#txSummary2Timer").html(`<img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />As the transfer is not effective, you can retrieve your funds in ` + ('0' + t.hours).slice(-2) + 'h' + ('0' + t.minutes).slice(-2) + 'm' + ('0' + t.seconds).slice(-2) + `.<img src="assets/images/icons/help.png" height="20" alt="" style="padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge');" />`);
    }
  }, 1000);
}

