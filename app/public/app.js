(()=>{function O(){$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),P(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),$("#btnSwapSpinnerText").hide(),R()}function U(){$("#connectionError").text("").hide(),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),$("#swapForm").hide(),$("#main").show()}function L(t){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#connectionError").text(t).show()}function _(){P(),B(),$("#steps").hide(),R(),$("#error").text("")}function B(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").show(),$("#btnSwapSpinnerText").show(),$("#workflow").show(),$("#close").hide()}function P(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary2Timer").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide(),$("#txSummary6Label").text(""),$("#txSummary6").hide(),$("#txSummary7Label").text(""),$("#txSummary7").hide(),$("#txSummaryFinished").hide(),$("#txSummaryRefundFinished").hide(),$("#txRefundTransactionLabel").text(""),$("#txRefundTransaction").hide()}function R(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}async function M(t,a){let n=await se();return new ethers.Contract(t,n,a)}async function N(t,a){let{abi:n}=await Q();return new ethers.Contract(t,n,a)}async function J(t,a,n,s,o,c){let{abi:r,bytecode:i}=await Q(),l=await new ethers.ContractFactory(r,i,o).deploy(t,a,ethers.utils.parseUnits(n,18),s,c,{gasLimit:1e6}),f=await l.deployTransaction.wait();return console.log("HTLC contract deployed at "+l.address),{contract:l,transaction:f}}async function te(t,a,n,s){return await(await n.connect(s).transfer(a,ethers.utils.parseUnits(t,18))).wait()}async function j(t){let{HTLC_Contract:a,amount:n,unirisContract:s,signer:o,sourceChainExplorer:c}=t;$("#ethTransferStep").addClass("is-active");let r=await te(n,a.address,s,o);localStorage.setItem("transferStep","transferedERC20");let i=localStorage.getItem("pendingTransfer"),h=JSON.parse(i);return h.erc20transferAddress=r.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(h)),console.log(`${n} UCO transfered`),$("#txSummary2Label").html(`Provision UCOs: <a href="${c}/tx/${r.transactionHash}" target="_blank">${r.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),t.erc20transferAddress=r.transactionHash,t}async function W(t){let{HTLC_Contract:a,amount:n,secretDigestHex:s,recipientArchethic:o,ethChainId:c,toChainExplorer:r,HTLC_transaction:i}=t;$("#archethicDeploymentStep").addClass("is-active"),step=3;let h=await ae(s,o,n,a.address,i.transactionHash,c);localStorage.setItem("transferStep","deployedArchethicContract");let l=localStorage.getItem("pendingTransfer"),f=JSON.parse(l);return f.archethicContractAddress=h,localStorage.setItem("pendingTransfer",JSON.stringify(f)),console.log("Contract address on Archethic",h),$("#txSummary3Label").html(`Contract address on Archethic: <a href="${r}/${h}" target="_blank">${h}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),t.archethicContractAddress=h,t}async function V(t){let{HTLC_Contract:a,signer:n,secretHex:s,unirisContract:o,UCOPrice:c,sourceChainExplorer:r}=t,i=await re(a,n,s);localStorage.setItem("transferStep","withdrawEthContract");let h=localStorage.getItem("pendingTransfer"),l=JSON.parse(h);l.withdrawEthereumAddress=i.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(l)),console.log(`Ethereum's withdraw transaction - ${i.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${r}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txSummary4").show();let f=await n.getAddress(),m=await o.balanceOf(f),x=ethers.utils.formatUnits(m,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(x).toFixed(2)));let g=20/c;return $("#maxUCOValue").text(Math.min(x/c,g).toFixed(5)),$("#fromBalanceUSD").text((x*c).toFixed(5)),t.withdrawEthereumAddress=i.transactionHash,t}async function q({archethicContractAddress:t,HTLC_Contract:a,withdrawEthereumAddress:n,secretHex:s,ethChainId:o,toChainExplorer:c}){console.log(t);let{archethicWithdrawTransaction:r,archethicTransferTransaction:i}=await ne(t,a.address,n,s,o);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${r}`),console.log(`Archethic's transfer transaction ${i}`),$("#txSummary5Label").html(`Archethic swap: <a href="${c}/${r}" target="_blank">${r}</a>`),$("#txSummary5").show(),$("#txSummary6Label").html(`Archethic transfer: <a href="${c}/${i}" target="_blank">${i}</a>`),$("#txSummary6").show(),$("#txSummary2Timer").hide(),$("#txSummaryFinished").show()}async function ae(t,a,n,s,o,c){let r=new Date;r.setSeconds(r.getSeconds()+1e4);let i=Math.floor(r/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:t,recipientAddress:a,amount:n*1e8,endTime:i,ethereumContractAddress:s,ethereumContractTransaction:o,ethereumChainId:c})}).then(T).then(h=>h.contractAddress)}async function re(t,a,n){let s=await t.connect(a);try{return await s.startTime(),await(await s.withdraw(`0x${n}`,{gasLimit:1e7})).wait()}catch(o){throw console.log(o),"Invalid HTLC contract's address"}}async function ne(t,a,n,s,o){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:t,ethereumContractAddress:a,ethereumWithdrawTransaction:n,secret:s,ethereumChainId:o})}).then(T).then(c=>{let{archethicWithdrawTransaction:r,archethicTransferTransaction:i}=c;return{archethicWithdrawTransaction:r,archethicTransferTransaction:i}})}async function se(){return await(await fetch("uco_abi.json")).json()}async function Q(){let a=await(await fetch("HTLC.json")).json();return{abi:a.abi,bytecode:a.bytecode}}async function G(t){let a=await t.startTime(),n=await t.lockTime(),s=a.toNumber()+n.toNumber();return new Date(s*1e3)}async function X(t,a){return await(await(await t.connect(a)).refund()).wait()}async function v(t){return fetch(`/balances/archethic/${t}`).then(T).then(a=>a.balance)}async function A(t){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:t})}).then(T).then(a=>{if(a.status!="ok")throw a.status;return{archethicEndpoint:a.archethicEndpoint,unirisTokenAddress:a.unirisTokenAddress,recipientEthereum:a.recipientEthereum,sufficientFunds:a.sufficientFunds,UCOPrice:a.UCOPrice,sourceChainExplorer:a.sourceChainExplorer,bridgeAddress:a.bridgeAddress}})}async function T(t){return new Promise(function(a,n){t.status>=200&&t.status<=299?t.json().then(a):t.json().then(n).catch(()=>n(t.statusText))})}var z=[];for(let t=0;t<=255;++t){let a=t.toString(16).padStart(2,"0");z.push(a)}function E(t){let a=new Uint8Array(t),n=new Array(a.length);for(let s=0;s<a.length;++s)n[s]=z[a[s]];return n.join("")}async function H(t,a,n,s){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(t.message||t),$("#error").text(`${t.message||t}`).show(),$("#close").show(),a){case 1:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed"),$("#archethicDeploymentStep").addClass("is-failed"),$("#swapStep").addClass("is-failed");break;case 2:$("#ethTransferStep").addClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed");break;case 4:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#swapStep").addClass("is-failed"),$("#swapStep").removeClass("is-active");break;default:break}if(console.log(n),n&&n.erc20transferAddress){let o=new ethers.providers.Web3Provider(window.ethereum),c=o.getSigner(),r=await N(n.HTLC_Address,o),i=await G(r);ie(i,r,c,n,s),$("#txSummary2Timer").show()}}function oe(t){var a=Date.parse(t)-Date.parse(new Date),n=Math.floor(a/1e3%60),s=Math.floor(a/1e3/60%60),o=Math.floor(a/(1e3*60*60)%24);return{total:a,hours:o,minutes:s,seconds:n}}function ie(t,a,n,s,o){let c=setInterval(function(){var r=oe(t);r.total<=0?(clearInterval(c),$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds by clicking on the following button (fees not included).
        <button id="refundButton">REFUND</button>
        <button id="refundButtonSpinner" disabled style="display: none;">
						<span>REFUND</span>
						<span class="spinner-border spinner-border-sm" style="width: 8px; height: 8px; padding-bottom: 5px;" role="status" aria-hidden="true"></span>
				</button>
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-top: 3px; padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer');" />
      `),$("#refundButton").on("click",async()=>{$("#error").text("").show(),$("#refundButton").hide(),$("#refundButtonSpinner").show(),setTimeout(function(){},2e3),X(a,n,s).then(async i=>{localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#error").text("").show(),$("#txRefundTransactionLabel").html(`${s.sourceChainName} refund: <a href="${s.sourceChainExplorer}/tx/${i.transactionHash}" target="_blank">${i.transactionHash}</a>`),$("#txRefundTransaction").show(),$("#txSummaryRefundFinished").show(),$("#txSummary2Timer").hide(),$("#refundButtonSpinner").hide();let{UCOPrice:h}=await A(o),l=await s.signer.getAddress(),f=await s.unirisContract.balanceOf(l),m=ethers.utils.formatUnits(f,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(m).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((m*h).toFixed(5)))}).catch(i=>{$("#refundButton").show(),$("#refundButtonSpinner").hide(),$("#error").text(`${i.message||e}`).show()})})):$("#txSummary2Timer").html(`
        <img src="assets/images/icons/timer.png" height="20" alt="" style="padding-right: 5px; padding-bottom: 5px;" />
        As the transfer is not effective, you can retrieve your funds in ${("0"+r.hours).slice(-2)+"h"+("0"+r.minutes).slice(-2)+"m"+("0"+r.seconds).slice(-2)}.
        <img src="assets/images/icons/help.png" height="20" alt="" style="padding-left: 5px; padding-bottom: 5px; cursor: pointer;" onclick="window.open('https://archethic-foundation.github.io/archethic-docs/FAQ/bridge/#what-happens-if-a-problem-occurs-or-i-refuse-a-transaction-during-the-transfer')" />
      `)},1e3)}function K(t){switch(t){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}var w,Z;window.onload=async function(){try{if(typeof window.ethereum<"u")console.log("MetaMask is installed!"),localStorage.getItem("walletInjected?")&&(w=new ethers.providers.Web3Provider(window.ethereum),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),ee(),await D());else throw"No ethereum provider is installed"}catch(t){localStorage.setItem("walletInjected?",!1),L(t.message||t)}};$("#connectMetamaskBtn").on("click",async()=>{w=new ethers.providers.Web3Provider(window.ethereum);try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),localStorage.setItem("walletInjected?",!0),ee(),await D()}catch(t){L(t.message||t)}});function ee(){w.provider.on("chainChanged",t=>{w=new ethers.providers.Web3Provider(window.ethereum),U(),clearInterval(Z),D().catch(a=>L(a.message||a))})}var I,S,p;async function D(){let{chainId:t}=await w.getNetwork(),a=w.getSigner(),n=K(t),{archethicEndpoint:s,unirisTokenAddress:o,recipientEthereum:c,sufficientFunds:r,UCOPrice:i,sourceChainExplorer:h,bridgeAddress:l}=await A(t);p=i,O();let f=(20/i).toFixed(5);if($("#nbTokensToSwap").attr("max",f),I=`${s}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${i.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!r){$("#error").text("Bridge has insufficient funds. Please retry later...");return}console.log("Archethic endpoint: ",s);let m=await M(o,w),x=await a.getAddress(),g=await Y(x,m,h,p);w.provider.on("accountsChanged",async d=>{let u=d[0];g=await Y(u,m,h,p)}),Z=setInterval(async()=>{let{UCOPrice:d}=await A(t);if(d!=p){$("#ucoPrice").text(`1 UCO = ${d.toFixed(5)}$`).show();let u=(20/d).toFixed(5);$("#nbTokensToSwap").attr("max",u);let b=parseFloat($("#fromBalanceUCO").text());$("#fromBalanceUSD").text(new Intl.NumberFormat().format((b*d).toFixed(5))),$("#maxUCOValue").attr("value",Math.min(b,u).toFixed(5)),p=d}},5e3),$("#recipientAddress").on("change",async d=>{let b=await v($(d.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(b).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*b).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("input",d=>{let u=$(d.target).val();$("#swapBalanceUSD").text((u*p).toFixed(5))}),$("#maxButton").on("click",()=>{let d=$("#maxUCOValue").val();$("#nbTokensToSwap").val(d),$("#swapBalanceUSD").text((d*p).toFixed(5))}),$("#close").on("click",()=>{$("#workflow").hide()});let y=localStorage.getItem("pendingTransfer"),C;y&&(C=await he(y,t,m,I,c,a)),$("#swapForm").on("submit",async d=>{if(d.preventDefault(),!d.target.checkValidity())return;if($("#error").text(""),C){B();try{await k(localStorage.getItem("transferStep"),C)}catch(b){H(b,S,JSON.parse(y,t))}return}let u=$("#recipientAddress").val();await ce(a,m,c,u,t,h,l,n,g)})}async function Y(t,a,n,s){let o=t;t.length>4&&(o=t.substring(0,5)+"..."+t.substring(t.length-3)),$("#accountName").html(`Account<br><a href="${n}/address/${t}" target="_blank">${o}</a>`);let c=(20/s).toFixed(5),r=await F(t,a,s);return $("#maxUCOValue").attr("value",Math.min(r,c).toFixed(5)),r}async function F(t,a,n){let s=await a.balanceOf(t),o=ethers.utils.formatUnits(s,18);return $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(o).toFixed(8))),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((o*n).toFixed(5))),o}async function ce(t,a,n,s,o,c,r,i,h){_(),S=0;let l=$("#nbTokensToSwap").val();if(h*1e18<l*1e18){$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#error").text(`Insufficient UCO on ${i}`),$("#close").show();return}if(await v(r)<=l*1e8){$("#error").text("Bridge has insuffficient funds. Please retry later..."),$("#close").show();return}$("#steps").show();let m=new Uint8Array(32);crypto.getRandomValues(m);let x=E(m),g=await crypto.subtle.digest("SHA-256",m);g=new Uint8Array(g);let y=E(g);$("#ethDeploymentStep").addClass("is-active"),S=1;try{let{contract:C,transaction:d}=await J(n,a.address,l,g,t,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:C.address,secretHex:x,secretDigestHex:y,amount:l,recipientArchethic:s,HTLC_transaction:d,sourceChainName:i,sourceChainExplorer:c})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active"),$("#txSummary1Label").html(`Contract address on ${i}: <a href="${c}/address/${C.address}" target="_blank">${C.address}</a>`),$("#txSummary1").show(),await k("deployedEthContract",{HTLC_Contract:C,secretHex:x,secretDigestHex:y,amount:l,ethChainId:o,recipientEthereum:n,recipientArchethic:s,unirisContract:a,signer:t,sourceChainExplorer:c,toChainExplorer:I,HTLC_transaction:d,sourceChainName:i})}catch(C){let d=localStorage.getItem("pendingTransfer"),u=JSON.parse(d);H(C,S,u,o)}}async function k(t,a){switch(t){case"deployedEthContract":return t=2,a=await j(a),F(await a.signer.getAddress(),a.unirisContract,p),await k("transferedERC20",a);case"transferedERC20":return t=3,a=await W(a),await k("deployedArchethicContract",a);case"deployedArchethicContract":return t=4,$("#swapStep").addClass("is-active"),a=await V(a),await k("withdrawEthContract",a);case"withdrawEthContract":await q(a),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#close").show(),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),$("#recipientAddress").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),F(await a.signer.getAddress(),a.unirisContract,p),setTimeout(async()=>{let s=await v(a.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(s).toFixed(2)),$("#toBalanceUSD").text((p*s).toFixed(5))},2e3);break}}async function he(t,a,n,s,o,c){$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let r=JSON.parse(t),i={HTLC_Contract:await N(r.HTLC_Address,w),HTLC_transaction:r.HTLC_transaction,secretHex:r.secretHex,secretDigestHex:r.secretDigestHex,amount:r.amount,ethChainId:a,recipientEthereum:o,recipientArchethic:r.recipientArchethic,unirisContract:n,signer:c,erc20transferAddress:r.erc20transferAddress,archethicContractAddress:r.archethicContractAddress,withdrawEthereumAddress:r.withdrawEthereumAddress,sourceChainExplorer:r.sourceChainExplorer,toChainExplorer:s,sourceChainName:r.sourceChainName};$("#recipientAddress").val(r.recipientArchethic),$("#recipientAddress").prop("disabled",!0),$("#nbTokensToSwap").val(r.amount),$("#nbTokensToSwap").prop("disabled",!0);let l=await v(r.recipientArchethic)/1e8;switch($("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(l).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*l).toFixed(5))),$("#swapBalanceUSD").text((r.amount*p).toFixed(5)),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#txSummary1Label").html(`Contract address on ${r.sourceChainName}: <a href="${r.sourceChainExplorer}/address/${r.HTLC_Address}" target="_blank">${r.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),S=2,r.erc20transferAddress&&(S=3,$("#txSummary2Label").html(`Provision UCOs: <a href="${r.sourceChainExplorer}/tx/${r.erc20transferAddress}" target="_blank">${r.erc20transferAddress}</a>`),$("#txSummary2").show()),r.archethicContractAddress&&(S=4,$("#txSummary3Label").html(`Contract address on Archethic: <a href="${s}/${r.archethicContractAddress}" target="_blank">${r.archethicContractAddress}</a>`),$("#txSummary3").show()),r.withdrawEthereumAddress&&($("#txSummary4Label").html(`${fromChainName} swap: <a href="${r.sourceChainExplorer}/tx/${r.withdrawEthereumAddress}" target="_blank">${r.withdrawEthereumAddress}</a>`),$("#txSummary4").show()),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),S){case 2:$("#ethTransferStep").addClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-failed is-active"),$("#ethTransferStep").removeClass("is-failed is-active");break;case 4:$("#swapStep").addClass("is-active"),$("#swapStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;default:break}return $("#steps").show(),i}})();
//# sourceMappingURL=app.js.map
