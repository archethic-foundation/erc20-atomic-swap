(()=>{window.onload=async function(){if(typeof window.ethereum<"u")console.log("MetaMask is installed!");else throw"No ethereum provider is installed"};$("#connectMetamaskBtn").on("click",async()=>{provider=new ethers.providers.Web3Provider(window.ethereum),await provider.send("eth_requestAccounts",[]);try{await C(provider)}catch(e){$("#error").text(`An error occured: ${e.message||e}`).show()}});async function C(e){let{chainId:t}=await e.getNetwork(),n;switch(t){case 137:n="Polygon-logo.svg";break;case 56:n="BSC-logo.svg";break;default:n="Ethereum-logo.svg";break}let{archethicEndpoint:a,unirisTokenAddress:i,recipientEthereum:s,sufficientFunds:c,UCOPrice:o}=await O(t);if($("#sourceChainImg").attr("src",`assets/images/bc-logos/${n}`),$("#main").hide(),$("#swapForm").show(),$("#ucoPrice").text(`1 UCO = ${o}$`).show(),$("#fromBalanceUSD").text(`= ${o}`).show(),$("#toBalanceUSD").text("= 0.0").show(),!c){$("#error").text("An error occured: Bridge has insuffficient funds. Please retry later");return}let h=new Archethic(a);await h.connect(),console.log("Archethic endpoint: ",a);let r=e.getSigner(),w=await r.getAddress(),l=await A(i,e),p=await l.balanceOf(w);$("#ucoEthBalance").text(ethers.utils.formatUnits(p,18)),$("#recipientAddress").on("change",async d=>{let u=await T(h,$(d.target).val());$("#ucoArchethicBalance").val(u/1e8),$("#toBalanceUSD").text(`= ${o*(u/1e8)}`).show()}),$("#nbTokenToSwap").on("change",d=>{let u=$(d.target).val();$("#fromBalanceUSD").text(`= ${u*o}`)}),$("#btnSwap").show(),$("#swapForm").on("submit",async d=>{if(d.preventDefault(),!d.target.checkValidity())return;let u=$("#recipientAddress").val();await b(r,l,s,u,t,h,o)})}async function A(e,t){let n=await B();return new ethers.Contract(e,n,t)}async function b(e,t,n,a,i,s,c){$("#steps").show();let o=new Uint8Array(32);crypto.getRandomValues(o);let h=g(o),r=await crypto.subtle.digest("SHA-256",o);r=new Uint8Array(r);let w=g(r),l=$("#nbTokensToSwap").val();$("#connectingStep").addClass("is-active");try{let d=(await j(n,t.address,l,r,e,1e4)).address;await v(l,d,t,e);let u=await S(w,a,l,d,i);console.log("Contract address on Archethic",u),$("#connectingStep").removeClass("is-active"),$("#swapStep").addClass("is-active"),await U(u,d,h,i),console.log("Token swap finish"),$("#swapStep").removeClass("is-active"),$("#endPhase").addClass("is-active");let y=await T(s,a);$("#ucoArchethicBalance").val(y/1e8),$("#toBalanceUSD").text(`= ${c*(y/1e8)}`).show()}catch(p){console.error(p.message||p),$("#error").text(`An error occured: ${p.message||p}`).show()}}async function S(e,t,n,a,i){let s=new Date;s.setSeconds(s.getSeconds()+1e4);let c=Math.floor(s/1e3);return fetch("/swap/deployContract",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({secretHash:e,recipientAddress:t,amount:n*1e8,endTime:c,ethereumContractAddress:a,ethereumChainId:i})}).then(f).then(o=>o.contractAddress)}async function U(e,t,n,a){return fetch("/swap/withdraw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({archethicContractAddress:e,ethereumContractAddress:t,secret:n,ethereumChainId:a})}).then(f)}async function j(e,t,n,a,i,s){let{abi:c,bytecode:o}=await x(),r=await new ethers.ContractFactory(c,o,i).deploy(e,t,ethers.utils.parseUnits(n,18),a,s,{gasLimit:1e6});return await r.deployTransaction.wait(),console.log("HTLC contract deployed at "+r.address),r}async function v(e,t,n,a){await n.connect(a).transfer(t,ethers.utils.parseUnits(e,18));let s=n.filters.Transfer(null,t);return new Promise((c,o)=>{n.on(s,(h,r,w,l)=>{console.log(ethers.utils.formatUnits(w,18)+" UCO transfered"),c()})})}var m=[];for(let e=0;e<=255;++e){let t=e.toString(16).padStart(2,"0");m.push(t)}function g(e){let t=new Uint8Array(e),n=new Array(t.length);for(let a=0;a<t.length;++a)n[a]=m[t[a]];return n.join("")}async function O(e){return fetch("/status",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({ethereumChainId:e})}).then(f).then(t=>{if(t.status!="ok")throw t.status;return{archethicEndpoint:t.archethicEndpoint,unirisTokenAddress:t.unirisTokenAddress,recipientEthereum:t.recipientEthereum,sufficientFunds:t.sufficientFunds,UCOPrice:t.UCOPrice}})}async function B(){return await(await fetch("uco_ABI.json")).json()}async function x(){let t=await(await fetch("HTLC.json")).json();return{abi:t.abi,bytecode:t.bytecode}}async function T(e,t){return e.requestNode(async n=>{let a=new URL("/api",n),s=await(await fetch(a,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:`
            query {
              lastTransaction(address: "${t}") {
                 balance {
                   uco
                 }
              }
            }
          `})})).json();return s.errors&&s.errors.find(c=>c.message=="transaction_not_exists")?await k(e,t):s.data.lastTransaction&&s.data.lastTransaction.balance?s.data.lastTransaction.balance.uco:0})}async function k(e,t){return e.requestNode(async n=>{let a=new URL("/api",n),s=await(await fetch(a,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({query:`
            query {
              transactionInputs(address: "${t}") {
                 type,
                 amount
              }
            }
          `})})).json();return s.data.transactionInputs&&s.data.transactionInputs.length>0?s.data.transactionInputs.filter(c=>c.type=="UCO").reduce((c,{amount:o})=>c+o,0):0})}async function f(e){return new Promise(function(t,n){e.status>=200&&e.status<=299?e.json().then(t):e.json().then(n).catch(()=>n(e.statusText))})}})();
//# sourceMappingURL=app.js.map
