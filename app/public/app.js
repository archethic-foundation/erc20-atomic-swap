(()=>{function I(){$("#main").hide(),$("#swapForm").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),O(),$("#error").text(""),$("#btnSwap").prop("disabled",!0),$("#btnSwap").text("Transfer"),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),$("#btnSwapSpinnerText").hide(),U()}function F(){$("#connectionError").text("").hide(),$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),$("#swapForm").hide(),$("#main").show()}function v(e){$("#connectMetamaskBtnSpinner").hide(),$("#connectMetamaskBtn").show(),$("#connectionError").text(e).show()}function D(){O(),k(),$("#steps").hide(),U(),$("#error").text("")}function k(){$("#btnSwap").hide(),$("#btnSwapSpinner").prop("disabled",!0),$("#btnSwapSpinner").show(),$("#btnSwapSpinnerText").show(),$("#workflow").show(),$("#close").hide()}function O(){$("#txSummary1Label").text(""),$("#txSummary1").hide(),$("#txSummary2Label").text(""),$("#txSummary2").hide(),$("#txSummary3Label").text(""),$("#txSummary3").hide(),$("#txSummary4Label").text(""),$("#txSummary4").hide(),$("#txSummary5Label").text(""),$("#txSummary5").hide(),$("#txSummary6Label").text(""),$("#txSummary6").hide(),$("#txSummaryFinished").hide()}function U(){$("#ethDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#swapStep").removeClass("is-active"),$("#swapStep").removeClass("is-failed")}async function y(e){return new Promise(function(t,r){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(r).catch(()=>r(e.statusText))})}var _=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");_.push(t)}function L(e){let t=new Uint8Array(e),r=new Array(t.length);for(let n=0;n<t.length;++n)r[n]=_[t[n]];return r.join("")}function H(e,t){switch($("#btnSwap").prop("disabled",!1),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#btnSwap").show(),$("#btnSwapSpinner").hide(),console.error(e.message||e),$("#error").text(`${e.message||e}`).show(),$("#close").show(),t){case 1:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethTransferStep").addClass("is-failed"),$("#archethicDeploymentStep").addClass("is-failed"),$("#swapStep").addClass("is-failed");break;case 2:$("#ethTransferStep").addClass("is-failed"),$("#ethTransferStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active"),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed");break;case 4:$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#swapStep").addClass("is-failed"),$("#swapStep").removeClass("is-active");break;default:break}}function P(e){switch(e){case 80001:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Mumbai Polygon Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 137:sourceChainLogo="Polygon-logo.svg",fromChainName="Polygon",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Polygon"),$("#toNetworkLabel").text("Archethic");break;case 97:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 56:sourceChainLogo="BSC-logo.svg",fromChainName="Binance",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("BSC"),$("#toNetworkLabel").text("Archethic");break;case 5:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Goerli Ethereum Testnet"),$("#toNetworkLabel").text("Archethic Testnet");break;case 1337:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum Devnet"),$("#toNetworkLabel").text("Archethic Devnet");break;default:sourceChainLogo="Ethereum-logo.svg",fromChainName="Ethereum",$("#fromChain").text(fromChainName),$("#fromNetworkLabel").text("Ethereum"),$("#toNetworkLabel").text("Archethic");break}return $("#sourceChainImg").attr("src",`assets/images/bc-logos/${sourceChainLogo}`),fromChainName}async function R(e,t){let r=await te();return new ethers.Contract(e,r,t)}async function M(e,t){let{abi:r}=await G();return new ethers.Contract(e,r,t)}async function j(e,t,r,n,i,c){let{abi:o,bytecode:s}=await G(),l=await new ethers.ContractFactory(o,s,i).deploy(e,t,ethers.utils.parseUnits(r,18),n,c,{gasLimit:1e6}),d=await l.deployTransaction.wait();return console.log(d),console.log("HTLC contract deployed at "+l.address),{contract:l,transaction:d}}async function Q(e,t,r,n){return await(await r.connect(n).transfer(t,ethers.utils.parseUnits(e,18))).wait()}async function J(e){let{HTLC_Contract:t,amount:r,unirisContract:n,signer:i,sourceChainExplorer:c}=e;$("#ethTransferStep").addClass("is-active");let o=await Q(r,t.address,n,i);localStorage.setItem("transferStep","transferedERC20");let s=localStorage.getItem("pendingTransfer"),a=JSON.parse(s);return a.erc20transferAddress=o.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(a)),console.log(`${r} UCO transfered`),$("#txSummary2Label").html(`Provision UCOs: <a href="${c}/tx/${o.transactionHash}" target="_blank">${o.transactionHash}</a>`),$("#txSummary2").show(),$("#ethTransferStep").removeClass("is-active"),e.erc20transferAddress=o.transactionHash,e}async function W(e){let{HTLC_Contract:t,amount:r,secretDigestHex:n,recipientArchethic:i,ethChainId:c,toChainExplorer:o,HTLC_transaction:s}=e;$("#archethicDeploymentStep").addClass("is-active"),step=3;let a=await Y(n,i,r,t.address,s.transactionHash,c);localStorage.setItem("transferStep","deployedArchethicContract");let l=localStorage.getItem("pendingTransfer"),d=JSON.parse(l);return d.archethicContractAddress=a,localStorage.setItem("pendingTransfer",JSON.stringify(d)),console.log("Contract address on Archethic",a),$("#txSummary3Label").html(`Contract address on Archethic: <a href="${o}/${a}" target="_blank">${a}</a>`),$("#txSummary3").show(),$("#archethicDeploymentStep").removeClass("is-active"),e.archethicContractAddress=a,e}async function V(e){let{HTLC_Contract:t,signer:r,secretHex:n,unirisContract:i,UCOPrice:c,sourceChainExplorer:o}=e,s=await Z(t,r,n);localStorage.setItem("transferStep","withdrawEthContract");let a=localStorage.getItem("pendingTransfer"),l=JSON.parse(a);l.withdrawEthereumAddress=s.transactionHash,localStorage.setItem("pendingTransfer",JSON.stringify(l)),console.log(`Ethereum's withdraw transaction - ${s.transactionHash}`),$("#txSummary4Label").html(`${fromChainName} swap: <a href="${o}/tx/${s.transactionHash}" target="_blank">${s.transactionHash}</a>`),$("#txSummary4").show();let d=await r.getAddress(),f=await i.balanceOf(d),u=ethers.utils.formatUnits(f,18);$("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(u).toFixed(2)));let x=20/c;return $("#maxUCOValue").text(Math.min(u/c,x).toFixed(5)),$("#fromBalanceUSD").text((u*c).toFixed(5)),e.withdrawEthereumAddress=s.transactionHash,e}async function q({archethicContractAddress:e,HTLC_Contract:t,withdrawEthereumAddress:r,secretHex:n,ethChainId:i,toChainExplorer:c}){console.log(e);let{archethicWithdrawTransaction:o,archethicTransferTransaction:s}=await ee(e,t.address,r,n,i);localStorage.setItem("transferStep","withdrawArchethicContract"),console.log(`Archethic's withdraw transaction ${o}`),console.log(`Archethic's transfer transaction ${s}`),$("#txSummary5Label").html(`Archethic swap: <a href="${c}/${o}" target="_blank">${o}</a>`),$("#txSummary5").show(),$("#txSummary6Label").html(`Archethic transfer: <a href="${c}/${s}" target="_blank">${s}</a>`),$("#txSummary6").show(),$("#txSummaryFinished").show()}async function Y(e,t,r,n,i,c){let o=new Date;o.setSeconds(o.getSeconds()+1e4);let s=Math.floor(o/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:r*1e8,endTime:s,ethereumContractAddress:n,ethereumContractTransaction:i,ethereumChainId:c})}).then(y).then(a=>a.contractAddress)}async function Z(e,t,r){return await(await(await e.connect(t)).withdraw(`0x${r}`,{gasLimit:1e7})).wait()}async function ee(e,t,r,n,i){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,ethereumWithdrawTransaction:r,secret:n,ethereumChainId:i})}).then(y).then(c=>{let{archethicWithdrawTransaction:o,archethicTransferTransaction:s}=c;return{archethicWithdrawTransaction:o,archethicTransferTransaction:s}})}async function te(){return await(await fetch("uco_abi.json")).json()}async function G(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function T(e){return fetch(`/balances/archethic/${e}`).then(y).then(t=>t.balance)}async function N(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(y).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice,sourceChainExplorer:t.sourceChainExplorer,bridgeAddress:t.bridgeAddress}})}var w,z;window.onload=async function(){try{if(typeof window.ethereum<"u")console.log("MetaMask is installed!"),w=new ethers.providers.Web3Provider(window.ethereum),localStorage.getItem("walletInjected?")&&($("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),K(),await E());else throw"No ethereum provider is installed"}catch(e){localStorage.setItem("walletInjected?",!1),v(e.message||e)}};$("#connectMetamaskBtn").on("click",async()=>{try{$("#connectMetamaskBtn").hide(),$("#connectMetamaskBtnSpinner").show(),await w.send("eth_requestAccounts",[]),localStorage.setItem("walletInjected?",!0),K(),await E()}catch(e){v(e.message||e)}});function K(){w.provider.on("chainChanged",e=>{w=new ethers.providers.Web3Provider(window.ethereum),F(),clearInterval(z),E().catch(t=>v(t.message||t))})}var B,S,p;async function E(){let{chainId:e}=await w.getNetwork(),t=w.getSigner(),r=P(e),{archethicEndpoint:n,unirisTokenAddress:i,recipientEthereum:c,sufficientFunds:o,UCOPrice:s,sourceChainExplorer:a,bridgeAddress:l}=await N(e);p=s,I();let d=(20/s).toFixed(5);if($("#nbTokensToSwap").attr("max",d),B=`${n}/explorer/transaction`,$("#ucoPrice").text(`1 UCO = ${s.toFixed(5)}$`).show(),$("#swapBalanceUSD").text(0),!o){$("#error").text("Bridge has insufficient funds. Please retry later...");return}console.log("Archethic endpoint: ",n);let f=await R(i,w),u=await t.getAddress(),x=await X(u,f,a,p);w.provider.on("accountsChanged",async h=>{let m=h[0];x=await X(m,f,a,p)}),z=setInterval(async()=>{let{UCOPrice:h}=await N(e);if(h!=p){$("#ucoPrice").text(`1 UCO = ${h.toFixed(5)}$`).show();let m=(20/h).toFixed(5);$("#nbTokensToSwap").attr("max",m);let C=parseFloat($("#fromBalanceUCO").text());$("#fromBalanceUSD").text(new Intl.NumberFormat().format((C*h).toFixed(5))),$("#maxUCOValue").attr("value",Math.min(C,m).toFixed(5)),p=h}},5e3),$("#recipientAddress").on("change",async h=>{let C=await T($(h.target).val())/1e8;$("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(C).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*C).toFixed(5))),$("#btnSwap").prop("disabled",!1)}),$("#recipientAddress").focus(),$("#nbTokensToSwap").on("input",h=>{let m=$(h.target).val();$("#swapBalanceUSD").text((m*p).toFixed(5))}),$("#maxButton").on("click",()=>{let h=$("#maxUCOValue").val();$("#nbTokensToSwap").val(h),$("#swapBalanceUSD").text((h*p).toFixed(5))}),$("#close").on("click",()=>{$("#workflow").hide()});let g=localStorage.getItem("pendingTransfer"),b;g&&(b=await re(g,e,f,a,B,c,t,r)),$("#swapForm").on("submit",async h=>{if(h.preventDefault(),!h.target.checkValidity())return;if($("#error").text(""),b){k();try{await A(localStorage.getItem("transferStep"),b)}catch(C){H(C,S)}return}let m=$("#recipientAddress").val();await ae(t,f,c,m,e,s,a,l,r,x)})}async function X(e,t,r,n){let i=e;e.length>4&&(i=e.substring(0,5)+"..."+e.substring(e.length-3)),$("#accountName").html(`Account<br><a href="${r}/address/${e}" target="_blank">${i}</a>`);let c=(20/n).toFixed(5),o=await t.balanceOf(e),s=ethers.utils.formatUnits(o,18);return $("#fromBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(s).toFixed(8))),$("#maxUCOValue").attr("value",Math.min(s,c).toFixed(5)),$("#fromBalanceUSD").text(new Intl.NumberFormat().format((s*n).toFixed(5))),s}async function ae(e,t,r,n,i,c,o,s,a,l){D(),S=0;let d=$("#nbTokensToSwap").val();if(l*1e18<d*1e18){$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),$("#error").text(`Insufficient UCO on ${a}`),$("#close").show();return}if(await T(s)<=d*1e8){$("#error").text("Bridge has insuffficient funds. Please retry later..."),$("#close").show();return}$("#steps").show();let u=new Uint8Array(32);crypto.getRandomValues(u);let x=L(u),g=await crypto.subtle.digest("SHA-256",u);g=new Uint8Array(g);let b=L(g);$("#ethDeploymentStep").addClass("is-active"),S=1;try{let{contract:h,transaction:m}=await j(r,t.address,d,g,e,7200);localStorage.setItem("pendingTransfer",JSON.stringify({HTLC_Address:h.address,secretHex:x,secretDigestHex:b,amount:d,recipientArchethic:n,HTLC_transaction:m})),localStorage.setItem("transferStep","deployedEthContract"),$("#ethDeploymentStep").removeClass("is-active");let C=h.address;$("#txSummary1Label").html(`Contract address on ${a}: <a href="${o}/address/${h.address}" target="_blank">${h.address}</a>`),$("#txSummary1").show(),await A("deployedEthContract",{HTLC_Contract:h,secretHex:x,secretDigestHex:b,amount:d,ethChainId:i,recipientEthereum:r,recipientArchethic:n,unirisContract:t,signer:e,sourceChainExplorer:o,toChainExplorer:B,HTLC_transaction:m})}catch(h){H(h,S)}}async function A(e,t){switch(e){case"deployedEthContract":return e=2,t=await J(t),await A("transferedERC20",t);case"transferedERC20":return e=3,t=await W(t),await A("deployedArchethicContract",t);case"deployedArchethicContract":return e=4,$("#swapStep").addClass("is-active"),t=await V(t),await A("withdrawEthContract",t);case"withdrawEthContract":await q(t),$("#swapStep").removeClass("is-active"),$("#btnSwapSpinner").hide(),$("#btnSwap").prop("disabled",!1),$("#btnSwap").show(),$("#nbTokensToSwap").prop("disabled",!1),$("#recipientAddress").prop("disabled",!1),$("#close").show(),console.log("Token swap finish"),localStorage.removeItem("transferStep"),localStorage.removeItem("pendingTransfer"),setTimeout(async()=>{let n=await T(t.recipientArchethic)/1e8;$("#toBalanceUCO").text(parseFloat(n).toFixed(2)),$("#toBalanceUSD").text((p*n).toFixed(5))},2e3);break}}async function re(e,t,r,n,i,c,o,s){$("#btnSwapSpinnerText").text("Loading previous transfer"),$("#btnSwapSpinner").show(),$("#btnSwap").hide();let a=JSON.parse(e),l={HTLC_Contract:await M(a.HTLC_Address,w),HTLC_transaction:a.HTLC_transaction,secretHex:a.secretHex,secretDigestHex:a.secretDigestHex,amount:a.amount,ethChainId:t,recipientEthereum:c,recipientArchethic:a.recipientArchethic,unirisContract:r,signer:o,erc20transferAddress:a.erc20transferAddress,archethicContractAddress:a.archethicContractAddress,withdrawEthereumAddress:a.withdrawEthereumAddress,sourceChainExplorer:n,toChainExplorer:i};$("#recipientAddress").val(a.recipientArchethic),$("#nbTokensToSwap").val(a.amount);let f=await T(a.recipientArchethic)/1e8;switch($("#toBalanceUCO").text(new Intl.NumberFormat().format(parseFloat(f).toFixed(8))),$("#toBalanceUSD").text(new Intl.NumberFormat().format((p*f).toFixed(5))),$("#swapBalanceUSD").text((a.amount*p).toFixed(5)),$("#ethDeploymentStep").removeClass("is-active is-failed"),$("#txSummary1Label").html(`Contract address on ${s}: <a href="${n}/address/${a.HTLC_Address}" target="_blank">${a.HTLC_Address}</a>`),$("#txSummary1").show(),$("#ethTransferStep").addClass("is-active"),S=2,a.erc20transferAddress&&(S=3,$("#txSummary2Label").html(`Provision UCOs: <a href="${n}/tx/${a.erc20transferAddress}" target="_blank">${a.erc20transferAddress}</a>`),$("#txSummary2").show()),a.archethicContractAddress&&(S=4,$("#txSummary3Label").html(`Contract address on Archethic: <a href="${i}/${a.archethicContractAddress}" target="_blank">${a.archethicContractAddress}</a>`),$("#txSummary3").show()),a.withdrawEthereumAddress&&($("#txSummary4Label").html(`${s} swap: <a href="${n}/tx/${a.withdrawEthereumAddress}" target="_blank">${a.withdrawEthereumAddress}</a>`),$("#txSummary4").show()),$("#btnSwapSpinner").hide(),$("#btnSwap").show(),$("#btnSwap").prop("disabled",!1),S){case 2:$("#ethTransferStep").addClass("is-active"),$("#ethTransferStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;case 3:$("#archethicDeploymentStep").addClass("is-active"),$("#archethicDeploymentStep").removeClass("is-failed"),$("#ethDeploymentStep").removeClass("is-failed is-active"),$("#ethTransferStep").removeClass("is-failed is-active");break;case 4:$("#swapStep").addClass("is-active"),$("#swapStep").removeClass("is-failed"),$("#archethicDeploymentStep").removeClass("is-active is-failed"),$("#ethTransferStep").removeClass("is-active is-failed"),$("#ethDeploymentStep").removeClass("is-active is-failed");break;default:break}return $("#steps").show(),l}})();
//# sourceMappingURL=app.js.map
