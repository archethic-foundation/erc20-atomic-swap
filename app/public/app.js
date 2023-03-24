(()=>{function O(){$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),P(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),$("#btnSwapSpinnerText").hide(),R()}function U(){$("#connectionError").text("").hide(),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),$("#swapForm").hide(),$("#main").show()}function L(t){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#connectionError").text(t).show()}function _(){P(),B(),$("#steps").hide(),R(),$("#error").text("")}function B(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").show(),$("#btnSwapSpinnerText").show(),$("#workflow").show(),$("#close").hide()}function P(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary2Timer").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide(),$("#txSummary6Label").text(""),$("#txSummary6").hide(),$("#txSummary7Label").text(""),$("#txSummary7").hide(),$("#txSummaryFinished").hide(),$("#txSummaryRefundFinished").hide(),$("#txRefundTransactionLabel").text(""),$("#txRefundTransaction").hide()}function R(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}function J(t,a,n){var o=$("<div></div>").html(a).dialog({title:t,resizable:!1,modal:!0,buttons:{Yes:function(){n(!0),$(this).dialog("close")},No:function(){n(!1),$(this).dialog("close")}},open:function(s,c){$(this).css({color:"white","font-family":"Lato","font-size":"12px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"}),$(".ui-dialog").css({"border-radius":"20px"}),$(".ui-dialog-titlebar").css({background:"transparent",color:"white","font-family":"Lato","font-size":"14px",border:"none","border-radius":"10px 10px 0 0","letter-spacing":"2.56232px"}),$(".ui-widget-content").css({background:"#1a1a1a"}),$(".ui-dialog .ui-dialog-content").css({background:"transparent"}),$(".ui-dialog-buttonpane .ui-widget-content .ui-helper-clearfix").css({background:"transparent"}),$(".ui-dialog-buttonpane").css({background:"transparent"}),$(this).parent().find(".ui-dialog-buttonset button:first-child").css({"margin-right":"30px"}),$(this).parent().find(".ui-dialog-buttonset button").hover(function(){$(this).css({color:"#b0b0b0"})},function(){$(this).css({color:"white"})}),$(".ui-dialog-buttonpane button").css({background:"transparent",color:"white","font-family":"Lato","font-weight":"400","font-size":"14px",border:"none","border-radius":"10px","letter-spacing":"2.56232px"})}})}async function M(t,a){let n=await se();return new ethers.Contract(t,n,a)}async function N(t,a){let{abi:n}=await G();return new ethers.Contract(t,n,a)}async function j(t,a,n,o,s,c){let{abi:r,bytecode:i}=await G(),h=await new ethers.ContractFactory(r,i,s).deploy(t,a,ethers.utils.parseUnits(n,18),o,c,{gasLimit:1e6}),f=await h.deployTransaction.wait();return console.log("HTLC contract deployed at "+h.address),{contract:h,transaction:f}}async function ae(t,a,n,o){return await(await n.connect(o).transfer(a,ethers.utils.parseUnits(t,18))).wait()}async function W(t){let{HTLC_Contract:a,amount:n,unirisContract:o,signer:s,sourceChainExplorer:c}=t;$("#ethTransferStep").addClass("is-active");let r=await ae(n,a.address,o,s);localStorage.setItem("transferStep","transferedERC20");let i=localStorage.getItem("pendingTransfer"),l=JSON.parse(i);return l.erc20transferAddress=r.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(l)),console.log(`${n} UCO transfered`),$("#txSummary2Label").html(`Provision UCOs: <a href="${c}/tx/${r.transactionHash}" target="_blank">${r.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),t.erc20transferAddress=r.transactionHash,t}async function V(t){let{HTLC_Contract:a,amount:n,secretDigestHex:o,recipientArchethic:s,ethChainId:c,toChainExplorer:r,HTLC_transaction:i}=t;$("#archethicDeploymentStep").addClass("is-active"),step=3;let l=await re(o,s,n,a.address,i.transactionHash,c);localStorage.setItem("transferStep","deployedArchethicContract");let h=localStorage.getItem("pendingTransfer"),f=JSON.parse(h);return f.archethicContractAddress=l,localStorage.setItem("pendingTransfer",JSON.stringify(f)),console.log("Contract address on Archethic",l),$("#txSummary3Label").html(`Contract address on Archethic: <a href="${r}/${l}" target="_blank">${l}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),t.archethicContractAddress=l,t}async function q(t){let{HTLC_Contract:a,signer:n,secretHex:o,unirisContract:s,UCOPrice:c,sourceChainExplorer:r}=t,i=await ne(a,n,o);localStorage.setItem("transferStep","withdrawEthContract");let l=localStorage.getItem("pendingTransfer"),h=JSON.parse(l);h.withdrawEthereumAddress=i.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`Ethereum's withdraw transaction - ${i.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${r}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txSummary4").show();let f=await n.getAddress(),m=await s.balanceOf(f),C=ethers.utils.formatUnits(m,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(C).toFixed(2)));let x=20/c;return $("#maxUCOValue").text(Math.min(C/c,x).toFixed(5)),$("#fromBalanceUSD").text((C*c).toFixed(5)),t.withdrawEthereumAddress=i.transactionHash,t}async function z({archethicContractAddress:t,HTLC_Contract:a,withdrawEthereumAddress:n,secretHex:o,ethChainId:s,toChainExplorer:c}){console.log(t);let{archethicWithdrawTransaction:r,archethicTransferTransaction:i}=await oe(t,a.address,n,o,s);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${r}`),console.log(`Archethic's transfer transaction ${i}`),$("#txSummary5Label").html(`Archethic swap: <a href="${c}/${r}" target="_blank">${r}</a>`),$("#txSummary5").show(),$("#txSummary6Label").html(`Archethic transfer: <a href="${c}/${i}" target="_blank">${i}</a>`),$("#txSummary6").show(),$("#txSummary2Timer").hide(),$("#txSummaryFinished").show()}async function re(t,a,n,o,s,c){return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:t,recipientAddress:a,amount:n*1e8,ethereumContractAddress:o,ethereumContractTransaction:s,ethereumChainId:c})}).then(T).then(r=>r.contractAddress)}async function ne(t,a,n){let o=await t.connect(a);try{return await o.startTime(),await(await o.withdraw(`0x${n}`,{gasLimit:1e7})).wait()}catch(s){throw console.log(s),"Invalid HTLC contract's address"}}async function oe(t,a,n,o,s){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:t,ethereumContractAddress:a,ethereumWithdrawTransaction:n,secret:o,ethereumChainId:s})}).then(T).then(c=>{let{archethicWithdrawTransaction:r,archethicTransferTransaction:i}=c;return{archethicWithdrawTransaction:r,archethicTransferTransaction:i}})}async function se(){return await(await fetch("uco_abi.json")).json()}async function G(){let a=await(await fetch("HTLC.json")).json();return{abi:a.abi,bytecode:a.bytecode}}async function Q(t){let a=await t.startTime(),n=await t.lockTime(),o=a.toNumber()+n.toNumber();return new Date(o*1e3)}async function Y(t,a){return await(await(await t.connect(a)).refund()).wait()}async function v(t){return fetch(`/balances/archethic/${t}`).then(T).then(a=>a.balance)}async function A(t){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:t})}).then(T).then(a=>{if(a.status!="ok")throw a.status;return{archethicEndpoint:a.archethicEndpoint,unirisTokenAddress:a.unirisTokenAddress,recipientEthereum:a.recipientEthereum,sufficientFunds:a.sufficientFunds,UCOPrice:a.UCOPrice,sourceChainExplorer:a.sourceChainExplorer,bridgeAddress:a.bridgeAddress}})}async function T(t){return new Promise(function(a,n){t.status>=200&&t.status<=299?t.json().then(a):t.json().then(n).catch(()=>n(t.statusText))})}var K=[];for(let t=0;t<=255;++t){let a=t.toString(16).padStart(2,"0");K.push(a)}function E(t){let a=new Uint8Array(t),n=new Array(a.length);for(let o=0;o<a.length;++o)n[o]=K[a[o]];return n.join("")}async function H(t,a,n,o){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(t.message||t),$("#error").text(`${t.message||t}`).show(),$("#close").show(),a){case 1:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed"),$("#archethicDeploymentStep").addClass("is-failed"),$("#swapStep").addClass("is-failed");break;case 2:$("#ethTransferStep").addClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed");break;case 4:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#swapStep").addClass("is-failed"),$("#swapStep").removeClass("is-active");break;default:break}if(console.log(n),n&&n.erc20transferAddress){let s=new ethers.providers.Web3Provider(window.ethereum),c=s.getSigner(),r=await N(n.HTLC_Address,s),i=await Q(r);ce(i,r,c,n,o),$("#txSummary2Timer").show()}}function ie(t){var a=Date.parse(t)-Date.parse(new Date),n=Math.floor(a/1e3%60),o=Math.floor(a/1e3/60%60),s=Math.floor(a/(1e3*60*60)%24);return{total:a,hours:s,minutes:o,seconds:n}}function ce(t,a,n,o,s){let c=setInterval(function(){var r=ie(t);r.total<=0?(clearInterval(c),$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds by clicking on the following button (fees not included).
        <button id="refundButton">REFUND</button>
        <button id="refundButtonSpinner" disabled style="display: none;">
						<span>REFUND</span>
						<span class="spinner-border spinner-border-sm" style="width: 8px; height: 8px; padding-bottom: 5px;" role="status" aria-hidden="true"></span>
				</button>
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-top: 3px; padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer');" />
      `),$("#refundButton").on("click",async()=>{$("#error").text("").show(),$("#refundButton").hide(),$("#refundButtonSpinner").show(),setTimeout(function(){},2e3),Y(a,n,o).then(async i=>{localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#error").text("").show(),$("#txRefundTransactionLabel").html(`${o.sourceChainName} refund: <a href="${o.sourceChainExplorer}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txRefundTransaction").show(),$("#txSummaryRefundFinished").show(),$("#txSummary2Timer").hide(),$("#refundButtonSpinner").hide();let{UCOPrice:l}=await A(s),h=await o.signer.getAddress(),f=await o.unirisContract.balanceOf(h),m=ethers.utils.formatUnits(f,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(m).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((m*l).toFixed(5)))}).catch(i=>{$("#refundButton").show(),$("#refundButtonSpinner").hide(),$("#error").text(`${i.message||e}`).show()})})):$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds in ${("0"+r.hours).slice(-2)+"h"+("0"+r.minutes).slice(-2)+"m"+("0"+r.seconds).slice(-2)}.
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer')" />
      `)},1e3)}function X(t){switch(t){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}var w,ee;window.onload=async function(){try{if(typeof window.ethereum<"u")console.log("MetaMask is installed!"),localStorage.getItem("walletInjected?")&&(w=new ethers.providers.Web3Provider(window.ethereum),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),te(),await D());else throw"No ethereum provider is installed"}catch(t){localStorage.setItem("walletInjected?",!1),L(t.message||t)}};$("#connectMetamaskBtn").on("click",async()=>{w=new ethers.providers.Web3Provider(window.ethereum);try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),localStorage.setItem("walletInjected?",!0),te(),await D()}catch(t){L(t.message||t)}});$("#clearLocalStorage").click(function(){return J("WARNING","Are you sure you want to clear the local data about the bridge?<br/><br/>If you have a transfer in progress, it will be lost and cannot be completed or refunded.",function(t){t&&(de(),$("#recipientAddress").val(""),$("#nbTokensToSwap").val(""),location.reload())}),!1});function de(){localStorage.clear()}function te(){w.provider.on("chainChanged",t=>{w=new ethers.providers.Web3Provider(window.ethereum),U(),clearInterval(ee),D().catch(a=>L(a.message||a))})}var I,S,p;async function D(){let{chainId:t}=await w.getNetwork(),a=w.getSigner(),n=X(t),{archethicEndpoint:o,unirisTokenAddress:s,recipientEthereum:c,sufficientFunds:r,UCOPrice:i,sourceChainExplorer:l,bridgeAddress:h}=await A(t);p=i,O();let f=(20/i).toFixed(5);if($("#nbTokensToSwap").attr("max",f),I=`${o}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${i.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!r){$("#error").text("Bridge has insufficient funds. Please retry later...");return}console.log("Archethic endpoint: ",o);let m=await M(s,w),C=await a.getAddress(),x=await Z(C,m,l,p);w.provider.on("accountsChanged",async d=>{let u=d[0];x=await Z(u,m,l,p)}),ee=setInterval(async()=>{let{UCOPrice:d}=await A(t);if(d!=p){$("#ucoPrice").text(`1 UCO = ${d.toFixed(5)}$`).show();let u=(20/d).toFixed(5);$("#nbTokensToSwap").attr("max",u);let b=parseFloat($("#fromBalanceUCO").text());$("#fromBalanceUSD").text(new Intl.NumberFormat().format((b*d).toFixed(5))),$("#maxUCOValue").attr("value",Math.min(b,u).toFixed(5)),p=d}},5e3),$("#recipientAddress").on("change",async d=>{let b=await v($(d.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(b).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*b).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("input",d=>{let u=$(d.target).val();$("#swapBalanceUSD").text((u*p).toFixed(5))}),$("#maxButton").on("click",()=>{let d=$("#maxUCOValue").val();$("#nbTokensToSwap").val(d),$("#swapBalanceUSD").text((d*p).toFixed(5))}),$("#close").on("click",()=>{$("#workflow").hide()});let y=localStorage.getItem("pendingTransfer"),g;y&&(g=await le(y,t,m,I,c,a)),$("#swapForm").on("submit",async d=>{if(d.preventDefault(),!d.target.checkValidity())return;if($("#error").text(""),g){B();try{await k(localStorage.getItem("transferStep"),g)}catch(b){H(b,S,JSON.parse(y,t))}return}let u=$("#recipientAddress").val();await he(a,m,c,u,t,l,h,n,x)})}async function Z(t,a,n,o){let s=t;t.length>4&&(s=t.substring(0,5)+"..."+t.substring(t.length-3)),$("#accountName").html(`Account<br><a href="${n}/address/${t}" target="_blank">${s}</a>`);let c=(20/o).toFixed(5),r=await F(t,a,o);return $("#maxUCOValue").attr("value",Math.min(r,c).toFixed(5)),r}async function F(t,a,n){let o=await a.balanceOf(t),s=ethers.utils.formatUnits(o,18);return $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(s).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((s*n).toFixed(5))),s}async function he(t,a,n,o,s,c,r,i,l){_(),S=0;let h=$("#nbTokensToSwap").val();if(l*1e18<h*1e18){$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#error").text(`Insufficient UCO on ${i}`),$("#close").show();return}if(await v(r)<=h*1e8){$("#error").text("Bridge has insuffficient funds. Please retry later..."),$("#close").show();return}$("#steps").show();let m=new Uint8Array(32);crypto.getRandomValues(m);let C=E(m),x=await crypto.subtle.digest("SHA-256",m);x=new Uint8Array(x);let y=E(x);$("#ethDeploymentStep").addClass("is-active"),S=1;try{let{contract:g,transaction:d}=await j(n,a.address,h,x,t,120);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:g.address,secretHex:C,secretDigestHex:y,amount:h,recipientArchethic:o,HTLC_transaction:d,sourceChainName:i,sourceChainExplorer:c})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary1Label").html(`Contract address on ${i}: <a href="${c}/address/${g.address}" target="_blank">${g.address}</a>`),$("#txSummary1").show(),await k("deployedEthContract",{HTLC_Contract:g,secretHex:C,secretDigestHex:y,amount:h,ethChainId:s,recipientEthereum:n,recipientArchethic:o,unirisContract:a,signer:t,sourceChainExplorer:c,toChainExplorer:I,HTLC_transaction:d,sourceChainName:i})}catch(g){let d=localStorage.getItem("pendingTransfer"),u=JSON.parse(d);H(g,S,u,s)}}async function k(t,a){switch(t){case"deployedEthContract":return t=2,a=await W(a),F(await a.signer.getAddress(),a.unirisContract,p),await k("transferedERC20",a);case"transferedERC20":return t=3,a=await V(a),await k("deployedArchethicContract",a);case"deployedArchethicContract":return t=4,$("#swapStep").addClass("is-active"),a=await q(a),await k("withdrawEthContract",a);case"withdrawEthContract":await z(a),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#close").show(),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#recipientAddress").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),F(await a.signer.getAddress(),a.unirisContract,p),setTimeout(async()=>{let o=await v(a.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(o).toFixed(2)),$("#toBalanceUSD").text((p*o).toFixed(5))},2e3);break}}async function le(t,a,n,o,s,c){$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let r=JSON.parse(t),i={HTLC_Contract:await N(r.HTLC_Address,w),HTLC_transaction:r.HTLC_transaction,secretHex:r.secretHex,secretDigestHex:r.secretDigestHex,amount:r.amount,ethChainId:a,recipientEthereum:s,recipientArchethic:r.recipientArchethic,unirisContract:n,signer:c,erc20transferAddress:r.erc20transferAddress,archethicContractAddress:r.archethicContractAddress,withdrawEthereumAddress:r.withdrawEthereumAddress,sourceChainExplorer:r.sourceChainExplorer,toChainExplorer:o,sourceChainName:r.sourceChainName};$("#recipientAddress").val(r.recipientArchethic),$("#recipientAddress").prop("disabled",!0),$("#nbTokensToSwap").val(r.amount),$("#nbTokensToSwap").prop("disabled",!0);let h=await v(r.recipientArchethic)/1e8;switch($("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(h).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*h).toFixed(5))),$("#swapBalanceUSD").text((r.amount*p).toFixed(5)),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#txSummary1Label").html(`Contract address on ${r.sourceChainName}: <a href="${r.sourceChainExplorer}/address/${r.HTLC_Address}" target="_blank">${r.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),S=2,r.erc20transferAddress&&(S=3,$("#txSummary2Label").html(`Provision UCOs: <a href="${r.sourceChainExplorer}/tx/${r.erc20transferAddress}" target="_blank">${r.erc20transferAddress}</a>`),$("#txSummary2").show()),r.archethicContractAddress&&(S=4,$("#txSummary3Label").html(`Contract address on Archethic: <a href="${o}/${r.archethicContractAddress}" target="_blank">${r.archethicContractAddress}</a>`),$("#txSummary3").show()),r.withdrawEthereumAddress&&($("#txSummary4Label").html(`${fromChainName} swap: <a href="${r.sourceChainExplorer}/tx/${r.withdrawEthereumAddress}" target="_blank">${r.withdrawEthereumAddress}</a>`),$("#txSummary4").show()),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),S){case 2:$("#ethTransferStep").addClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-failed is-active"),$("#ethTransferStep").removeClass("is-failed is-active");break;case 4:$("#swapStep").addClass("is-active"),$("#swapStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;default:break}return $("#steps").show(),i}})();
//# sourceMappingURL=app.js.map
