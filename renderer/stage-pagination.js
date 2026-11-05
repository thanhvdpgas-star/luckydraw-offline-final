// V3.6.1 - Full prize winner pagination, keyboard navigation and responsive slots.
(()=>{
const PAGE_SIZE=8;let page=0,lastPrize='',lastCount=-1;
const q=s=>document.querySelector(s);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function draw(){
 const prize=data?.prizes?.[selected],host=q('#stageResults'),panel=q('.winnerPanel');
 if(!prize||!host||!panel)return;
 const rows=prizeResults(prize),pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
 if(lastPrize!==prize.id){page=0;lastPrize=prize.id}
 if(lastCount!==rows.length){page=pages-1;lastCount=rows.length}
 page=Math.min(Math.max(0,page),pages-1);
 const start=page*PAGE_SIZE,visible=rows.slice(start,start+PAGE_SIZE);
 host.innerHTML='<tr><th>STT</th><th>Mã trúng thưởng</th><th>Họ và tên</th><th>Bộ phận</th></tr>'+
 (visible.length?visible.map((r,i)=>'<tr><td>'+(start+i+1)+'</td><td>'+safe(r.code)+'</td><td>'+safe(r.name)+'</td><td>'+safe(r.position||r.company)+'</td></tr>').join(''):'<tr><td colspan="4" class="empty">Chưa có kết quả nào</td></tr>');
 let nav=q('#winnerPagination');if(!nav){nav=document.createElement('div');nav.id='winnerPagination';nav.className='winnerPagination';host.closest('.miniTable')?.after(nav)}
 if(!nav)return;
 nav.innerHTML='<span>Hiển thị '+(rows.length?start+1:0)+'–'+Math.min(start+PAGE_SIZE,rows.length)+' / '+rows.length+' người</span><div><button type="button" id="winnerPrev" '+(page===0?'disabled':'')+'>‹ Trước</button><strong>Trang '+(page+1)+' / '+pages+'</strong><button type="button" id="winnerNext" '+(page===pages-1?'disabled':'')+'>Sau ›</button></div>';
 q('#winnerPrev').onclick=()=>{page--;draw()};q('#winnerNext').onclick=()=>{page++;draw()};
}
const css=document.createElement('style');css.textContent=`
.winnerPanel{width:min(1160px,96vw)!important;max-width:96vw!important;min-height:0!important}
.winnerPanel .miniTable{padding:8px 14px!important;overflow:auto!important}
.winnerPanel .miniTable table{width:100%;table-layout:auto}
.winnerPanel .miniTable td,.winnerPanel .miniTable th{padding:9px 12px!important}
.winnerPagination{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 18px 13px;color:#ffe6a5;font-size:13px;flex-wrap:wrap}
.winnerPagination>div{display:flex;align-items:center;gap:12px}
.winnerPagination button{border:1px solid #ffe6a570;background:#68201b;color:#fff0c2;border-radius:8px;padding:6px 12px;cursor:pointer}
.winnerPagination button:disabled{opacity:.4;cursor:default}
#roller span{will-change:transform,filter;backface-visibility:hidden;transition:filter .15s ease,transform .15s ease}
#roller span.tileSpinning{animation:luckySmoothSpin .19s cubic-bezier(.3,0,.7,1) infinite alternate!important}
#roller span.tileLanded{animation:luckySmoothLand .46s cubic-bezier(.18,.9,.24,1.15) both!important}
@keyframes luckySmoothSpin{0%{transform:translateY(-10px) scaleY(.94);filter:blur(1.8px) brightness(.9)}100%{transform:translateY(10px) scaleY(1.04);filter:blur(.4px) brightness(1.18)}}
@keyframes luckySmoothLand{0%{transform:translateY(-17px) scale(.95);filter:blur(2px)}65%{transform:translateY(5px) scale(1.05);filter:blur(0)}100%{transform:translateY(0) scale(1);filter:none}}
@media(max-width:700px){.winnerPagination{justify-content:center}.winnerPanel .miniTable td,.winnerPanel .miniTable th{padding:7px 5px!important;font-size:12px}}
`;document.head.appendChild(css);
const old=window.renderPrizes;if(typeof old==='function')window.renderPrizes=function(...args){const r=old.apply(this,args);setTimeout(draw,0);return r};
const oldStage=window.stage;if(typeof oldStage==='function')window.stage=function(...args){const r=oldStage.apply(this,args);setTimeout(draw,0);return r};
q('.winnerPanel .tabs')?.addEventListener('click',()=>setTimeout(draw,0));
q('#drawBtn')?.addEventListener('click',()=>setTimeout(draw,0));
document.addEventListener('lucky:manual-result',()=>setTimeout(draw,50));
setTimeout(draw,500);
})();