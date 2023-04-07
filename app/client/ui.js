
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
        $(this).css({
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '12px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
        $('.ui-dialog').css({
          'border-radius': '20px',
        });
        $('.ui-dialog-titlebar').css({
          'background': 'transparent',
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px 10px 0 0',
          'letter-spacing': '2.56232px'
        });
        $('.ui-widget-content').css({
          'background': '#1a1a1a',

        });
        $('.ui-dialog .ui-dialog-content').css({
          'background': 'transparent',
        });
        $('.ui-dialog-buttonpane .ui-widget-content .ui-helper-clearfix').css({
          'background': 'transparent',
        });
        $('.ui-dialog-buttonpane').css({
          'background': 'transparent'
        });
        $(this).parent().find('.ui-dialog-buttonset button:first-child').css({
          'margin-right': '30px'
        });
        $(this).parent().find('.ui-dialog-buttonset button').hover(
          function () {
            $(this).css({
              'color': '#b0b0b0'
            });
          }, function () {
            $(this).css({
              'color': 'white'
            });
          }
        );
        $('.ui-dialog-buttonpane button').css({
          'background': 'transparent',
          'color': 'white',
          'font-family': 'Lato',
          'font-weight': '400',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
      }
    });
}


export function showRefundDialog(title, message, callback) {
  var input = $("<input>").attr({
    "type": "text",
    "size": "50"
  });
  var dialog = $("<div>").html(message).append("<br/><br/>").append(input)
    .dialog({
      title: title,
      resizable: false,
      modal: true,
      buttons: {
        "Cancel": function () {
          callback(false);
          $(this).dialog("close");
        },
        "Validate": function () {
          var contractAddress = input.val();
          console.log('Refund: contract = ' + contractAddress);
          if (isValidERC20Address(contractAddress)) {
            callback(true, contractAddress);
            $(this).dialog("close");
          } else {
            alert("Please enter a valid ERC20 address");
          }
        }
      },
      open: function (event, ui) {
        input.css({
          'border-radius': '10px',
          'font-family': 'Lato',
          'font-weight': '700',
          'font-size': '14px',
          'line-height': '17px',
          'color': '#FFFFFF',
          'border': 'none',
          'background': '#000000',
          'padding': '10px',
          'letter-spacing': '2.56232px'
        });
        $(this).css({
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '12px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
        $('.ui-dialog').css({
          'width': '450px',
          'border-radius': '20px',
        });
        $('.ui-dialog-titlebar').css({
          'background': 'transparent',
          'color': 'white',
          'font-family': 'Lato',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px 10px 0 0',
          'letter-spacing': '2.56232px'
        });
        $('.ui-widget-content').css({
          'background': '#1a1a1a',

        });
        $('.ui-dialog .ui-dialog-content').css({
          'background': 'transparent',
        });
        $('.ui-dialog-buttonpane .ui-widget-content .ui-helper-clearfix').css({
          'background': 'transparent',
        });
        $('.ui-dialog-buttonpane').css({
          'background': 'transparent'
        });
        $(this).parent().find('.ui-dialog-buttonset button:first-child').css({
          'margin-right': '30px'
        });
        $(this).parent().find('.ui-dialog-buttonset button').hover(
          function () {
            $(this).css({
              'color': '#b0b0b0'
            });
          }, function () {
            $(this).css({
              'color': 'white'
            });
          }
        );
        $('.ui-dialog-buttonpane button').css({
          'background': 'transparent',
          'color': 'white',
          'font-family': 'Lato',
          'font-weight': '400',
          'font-size': '14px',
          'border': 'none',
          'border-radius': '10px',
          'letter-spacing': '2.56232px'
        });
      }
    });
}

function isValidERC20Address(address) {
  // Check if address matches ERC20 format, return true or false
  return ethers.utils.isAddress(address);
}
