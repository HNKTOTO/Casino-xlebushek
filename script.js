const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SUF=["","K","M","B","T","Qa","Qi"];
function fmt(n){n=Math.floor(n);if(n<1e6)return n.toLocaleString("uk-UA");let i=0,v=n;while(v>=1000&&i<SUF.length-1){v/=1000;i++}let s=v>=100?v.toFixed(0):v.toFixed(v>=10?1:2);if(s.includes("."))s=s.replace(/\.?0+$/,"");return s+SUF[i]}
let S={bal:10000,max:10000,ach:{},imf:0,mute:false};
try{const s=JSON.parse(localStorage.getItem("zwd_casino")||"null");if(s)S={...S,...s}}catch(e){}
const save=()=>{try{localStorage.setItem("zwd_casino",JSON.stringify(S))}catch(e){}};

/* ---- Sound (Web Audio) ---- */
let AC;
function tone(f,d=.1,t="sine",v=.06,w=0){if(S.mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),s=AC.currentTime+w;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(AC.destination);o.start(s);o.stop(s+d)}catch(e){}}
const sfx={click:()=>tone(520,.05,"square",.03),coin:()=>{tone(1318,.08,"triangle",.07);tone(1760,.25,"triangle",.07,.07)},
win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.2,"triangle",.07,i*.09)),lose:()=>[300,220,160].forEach((f,i)=>tone(f,.22,"sawtooth",.04,i*.12)),
spin:()=>{for(let i=0;i<14;i++)tone(300+i*18,.03,"square",.02,i*.3)},roll:()=>{for(let i=0;i<8;i++)tone(200+Math.random()*300,.04,"square",.03,i*.09)}};

/* ---- Achievements ---- */
const ACH=[[1e5,"Перший серйозний куш","🥉",0],[1e6,"Мільйонер Зімбабве","🥈",5e4],[1e7,"Олігарх саванни","🥇",5e5],[1e8,"Володар інфляції","👑",0],[1e9,"Головний банкір країни (1B+)","🏦",0],[-1,"Казино хлебушек","🍞",0,"Я обосрался: баланс упал до нуля"]];
function toast(ic,nm,bn){const t=document.createElement("div");t.className="toast";t.innerHTML=`<b>${ic} Досягнення!</b><br>${nm}${bn?`<br><span style="color:#6ee7b7">Бонус +${fmt(bn)} ZWD</span>`:""}`;$("#toasts").append(t);setTimeout(()=>t.remove(),4800)}
function checkAch(){let ch=1;while(ch){ch=0;for(const[th,nm,ic,bn]of ACH)if(th>0&&!S.ach[th]&&S.max>=th){S.ach[th]=1;ch=1;toast(ic,nm,bn);if(bn){S.bal+=bn;S.max=Math.max(S.max,S.bal)}sfx.win()}}}
$("#bAch").onclick=()=>{$("#mlist").innerHTML=ACH.map(([th,nm,ic,bn,ds])=>{const ok=S.ach[th];return `<div class="ar${ok?"":" lk"}"><span style="font-size:30px">${ic}</span><div class="grow"><b>${nm}</b><div class="mut" style="font-size:12px">${th>0?fmt(th)+" ZWD":ds}${bn?` · бонус +${fmt(bn)}`:""}</div>${ok||th<0?"":`<div class="pb"><i style="width:${Math.min(100,S.max/th*100)}%"></i></div>`}</div><span>${ok?"✅":"🔒"}</span></div>`}).join("");$("#mmax").textContent=fmt(S.max);$("#modal").classList.add("on")};
$("#modal").onclick=e=>{if(e.target.id==="modal"||e.target.id==="mx")$("#modal").classList.remove("on")};

/* ---- Balance / UI ---- */
const say=(t,c="")=>{const m=$("#msg");m.textContent=t;m.className="msg "+c};
function flash(){const b=$("#bal");b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop")}
function imfUI(){const w=60000-(Date.now()-S.imf),b=$("#bImf");b.disabled=!(S.bal<1&&w<=0);b.textContent=S.bal<1&&w>0?`🆘 ${Math.ceil(w/1000)}с`:"🆘 МВФ"}
function ui(){if(S.bal<1&&!S.ach[-1]){S.ach[-1]=1;toast("🍞","Казино хлебушек",0);sfx.lose()}const b=$("#bal");b.textContent=fmt(S.bal);b.title=Math.floor(S.bal).toLocaleString("uk-UA")+" ZWD";$("#achN").textContent=Object.keys(S.ach).length+"/"+ACH.length;imfUI();save()}
function addBal(d){S.bal+=d;if(S.bal>S.max)S.max=S.bal;checkAch();ui()}
setInterval(imfUI,1000);
$("#bImf").onclick=()=>{S.bal+=5000;S.imf=Date.now();say("МВФ надав екстрену допомогу: +5 000 ZWD. Наступна — через хвилину.","win");sfx.coin();flash();ui()};
$("#bMute").onclick=()=>{S.mute=!S.mute;$("#bMute").textContent=S.mute?"🔇":"🔊";save()};
const getBet=()=>Math.max(1,Math.floor(+String($("#bet").value).replace(/\D/g,""))||1);
const setBet=v=>{$("#bet").value=Math.max(1,Math.floor(v));$("#betf").textContent="= "+fmt(getBet());sfx.click()};
$("#bet").oninput=()=>$("#betf").textContent="= "+fmt(getBet());
$("#chips").innerHTML=[100,1e3,1e4,1e5,1e6,1e7].map(v=>`<button class="chip" data-v="${v}">${fmt(v)}</button>`).join("")+`<button class="chip" data-a="h">½</button><button class="chip" data-a="d">×2</button><button class="chip" data-a="m">MAX</button>`;
$("#chips").onclick=e=>{const c=e.target.closest(".chip");if(!c)return;const b=getBet(),a=c.dataset.a;setBet(c.dataset.v?+c.dataset.v:a==="h"?b/2:a==="d"?b*2:S.bal)};
function take(a){if(a<1||a>S.bal){say("Недостатньо коштів для такої ставки","lose");sfx.lose();return false}S.bal-=a;ui();sfx.click();return true}
function settle(ret,stake,txt=""){ret=Math.floor(ret);if(ret>0)addBal(ret);else ui();
 if(ret>stake){say(`${txt} Виграш +${fmt(ret-stake)} ZWD`,"win");ret>=stake*5?sfx.win():sfx.coin();flash()}
 else if(ret===stake)say(`${txt} Ставку повернуто`,"");
 else{say(`${txt} Програш −${fmt(stake-ret)} ZWD`,"lose");sfx.lose()}}

/* ---- Tabs Switch ---- */
$("#tabs").onclick=e=>{
 const t=e.target.closest(".tab");
 if(!t)return;
 $$(".tab").forEach(x=>x.classList.toggle("on",x===t));
 $$(".g").forEach(x=>x.classList.toggle("on",x.id==="g-"+t.dataset.g));
 sfx.click();
};

/* ---- Cards ---- */
const SU=["♠","♥","♦","♣"],RK=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
function deck(){const d=[];for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
const cardEl=(c,x="")=>`<div class="pc ${c.s===1||c.s===2?"rd":""} ${x}"><span>${RK[c.r]}</span><span class="su">${SU[c.s]}</span></div>`;

/* ---- Wheels ---- */
function wheel(el,it,col,lab,sz,fs){const s=360/it.length;el.style.width=el.style.height=sz+"px";el.style.background=`conic-gradient(${it.map((x,i)=>`${col(x)} ${i*s}deg ${(i+1)*s}deg`).join(",")})`;el.innerHTML=it.map((x,i)=>`<i class="wl" style="font-size:${fs}px;transform:translate(-50%,-50%) rotate(${(i+.5)*s}deg) translateY(-${sz/2-fs-10}px)">${lab(x)}</i>`).join("")}
function spinTo(el,idx,n){const s=360/n,cur=el._r||0,tg=(360-(idx+.5)*s)%360;el._r=cur+1800+((tg-cur%360)+360)%360;el.style.transform=`rotate(${el._r}deg)`}

/* ---- 1. Roulette ---- */
const ORD=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const rc=n=>n===0?"#0f9d6b":RED.has(n)?"#b3202f":"#16161a";
wheel($("#rw"),ORD,rc,n=>n,260,10);
$("#rgrid").innerHTML=`<div class="cell w" data-k="n0" style="background:${rc(0)}">0</div>`+[...Array(36)].map((_,i)=>`<div class="cell" data-k="n${i+1}" style="background:${rc(i+1)}">${i+1}</div>`).join("")
 +[["red","Червоне","#b3202f"],["black","Чорне","#16161a"],["even","Парне"],["odd","Непарне"],["low","1–18"],["high","19–36"]].map(([k,l,c])=>`<div class="cell o2" data-k="${k}"${c?` style="background:${c}"`:""}>${l}</div>`).join("")
 +[["d1","1–12"],["d2","13–24"],["d3","25–36"]].map(([k,l])=>`<div class="cell o" data-k="${k}">${l} ×3</div>`).join("");
const RB={};let rBusy=0;
function rRender(){$$("#rgrid [data-k]").forEach(c=>{const v=RB[c.dataset.k];let b=c.querySelector("b");if(v){if(!b){b=document.createElement("b");c.append(b)}b.textContent=fmt(v)}else if(b)b.remove()})}
$("#rgrid").onclick=e=>{const c=e.target.closest("[data-k]");if(!c||rBusy)return;const a=getBet();if(take(a)){RB[c.dataset.k]=(RB[c.dataset.k]||0)+a;rRender()}};
$("#rClr").onclick=()=>{if(rBusy)return;let t=0;for(const k in RB){t+=RB[k];delete RB[k]}S.bal+=t;ui();rRender()};
function rMult(k,n){if(k[0]==="n")return+k.slice(1)===n?36:0;if(!n)return 0;const r=RED.has(n);return{red:r?2:0,black:r?0:2,even:n%2?0:2,odd:n%2?2:0,low:n<=18?2:0,high:n>18?2:0,d1:n<=12?3:0,d2:n>12&&n<=24?3:0,d3:n>24?3:0}[k]}
$("#rSpin").onclick=()=>{if(rBusy)return;const ks=Object.keys(RB);if(!ks.length)return say("Зробіть ставку на полі","lose");rBusy=1;
 const idx=Math.floor(Math.random()*37),n=ORD[idx],o=$("#orb");spinTo($("#rw"),idx,37);o._r=(o._r||0)-2520;o.style.transform=`rotate(${o._r}deg)`;sfx.spin();say("Кулька котиться…");
 setTimeout(()=>{let st=0,rt=0;ks.forEach(k=>{st+=RB[k];rt+=RB[k]*rMult(k,n);delete RB[k]});rRender();
  $("#rlast").insertAdjacentHTML("afterbegin",`<span class="rn" style="background:${rc(n)}">${n}</span>`);if($("#rlast").children.length>12)$("#rlast").lastChild.remove();
  rBusy=0;settle(rt,st,`Випало ${n}.`)},5200)};

/* ---- 2. Coin ---- */
let cs=0,cb=0,cr=0;
$$(".sd").forEach(b=>b.onclick=()=>{cs=+b.dataset.s;$$(".sd").forEach(x=>x.classList.toggle("on",x===b));sfx.click()});
$("#cGo").onclick=()=>{if(cb)return;const a=getBet();if(!take(a))return;cb=1;const res=Math.random()<.5?0:1;cr=Math.ceil(cr/360)*360+1440+(res?180:0);
 $("#coin").style.transform=`rotateX(${cr}deg)`;$("#c3").classList.add("hop");sfx.roll();
 setTimeout(()=>{$("#c3").classList.remove("hop");cb=0;settle(res===cs?a*1.95:0,a,res?"Решка.":"Орел.")},1900)};

/* ---- 3. Dice ---- */
const PIPS=[[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]],DM={u:2.3,s:5.5,o:2.3};
const dieH=v=>[...Array(9)].map((_,i)=>`<s${PIPS[v-1].includes(i)?' class="on"':""}></s>`).join("");
const dSet=(a,b)=>{$("#d1").innerHTML=dieH(a);$("#d2").innerHTML=dieH(b)};dSet(3,4);
let dp="o",db=0;
$("#dpk").onclick=e=>{const b=e.target.closest(".pk");if(!b||db)return;dp=b.dataset.p;$$(".pk").forEach(x=>x.classList.toggle("on",x===b));sfx.click()};
$("#dGo").onclick=()=>{if(db)return;const k=getBet();if(!take(k))return;db=1;
 const ds=[$("#d1"),$("#d2")],r=()=>1+Math.random()*6|0;ds.forEach(d=>d.classList.add("r"));$("#dSum").textContent="…";
 const iv=setInterval(()=>dSet(r(),r()),90);sfx.roll();
 setTimeout(()=>{clearInterval(iv);const a=r(),b=r(),s=a+b;dSet(a,b);ds.forEach(d=>d.classList.remove("r"));$("#dSum").textContent=s;db=0;
  const w=dp==="u"?s<7:dp==="o"?s>7:s===7;settle(w?k*DM[dp]:0,k,`Випало ${a}+${b}=${s}.`)},1000)};

/* ---- 5. Blackjack ---- */
const B={d:[],p:[],dl:[],k:0,on:0};
const val=h=>{let t=0,a=0;h.forEach(c=>{const r=c.r+2;t+=r>=14?11:r>10?10:r;if(r===14)a++});while(t>21&&a){t-=10;a--}return t};
function bjR(hide){const f=(h,hd)=>h.map((c,i)=>hd&&i?`<div class="pc bk"></div>`:cardEl(c,i===h.length-1?"dl":"")).join("");$("#bd").innerHTML=f(B.dl,hide);$("#bp").innerHTML=f(B.p,0);$("#bdv").textContent=hide?"?":val(B.dl);$("#bpv").textContent=val(B.p)}
function bjBtn(){$("#bDeal").disabled=!!B.on;$("#bHit").disabled=$("#bStd").disabled=!B.on;$("#bDbl").disabled=!B.on||B.p.length>2}
function bjEnd(){B.on=0;bjR(0);bjBtn();const p=val(B.p),d=val(B.dl),pn=p===21&&B.p.length===2,dn=d===21&&B.dl.length===2;let r=0,t;
 if(p>21)t="Перебір!";else if(pn&&!dn){r=B.k*2.5;t="Блекджек!"}else if(dn&&!pn)t="Блекджек дилера.";else if(pn&&dn||p===d){r=B.k;t="Нічия."}else if(d>21||p>d){r=B.k*2;t="Ви перемогли."}else t="Дилер виграв.";settle(r,B.k,t)}
function bjStand(){if(!B.on)return;if(val(B.p)<=21)while(val(B.dl)<17)B.dl.push(B.d.pop());bjEnd()}
$("#bDeal").onclick=()=>{if(B.on)return;const a=getBet();if(!take(a))return;B.k=a;B.d=deck();B.p=[B.d.pop(),B.d.pop()];B.dl=[B.d.pop(),B.d.pop()];B.on=1;bjBtn();
 if(val(B.p)===21||val(B.dl)===21)return bjEnd();bjR(1);say("Ваш хід: взяти чи стояти?")};
$("#bHit").onclick=()=>{if(!B.on)return;B.p.push(B.d.pop());sfx.click();if(val(B.p)>=21)return bjStand();bjR(1);bjBtn()};
$("#bStd").onclick=bjStand;
$("#bDbl").onclick=()=>{if(!B.on||B.p.length>2||!take(B.k))return;B.k*=2;B.p.push(B.d.pop());bjStand()};
bjBtn();

/* ---- 6. Fortune Wheel ---- */
const FM=[0,.5,0,1,0,.5,2,0,.5,0,1,0,.5,0,3,0,.5,0,2,10,0,0,0,0];
const FC={0:"#2b2b30",.5:"#7a1d2b",1:"#0f7a55",2:"#b8902a",3:"#6c3fb5",10:"#c9a227"};
wheel($("#fw"),FM,m=>FC[m],m=>m+"×",300,12);let fb=0;
$("#fGo").onclick=()=>{if(fb)return;const a=getBet();if(!take(a))return;fb=1;const i=Math.floor(Math.random()*FM.length);spinTo($("#fw"),i,FM.length);sfx.spin();say("Колесо крутиться…");
 setTimeout(()=>{fb=0;settle(a*FM[i],a,`Множник ${FM[i]}×.`)},5200)};

setBet(1000);ui();checkAch();ui();
