(()=>{function j(){$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),z(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),$("#btnSwapSpinnerText").hide(),$("#infoRefund").hide(),V()}function J(){$("#connectionError").text("").hide(),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),$("#swapForm").hide(),$("#main").show()}function E(t){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#connectionError").text(t).show()}function W(){z(),B(),$("#steps").hide(),V(),$("#error").text("")}function B(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").show(),$("#btnSwapSpinnerText").show(),$("#workflow").show(),$("#close").hide()}function z(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary2Timer").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide(),$("#txSummary6Label").text(""),$("#txSummary6").hide(),$("#txSummary7Label").text(""),$("#txSummary7").hide(),$("#txSummaryFinished").hide(),$("#txSummaryRefundFinished").hide(),$("#txRefundTransactionLabel").text(""),$("#txRefundTransaction").hide()}function V(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}function q(t,a,n){var o=$("<div></div>").html(a).dialog({title:t,resizable:!1,modal:!0,buttons:{No:function(){n(!1),$(this).dialog("close")},Yes:function(){n(!0),$(this).dialog("close")}},open:function(i,s){$(this).css({color:"white","font-family":"Lato","font-size":"12px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"}),$(".ui-dialog").css({"border-radius":"20px"}),$(".ui-dialog-titlebar").css({background:"transparent",color:"white","font-family":"Lato","font-size":"14px",border:"none","border-radius":"10px 10px 0 0","letter-spacing":"2.56232px"}),$(".ui-widget-content").css({background:"#1a1a1a"}),$(".ui-dialog .ui-dialog-content").css({background:"transparent"}),$(".ui-dialog-buttonpane .ui-widget-content .ui-helper-clearfix").css({background:"transparent"}),$(".ui-dialog-buttonpane").css({background:"transparent"}),$(this).parent().find(".ui-dialog-buttonset button:first-child").css({"margin-right":"30px"}),$(this).parent().find(".ui-dialog-buttonset button").hover(function(){$(this).css({color:"#b0b0b0"})},function(){$(this).css({color:"white"})}),$(".ui-dialog-buttonpane button").css({background:"transparent",color:"white","font-family":"Lato","font-weight":"400","font-size":"14px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"})}})}function G(t,a,n){var o=$("<input>").attr({type:"text",size:"50"}),i=$("<div>").html(a).append("<br/><br/>").append(o).dialog({title:t,resizable:!1,modal:!0,buttons:{Cancel:function(){n(!1),$(this).dialog("close")},Validate:function(){var s=o.val();ce(s)?(n(!0,s),$(this).dialog("close")):alert("Please enter a valid ERC20 address")}},open:function(s,r){o.css({"border-radius":"10px","font-family":"Lato","font-weight":"700","font-size":"14px","line-height":"17px",color:"#FFFFFF",border:"none",background:"#000000",padding:"10px","letter-spacing":"2.56232px"}),$(this).css({color:"white","font-family":"Lato","font-size":"12px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"}),$(".ui-dialog").css({width:"450px","border-radius":"20px"}),$(".ui-dialog-titlebar").css({background:"transparent",color:"white","font-family":"Lato","font-size":"14px",border:"none","border-radius":"10px 10px 0 0","letter-spacing":"2.56232px"}),$(".ui-widget-content").css({background:"#1a1a1a"}),$(".ui-dialog .ui-dialog-content").css({background:"transparent"}),$(".ui-dialog-buttonpane .ui-widget-content .ui-helper-clearfix").css({background:"transparent"}),$(".ui-dialog-buttonpane").css({background:"transparent"}),$(this).parent().find(".ui-dialog-buttonset button:first-child").css({"margin-right":"30px"}),$(this).parent().find(".ui-dialog-buttonset button").hover(function(){$(this).css({color:"#b0b0b0"})},function(){$(this).css({color:"white"})}),$(".ui-dialog-buttonpane button").css({background:"transparent",color:"white","font-family":"Lato","font-weight":"400","font-size":"14px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"})}})}function ce(t){return ethers.utils.isAddress(t)}async function Q(t,a){let n=await ue();return new ethers.Contract(t,n,a)}async function A(t,a){let{abi:n}=await te();return new ethers.Contract(t,n,a)}async function Y(t,a,n,o,i,s){let{abi:r,bytecode:c}=await te(),l=await new ethers.ContractFactory(r,c,i).deploy(t,a,ethers.utils.parseUnits(n,18),o,s,{gasLimit:1e6}),p=await l.deployTransaction.wait();return console.log("HTLC contract deployed at "+l.address),{contract:l,transaction:p}}async function le(t,a,n,o){return await(await n.connect(o).transfer(a,ethers.utils.parseUnits(t,18))).wait()}async function K(t){let{HTLC_Contract:a,amount:n,unirisContract:o,signer:i,sourceChainExplorer:s}=t;$("#ethTransferStep").addClass("is-active");let r=await le(n,a.address,o,i);localStorage.setItem("transferStep","transferedERC20");let c=localStorage.getItem("pendingTransfer"),h=JSON.parse(c);return h.erc20transferAddress=r.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`${n} UCO transfered`),$("#txSummary2Label").html(`Provision UCOs: <a href="${s}/tx/${r.transactionHash}" target="_blank">${r.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),t.erc20transferAddress=r.transactionHash,t}async function X(t){let{HTLC_Contract:a,amount:n,secretDigestHex:o,recipientArchethic:i,ethChainId:s,toChainExplorer:r,HTLC_transaction:c}=t;$("#archethicDeploymentStep").addClass("is-active"),step=3;let h=await de(o,i,n,a.address,c.transactionHash,s);localStorage.setItem("transferStep","deployedArchethicContract");let l=localStorage.getItem("pendingTransfer"),p=JSON.parse(l);return p.archethicContractAddress=h,localStorage.setItem("pendingTransfer",JSON.stringify(p)),console.log("Contract address on Archethic",h),$("#txSummary3Label").html(`Contract address on Archethic: <a href="${r}/${h}" target="_blank">${h}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),t.archethicContractAddress=h,t}async function Z(t){let{HTLC_Contract:a,signer:n,secretHex:o,unirisContract:i,UCOPrice:s,sourceChainExplorer:r}=t,c=await he(a,n,o);localStorage.setItem("transferStep","withdrawEthContract");let h=localStorage.getItem("pendingTransfer"),l=JSON.parse(h);l.withdrawEthereumAddress=c.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(l)),console.log(`Ethereum's withdraw transaction - ${c.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${r}/tx/${c.transactionHash}" target="_blank">${c.transactionHash}</a>`),$("#txSummary4").show();let p=await n.getAddress(),u=await i.balanceOf(p),b=ethers.utils.formatUnits(u,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(b).toFixed(2)));let x=20/s;return $("#maxUCOValue").text(Math.min(b/s,x).toFixed(5)),$("#fromBalanceUSD").text((b*s).toFixed(5)),t.withdrawEthereumAddress=c.transactionHash,t}async function ee({archethicContractAddress:t,HTLC_Contract:a,withdrawEthereumAddress:n,secretHex:o,ethChainId:i,toChainExplorer:s}){console.log(t);let{archethicWithdrawTransaction:r,archethicTransferTransaction:c}=await pe(t,a.address,n,o,i);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${r}`),console.log(`Archethic's transfer transaction ${c}`),$("#txSummary5Label").html(`Archethic swap: <a href="${s}/${r}" target="_blank">${r}</a>`),$("#txSummary5").show(),$("#txSummary6Label").html(`Archethic transfer: <a href="${s}/${c}" target="_blank">${c}</a>`),$("#txSummary6").show(),$("#txSummary2Timer").hide(),$("#txSummaryFinished").show()}async function de(t,a,n,o,i,s){return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:t,recipientAddress:a,amount:n*1e8,ethereumContractAddress:o,ethereumContractTransaction:i,ethereumChainId:s})}).then(T).then(r=>r.contractAddress)}async function he(t,a,n){let o=await t.connect(a);try{return await o.startTime(),await(await o.withdraw(`0x${n}`,{gasLimit:1e6})).wait()}catch(i){throw console.log(i),i}}async function pe(t,a,n,o,i){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:t,ethereumContractAddress:a,ethereumWithdrawTransaction:n,secret:o,ethereumChainId:i})}).then(T).then(s=>{let{archethicWithdrawTransaction:r,archethicTransferTransaction:c}=s;return{archethicWithdrawTransaction:r,archethicTransferTransaction:c}})}async function ue(){return await(await fetch("uco_abi.json")).json()}async function te(){let a=await(await fetch("HTLC.json")).json();return{abi:a.abi,bytecode:a.bytecode}}async function F(t){let a=await t.startTime(),n=await t.lockTime(),o=a.toNumber()+n.toNumber();return new Date(o*1e3)}async function I(t,a){let n=await t.connect(a);if(await n.finished())throw"Swap is already closed due to a withdraw or a prior refund.";return await(await n.refund()).wait()}async function k(t){return fetch(`/balances/archethic/${t}`).then(T).then(a=>a.balance)}async function L(t){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:t})}).then(T).then(a=>{if(a.status!="ok")throw a.status;return{archethicEndpoint:a.archethicEndpoint,unirisTokenAddress:a.unirisTokenAddress,recipientEthereum:a.recipientEthereum,sufficientFunds:a.sufficientFunds,UCOPrice:a.UCOPrice,sourceChainExplorer:a.sourceChainExplorer,bridgeAddress:a.bridgeAddress,maxSwapDollar:a.maxSwapDollar}})}async function T(t){return new Promise(function(a,n){t.status>=200&&t.status<=299?t.json().then(a):t.json().then(n).catch(()=>n(t.statusText))})}var ae=[];for(let t=0;t<=255;++t){let a=t.toString(16).padStart(2,"0");ae.push(a)}function O(t){let a=new Uint8Array(t),n=new Array(a.length);for(let o=0;o<a.length;++o)n[o]=ae[a[o]];return n.join("")}async function H(t,a,n,o){$("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.log(t);let i=t;switch(t.data&&t.data.message?i=t.data.message:t.message&&(i=t.message),console.error(i),$("#error").text(`${i}`).show(),$("#close").show(),a){case 1:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed"),$("#archethicDeploymentStep").addClass("is-failed"),$("#swapStep").addClass("is-failed");break;case 2:$("#ethTransferStep").addClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed");break;case 4:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#swapStep").addClass("is-failed"),$("#swapStep").removeClass("is-active");break;default:break}if(console.log(n),n&&n.erc20transferAddress){let s=new ethers.providers.Web3Provider(window.ethereum),r=s.getSigner(),c=await A(n.HTLC_Address,s),h=await F(c);me(h,c,r,n,o),$("#txSummary2Timer").show()}}function R(t){var a=Date.parse(t)-Date.parse(new Date),n=Math.floor(a/1e3%60),o=Math.floor(a/1e3/60%60),i=Math.floor(a/(1e3*60*60)%24);return{total:a,hours:i,minutes:o,seconds:n}}function me(t,a,n,o,i){let s=setInterval(function(){var r=R(t);r.total<=0?(clearInterval(s),$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds by clicking on the following button (fees not included).
        <button id="refundButton">REFUND</button>
        <button id="refundButtonSpinner" disabled style="display: none;">
						<span>REFUND</span>
						<span class="spinner-border spinner-border-sm" style="width: 8px; height: 8px; padding-bottom: 5px;" role="status" aria-hidden="true"></span>
				</button>
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-top: 3px; padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://wiki.archethic.net/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer');" />
      `),$("#refundButton").on("click",async()=>{$("#error").text("").show(),$("#refundButton").hide(),$("#refundButtonSpinner").show(),setTimeout(function(){},2e3),I(a,n).then(async c=>{localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#error").text("").show(),$("#txRefundTransactionLabel").html(`${o.sourceChainName} refund: <a href="${o.sourceChainExplorer}/tx/${c.transactionHash}" target="_blank">${c.transactionHash}</a>`),$("#txRefundTransaction").show(),$("#txSummaryRefundFinished").show(),$("#txSummary2Timer").hide(),$("#refundButtonSpinner").hide();let{UCOPrice:h}=await L(i),l=await o.signer.getAddress(),p=await o.unirisContract.balanceOf(l),u=ethers.utils.formatUnits(p,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(u).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((u*h).toFixed(5)))}).catch(c=>{$("#refundButton").show(),$("#refundButtonSpinner").hide(),$("#error").text(`${c.message||e}`).show()})})):$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds in ${("0"+r.hours).slice(-2)+"h"+("0"+r.minutes).slice(-2)+"m"+("0"+r.seconds).slice(-2)}.
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://wiki.archethic.net/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer')" />
      `)},1e3)}function U(){localStorage.clear()}function D(){for(var t={},a=0;a<localStorage.length;a++){var n=localStorage.key(a);t[n]=localStorage.getItem(n)}var o=JSON.stringify(t),i=new Blob([o],{type:"application/json"}),s=URL.createObjectURL(i),r=$("<a />").attr("href",s).attr("download","localStorageData.json").appendTo("body");r[0].click(),r.remove(),URL.revokeObjectURL(s)}function re(t){switch(t){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon Mainnet"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Mainnet"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Mainnet"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}var w,oe;window.onload=async function(){try{if(typeof window.ethereum<"u")console.log("MetaMask is installed!"),localStorage.getItem("walletInjected?")&&(w=new ethers.providers.Web3Provider(window.ethereum),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),se(),await M());else throw"No ethereum provider is installed"}catch(t){localStorage.setItem("walletInjected?",!1),E(t.message||t)}};$("#connectMetamaskBtn").on("click",async()=>{w=new ethers.providers.Web3Provider(window.ethereum);try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),localStorage.setItem("walletInjected?",!0),se(),await M()}catch(t){E(t.message||t)}});$("#clearLocalStorage").click(function(){return q("WARNING","Are you sure you want to clear the local data about the bridge?<br/><br/>If you have a transfer in progress, it will be lost and cannot be completed or refunded.",function(t){t&&(U(),$("#recipientAddress").val(""),$("#nbTokensToSwap").val(""),location.reload())}),!1});$("#exportLocalStorage").click(function(){D()});$("#exportLocalStorageModal").click(function(){D()});$("#exportLocalStorageModalRefund").click(function(){D()});$("#refund").click(function(){return G("Refund",`Please, fill your ${fromChainName} contract address to refund`,async function(t,a){if(t){var n=window.setInterval(function(){var s=$("#loading-dots");s.html().length>2?s.html(""):s.append(".")},500),o=0;try{$("#errorRefund").text(""),$("#refundFinished").hide(),$("#infoRefund").show(),$("#refundInProgress").show(),console.log("Refund contract",a);let s=await A(a,w);o=await F(s),console.log("endDate"+o);let r=await I(s,N);$("#refundInProgress").hide(),$("#refundFinished").show(),U(),console.log("Refund tx",r.transactionHash)}catch(s){$("#refundInProgress").hide();let r=s;if(s.data&&s.data.message?r=s.data.message:s.message&&(r=s.message),r.includes("Response has no error or result for request"))$("#errorRefund").text("Please, connect to the internet.").show();else if(r.includes("Too early")){var i=R(o);$("#errorRefund").text(`You can retrieve your funds in ${("0"+i.hours).slice(-2)+"h"+("0"+i.minutes).slice(-2)+"m"+("0"+i.seconds).slice(-2)}.`).show()}else $("#errorRefund").text(`${r}`).show()}clearInterval(n)}}),!1});function se(){w.provider.on("chainChanged",t=>{w=new ethers.providers.Web3Provider(window.ethereum),J(),clearInterval(oe),M().catch(a=>E(a.message||a))})}var _,S,m,N;async function M(){let{chainId:t}=await w.getNetwork();N=w.getSigner();let a=re(t),{archethicEndpoint:n,unirisTokenAddress:o,recipientEthereum:i,sufficientFunds:s,UCOPrice:r,sourceChainExplorer:c,bridgeAddress:h,maxSwapDollar:l}=await L(t);m=r,j();let p=(l/r).toFixed(5);if($("#maxSwap").text(l),$("#nbTokensToSwap").attr("max",p),_=`${n}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${r.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!s){$("#error").text("Bridge has insufficient funds. Please retry later..."),$("#workflow").show(),$("#close").css({visibility:"hidden"});return}console.log("Archethic endpoint: ",n);let u=await Q(o,w),b=await N.getAddress(),x=await ne(b,u,c,m,l);w.provider.on("accountsChanged",async d=>{let f=d[0];x=await ne(f,u,c,m,l)}),oe=setInterval(async()=>{let{UCOPrice:d}=await L(t);if(d!=m){$("#ucoPrice").text(`1 UCO = ${d.toFixed(5)}$`).show();let f=(l/d).toFixed(5);$("#nbTokensToSwap").attr("max",f);let C=parseFloat($("#fromBalanceUCO").text()),ie=(C*d).toFixed(5);$("#fromBalanceUSD").text(new Intl.NumberFormat(ie)),$("#maxUCOValue").attr("value",Math.min(C,f).toFixed(5)),m=d}},5e3),$("#recipientAddress").on("change",async d=>{let C=await k($(d.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(C).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((m*C).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("input",d=>{let f=$(d.target).val();$("#swapBalanceUSD").text((f*m).toFixed(5))}),$("#maxButton").on("click",()=>{let d=$("#maxUCOValue").val();$("#nbTokensToSwap").val(d),$("#swapBalanceUSD").text((d*m).toFixed(5))}),$("#close").on("click",()=>{$("#workflow").hide()}),$("#closeInfoRefund").on("click",()=>{$("#infoRefund").hide()});let y=localStorage.getItem("pendingTransfer"),g;y&&(g=await $e(y,t,u,_,i,N)),$("#swapForm").on("submit",async d=>{if(d.preventDefault(),!d.target.checkValidity())return;if($("#error").text(""),g){B();try{await v(localStorage.getItem("transferStep"),g)}catch(C){H(C,S,JSON.parse(y,t))}return}let f=$("#recipientAddress").val();await fe(N,u,i,f,t,c,h,a,x)})}async function ne(t,a,n,o,i){let s=t;t.length>4&&(s=t.substring(0,5)+"..."+t.substring(t.length-3)),$("#accountName").html(`Account<br><a href="${n}/address/${t}" target="_blank">${s}</a>`);let r=(i/o).toFixed(5),c=await P(t,a,o);return $("#maxUCOValue").attr("value",Math.min(c,r).toFixed(5)),c}async function P(t,a,n){let o=await a.balanceOf(t),i=ethers.utils.formatUnits(o,18);return $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(i).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((i*n).toFixed(5))),i}async function fe(t,a,n,o,i,s,r,c,h){W(),S=0;let l=$("#nbTokensToSwap").val();if(h*1e18<l*1e18){$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#error").text(`Insufficient UCO on ${c}`),$("#close").show();return}if(await k(r)<=l*1e8){$("#error").text("Bridge has insuffficient funds. Please retry later..."),$("#close").show();return}$("#steps").show();let u=new Uint8Array(32);crypto.getRandomValues(u);let b=O(u),x=await crypto.subtle.digest("SHA-256",u);x=new Uint8Array(x);let y=O(x);$("#ethDeploymentStep").addClass("is-active"),S=1;try{let{contract:g,transaction:d}=await Y(n,a.address,l,x,t,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:g.address,secretHex:b,secretDigestHex:y,amount:l,recipientArchethic:o,HTLC_transaction:d,sourceChainName:c,sourceChainExplorer:s})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary1Label").html(`Contract address on ${c}: <a href="${s}/address/${g.address}" target="_blank">${g.address}</a>`),$("#txSummary1").show(),await v("deployedEthContract",{HTLC_Contract:g,secretHex:b,secretDigestHex:y,amount:l,ethChainId:i,recipientEthereum:n,recipientArchethic:o,unirisContract:a,signer:t,sourceChainExplorer:s,toChainExplorer:_,HTLC_transaction:d,sourceChainName:c})}catch(g){let d=localStorage.getItem("pendingTransfer"),f=JSON.parse(d);H(g,S,f,i)}}async function v(t,a){switch(t){case"deployedEthContract":return t=2,a=await K(a),P(await a.signer.getAddress(),a.unirisContract,m),await v("transferedERC20",a);case"transferedERC20":return t=3,a=await X(a),await v("deployedArchethicContract",a);case"deployedArchethicContract":return t=4,$("#swapStep").addClass("is-active"),a=await Z(a),await v("withdrawEthContract",a);case"withdrawEthContract":await ee(a),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#close").show(),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#recipientAddress").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),P(await a.signer.getAddress(),a.unirisContract,m),setTimeout(async()=>{let o=await k(a.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(o).toFixed(2)),$("#toBalanceUSD").text((m*o).toFixed(5))},2e3);break}}async function $e(t,a,n,o,i,s){$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let r=JSON.parse(t),c={HTLC_Contract:await A(r.HTLC_Address,w),HTLC_transaction:r.HTLC_transaction,secretHex:r.secretHex,secretDigestHex:r.secretDigestHex,amount:r.amount,ethChainId:a,recipientEthereum:i,recipientArchethic:r.recipientArchethic,unirisContract:n,signer:s,erc20transferAddress:r.erc20transferAddress,archethicContractAddress:r.archethicContractAddress,withdrawEthereumAddress:r.withdrawEthereumAddress,sourceChainExplorer:r.sourceChainExplorer,toChainExplorer:o,sourceChainName:r.sourceChainName};$("#recipientAddress").val(r.recipientArchethic),$("#recipientAddress").prop("disabled",!0),$("#nbTokensToSwap").val(r.amount),$("#nbTokensToSwap").prop("disabled",!0);let l=await k(r.recipientArchethic)/1e8;switch($("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(l).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((m*l).toFixed(5))),$("#swapBalanceUSD").text((r.amount*m).toFixed(5)),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#txSummary1Label").html(`Contract address on ${r.sourceChainName}: <a href="${r.sourceChainExplorer}/address/${r.HTLC_Address}" target="_blank">${r.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),S=2,r.erc20transferAddress&&(S=3,$("#txSummary2Label").html(`Provision UCOs: <a href="${r.sourceChainExplorer}/tx/${r.erc20transferAddress}" target="_blank">${r.erc20transferAddress}</a>`),$("#txSummary2").show()),r.archethicContractAddress&&(S=4,$("#txSummary3Label").html(`Contract address on Archethic: <a href="${o}/${r.archethicContractAddress}" target="_blank">${r.archethicContractAddress}</a>`),$("#txSummary3").show()),r.withdrawEthereumAddress&&($("#txSummary4Label").html(`${fromChainName} swap: <a href="${r.sourceChainExplorer}/tx/${r.withdrawEthereumAddress}" target="_blank">${r.withdrawEthereumAddress}</a>`),$("#txSummary4").show()),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),S){case 2:$("#ethTransferStep").addClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-failed is-active"),$("#ethTransferStep").removeClass("is-failed is-active");break;case 4:$("#swapStep").addClass("is-active"),$("#swapStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;default:break}$("#steps").show(),B();try{await v(localStorage.getItem("transferStep"),c)}catch(p){H(p,S,JSON.parse(t,a))}return c}})();
//# sourceMappingURL=app.js.map
