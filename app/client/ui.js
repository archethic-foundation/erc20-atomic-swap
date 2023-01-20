
export function initPageBridge() {

    $("#connectMetamaskBtnSpinner").hide();
    $("#connectMetamaskBtn").show();

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

export function initTransfer() {
    initTxSummary();
    changeBtnToTransferInProgress();
    $("#steps").hide();
    initProgressBar();
    $("#error").text("");

}

function changeBtnToTransferInProgress() {
    $("#btnSwap").hide();
    $('#btnSwapSpinner').prop('disabled', true);
    $("#btnSwapSpinner").show();
    $("#btnSwapSpinnerText").show();
}

function initTxSummary() {
    $("#txSummary1Label").text("");
    $("#txSummary1").hide();
    $("#txSummary2Label").text("");
    $("#txSummary2").hide();
    $("#txSummary3Label").text("");
    $("#txSummary3").hide();
    $("#txSummary4Label").text("");
    $("#txSummary4").hide();
    $("#txSummary5Label").text("");
    $("#txSummary5").hide();
}

export function initProgressBar() {

    $("#ethDeploymentStep").removeClass("is-active");
    $("#ethDeploymentStep").removeClass("is-failed");
    $("#ethTransferStep").removeClass("is-active");
    $("#ethTransferStep").removeClass("is-failed");
    $("#archethicDeploymentStep").removeClass("is-active");
    $("#archethicDeploymentStep").removeClass("is-failed");
    $("#swapStep").removeClass("is-active");
    $("#swapStep").removeClass("is-failed");
}
