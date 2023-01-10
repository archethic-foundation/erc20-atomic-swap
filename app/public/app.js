(()=>{window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{try{provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]),await A(provider)}catch(t){$("#error").text(`An error occured: ${t.message||t}`).show()}});async function A(t){let{chainId:e}=await t.getNetwork(),a=t.getSigner(),n;switch(e){case 80001:n="Polygon-logo.svg";break;case 137:n="Polygon-logo.svg";break;case 97:n="BSC-logo.svg";break;case 56:n="BSC-logo.svg";break;default:n="Ethereum-logo.svg";break}let{archethicEndpoint:c,unirisTokenAddress:s,recipientEthereum:o,sufficientFunds:i,UCOPrice:d}=await j(e);if($("#sourceChainImg").attr("src",`assets/images/bc-logos/${n}`),$("#main").hide(),$("#swapForm").show(),$("#ucoPrice").text(`1 UCO = ${d}$`).show(),$("#swapBalanceUSD").text(d),!i){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}let r=new Archethic(c);await r.connect(),console.log("Archethic endpoint: ",c);let f=await a.getAddress(),l=await b(s,t),h=await l.balanceOf(f),p=ethers.utils.formatUnits(h,18);$("#fromBalanceUCO").text(p),$("#fromBalanceUSD").text(p*d),$("#recipientAddress").on("change",async u=>{let y=await T(r,$(u.target).val())/1e8;$("#toBalanceUCO").text(y),$("#toBalanceUSD").text(d*y)}),$("#nbTokensToSwap").on("change",u=>{let w=$(u.target).val();$("#swapBalanceUSD").text(w*d)}),$("#btnSwap").show(),$("#swapForm").on("submit",async u=>{if(u.preventDefault(),!u.target.checkValidity())return;let w=$("#recipientAddress").val();await S(a,l,o,w,e,r,d)})}async function b(t,e){let a=await v();return new ethers.Contract(t,a,e)}async function S(t,e,a,n,c,s,o){$("#steps").show();let i=new Uint8Array(32);crypto.getRandomValues(i);let d=C(i),r=await crypto.subtle.digest("SHA-256",i);r=new Uint8Array(r);let f=C(r),l=$("#nbTokensToSwap").val();$("#connectingStep").addClass("is-active");try{let p=(await B(a,e.address,l,r,t,1e4)).address;await x(l,p,e,t);let u=await U(f,n,l,p,c);console.log("Contract address on Archethic",u),$("#connectingStep").removeClass("is-active"),$("#swapStep").addClass("is-active"),await O(u,p,d,c),console.log("Token swap finish");let y=await T(s,n)/1e8;$("#toBalanceUCO").text(y),$("#toBalanceUSD").text(o*y),$("#swapStep").removeClass("is-active"),$("#endPhase").addClass("is-active")}catch(h){console.error(h.message||h),$("#error").text(`An error occured: ${h.message||h}`).show()}}async function U(t,e,a,n,c){let s=new Date;s.setSeconds(s.getSeconds()+1e4);let o=Math.floor(s/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:t,recipientAddress:e,amount:a*1e8,endTime:o,ethereumContractAddress:n,ethereumChainId:c})}).then(g).then(i=>i.contractAddress)}async function O(t,e,a,n){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:t,ethereumContractAddress:e,secret:a,ethereumChainId:n})}).then(g).then(c=>{let{ethereumWithdrawTransaction:s,archethicWithdrawTransaction:o}=c;console.log(`Ethereum's withdraw transaction ${s}`),console.log(`Archethic's withdraw transaction ${o}`)})}async function B(t,e,a,n,c,s){let{abi:o,bytecode:i}=await k(),r=await new ethers.ContractFactory(o,i,c).deploy(t,e,ethers.utils.parseUnits(a,18),n,s,{gasLimit:1e6});return await r.deployTransaction.wait(),console.log("HTLC contract deployed at "+r.address),r}async function x(t,e,a,n){await(await a.connect(n).transfer(e,ethers.utils.parseUnits(t,18))).wait(),console.log(`${t} UCO transfered`)}var m=[];for(let t=0;t<=255;++t){let e=t.toString(16).padStart(2,"0");m.push(e)}function C(t){let e=new Uint8Array(t),a=new Array(e.length);for(let n=0;n<e.length;++n)a[n]=m[e[n]];return a.join("")}async function j(t){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:t})}).then(g).then(e=>{if(e.status!="ok")throw e.status;return{archethicEndpoint:e.archethicEndpoint,unirisTokenAddress:e.unirisTokenAddress,recipientEthereum:e.recipientEthereum,sufficientFunds:e.sufficientFunds,UCOPrice:e.UCOPrice}})}async function v(){return await(await fetch("uco_ABI.json")).json()}async function k(){let e=await(await fetch("HTLC.json")).json();return{abi:e.abi,bytecode:e.bytecode}}async function T(t,e){return t.requestNode(async a=>{let n=new URL("/api",a),s=await(await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:`
            query {
              lastTransaction(address: "${e}") {
                 balance {
                   uco
                 }
              }
            }
          `})})).json();return s.errors&&s.errors.find(o=>o.message=="transaction_not_exists")?await H(t,e):s.data.lastTransaction&&s.data.lastTransaction.balance?s.data.lastTransaction.balance.uco:0})}async function H(t,e){return t.requestNode(async a=>{let n=new URL("/api",a),s=await(await fetch(n,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:`
            query {
              transactionInputs(address: "${e}") {
                 type,
                 amount
              }
            }
          `})})).json();return s.data.transactionInputs&&s.data.transactionInputs.length>0?s.data.transactionInputs.filter(o=>o.type=="UCO").reduce((o,{amount:i})=>o+i,0):0})}async function g(t){return new Promise(function(e,a){t.status>=200&&t.status<=299?t.json().then(e):t.json().then(a).catch(()=>a(t.statusText))})}})();
//# sourceMappingURL=app.js.map
