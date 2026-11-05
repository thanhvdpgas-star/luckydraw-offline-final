// Accessible per-prize settings panel, no browser prompt dialogs.
(()=>{
const q=s=>document.querySelector(s);
const style=document.createElement('style');style.textContent=`
#prizeConfigOverlay{position:fixed;inset:0;z-index:200;background:#090412c9;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(7px)}
#prizeConfigOverlay[hidden]{display:none!important}
#prizeConfigOverlay .pcBox{width:min(600px,96vw);max-height:90vh;overflow:auto;background:linear-gradient(140deg,#36185c,#1b1031);border:1px solid #a06bd6;border-radius:18px;padding:24px;color:white;box-shadow:0 20px 80px #0009}
#prizeConfigOverlay .pcGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}
#prizeConfigOverlay label{display:flex;flex-direction:column;gap:7px;font-weight:600}
#prizeConfigOverlay input,#prizeConfigOverlay select{width:100%;min-width:0}
#prizeConfigOverlay .pcActions{display:flex;justify-content:flex-end;gap:12px}
#prizeConfigOverlay button{padding:10px 18px;border-radius:9px;border:1px solid #ffffff44;background:#ffffff15;color:white;cursor:pointer}
#prizeConfigOverlay button.pcSave{background:#f0c44e;color:#38121b;font-weight:800}
@media(max-width:560px){#prizeConfigOverlay .pcGrid{grid-template-columns:1fr}}
`;document.head.appendChild(style);
const modal=document.createElement('div');modal.id='prizeConfigOverlay';modal.hidden=true;document.body.appendChild(modal);
let prizeId='';
const option=(value,label,selected)=>'<option value="'+value+'" '+(value===selected?'selected':'')+'>'+label+'</option>';
function open(i){
 const p=data.prizes[i];if(!p)return;prizeId=p.id;
 modal.innerHTML='<div class="pcBox" role="dialog" aria-modal="true" aria-labelledby="pcHeading"><h2 id="pcHeading">Cấu hình: '+esc(p.name)+'</h2><div class="pcGrid">'+
 '<label>Kiểu quay<select id="pcType">'+option('AUTO','Tự động',p.drawType||'AUTO')+option('MANUAL','Bấm bắt đầu / bấm dừng',p.drawType||'AUTO')+'</select></label>'+
 '<label>Hiệu ứng ô số<select id="pcStyle">'+option('standard','Tiêu chuẩn',p.drawStyle||'standard')+option('multi_row','Nhiều hàng',p.drawStyle)+option('staged','Dừng lần lượt',p.drawStyle)+option('globe','Vòng quay',p.drawStyle)+'</select></label>'+
 '<label>Thời gian quay tự động (giây)<input id="pcSpin" type="number" min="1" max="60" step="0.5" value="'+(+p.spinTime||3)+'"></label>'+
 '<label>Thời gian dừng thủ công (giây)<input id="pcStop" type="number" min="0.1" max="10" step="0.1" value="'+(+p.stopDuration||1)+'"></label>'+
 '<label>Số người trúng giải<input id="pcQty" type="number" min="1" max="100000" value="'+p.qty+'"></label>'+
 '<label>Số người mỗi lần quay<input id="pcBatch" type="number" min="1" max="100000" value="'+p.drawCount+'"></label>'+
 '</div><div class="pcActions"><button id="pcCancel" type="button">Hủy</button><button id="pcSave" class="pcSave" type="button">Lưu cấu hình</button></div></div>';
 modal.hidden=false;q('#pcCancel').onclick=close;q('#pcSave').onclick=async()=>{
  const current=data.prizes.find(x=>x.id===prizeId);if(!current)return close();
  const qty=Math.floor(+q('#pcQty').value),batch=Math.floor(+q('#pcBatch').value),spin=+q('#pcSpin').value,stop=+q('#pcStop').value;
  const drawn=prizeResults(current).length;
  if(!Number.isInteger(qty)||qty<Math.max(1,drawn)||!Number.isInteger(batch)||batch<1||batch>qty||!Number.isFinite(spin)||spin<1||spin>60||!Number.isFinite(stop)||stop<.1||stop>10)return alert('Thông số không hợp lệ. Tổng số người không được nhỏ hơn số đã quay ('+drawn+').');
  Object.assign(current,{drawType:q('#pcType').value,drawStyle:q('#pcStyle').value,spinTime:spin,stopDuration:stop,qty,drawCount:batch});
  await save();close();renderPrizes();window.LuckyPrizeRuntime?.apply();
 };
 q('#pcType').focus();
}
function close(){modal.hidden=true;modal.innerHTML='';prizeId=''}
modal.addEventListener('click',e=>{if(e.target===modal)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){e.stopImmediatePropagation();close()}},true);
document.addEventListener('click',e=>{
 const btn=e.target.closest?.('.runtimeEdit');if(!btn)return;
 const card=btn.closest('.card'),cards=[...document.querySelectorAll('#prizeList .card')],i=cards.indexOf(card);
 if(i<0)return;e.preventDefault();e.stopImmediatePropagation();open(i);
},true);
})();