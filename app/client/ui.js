
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
  $("#txSummaryRefundFinished").hide();
  $("#txRefundTransactionLabel").text("");
  $("#txRefundTransaction").hide();
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

export function showConfirmationDialog(title, message, callback) {
  var dialog = $('<div></div>').html(message)
    .dialog({
      title: title,
      resizable: false,
      modal: true,
      buttons: {
        "Yes": function () {
          callback(true);
          $(this).dialog("close");
        },
        "No": function () {
          callback(false);
          $(this).dialog("close");
        }
      },
      open: function (event, ui) {
        $(this).parent().css({
          'background': 'linear-gradient(135deg, rgba(0, 164, 219, 0.9) -10%, rgba(204, 0, 255, 0.9) 100%)'
        });
        $(this).css({
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '12px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
        $(this).prev('.ui-widget-content').css({
          'background': 'transparent',
          'border': 'none',
        });
        $(this).prev('.ui-dialog-titlebar').css({
          'background': 'transparent',
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px 10px 0 0',
          'letter-spacing': '2.56232px'
        });
        $(this).find('.ui-dialog-buttonset').css({
          'background': 'transparent',
          'font-family': 'Lato',
          'font-size': '14px',
          'letter-spacing': '2.56232px'
        });
        $(this).find('.ui-dialog-buttonpane button').css({
          'background': 'transparent',
          'color': 'black',
          'font-family': 'Lato',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
        $(this).closest('.ui-dialog').find('.my-button-class').css({
          'margin-right': '20px',
          'font-family': 'Lato, sans-serif',
          'background-color': 'transparent'
        });
      }
    });
}