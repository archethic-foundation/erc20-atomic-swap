
export function initPageBridge() {
  $("#main").hide();
  $("#swapForm").show();

  $('#nbTokensToSwap').prop('disabled', false);
  $('#recipientAddress').prop('disabled', false);

  initTxSummary();

  $("#error").text("");

  $('#btnSwap').prop('disabled', true);
  $("#btnSwap").text("Transfer");
  $("#btnSwap").show();
  $("#btnSwapSpinner").hide();
  $("#btnSwapSpinnerText").hide();

  initProgressBar();
}

export function initReConnectionScreen() {
  $("#connectionError").text('').hide();
  $("#connectMetamaskBtn").hide();
  $("#connectMetamaskBtnSpinner").show();
  $("#swapForm").hide();
  $("#main").show();
}

export function displayConnectionError(error) {
  $("#connectMetamaskBtnSpinner").hide();
  $("#connectMetamaskBtn").show();
  $("#connectionError").text(error).show();
}

export function initTransfer() {
  initTxSummary();
  changeBtnToTransferInProgress();
  $("#steps").hide();
  initProgressBar();
  $("#error").text("");

}

export function changeBtnToTransferInProgress() {
  $("#btnSwap").hide();
  $('#btnSwapSpinner').prop('disabled', true);
  $("#btnSwapSpinner").show();
  $("#btnSwapSpinnerText").show();
  $("#workflow").show();
  $("#close").hide();
}

function initTxSummary() {
  $("#txSummary1Label").text("");
  $("#txSummary1").hide();
  $("#txSummary2Label").text("");
  $("#txSummary2").hide();
  $("#txSummary2Timer").hide();
  $("#txSummary3Label").text("");
  $("#txSummary3").hide();
  $("#txSummary4Label").text("");
  $("#txSummary4").hide();
  $("#txSummary5Label").text("");
  $("#txSummary5").hide();
  $("#txSummary6Label").text("");
  $("#txSummary6").hide();
  $("#txSummary7Label").text("");
  $("#txSummary7").hide();
  $("#txSummaryFinished").hide();
}

function initProgressBar() {

  $("#ethDeploymentStep").removeClass("is-active");
  $("#ethDeploymentStep").removeClass("is-failed");
  $("#ethTransferStep").removeClass("is-active");
  $("#ethTransferStep").removeClass("is-failed");
  $("#archethicDeploymentStep").removeClass("is-active");
  $("#archethicDeploymentStep").removeClass("is-failed");
  $("#swapStep").removeClass("is-active");
  $("#swapStep").removeClass("is-failed");
}
